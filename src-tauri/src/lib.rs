// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::Serialize;
use std::time::Instant;
use tokio::net::TcpStream;
use craftping::{tokio::ping, Chat};
use tokio::net::lookup_host;

#[derive(Debug, Serialize, Clone)]
pub struct ServerMetadata {
    name: String,
    motd: String,
    version: String,
    player_count: u32,
    max_players: u32,
    players: Vec<String>,
    favicon_url: Option<String>,
    is_online: bool,
    latency: u64,
    server_type: ServerType,
}

#[derive(Debug, Serialize, Clone)]
pub enum ServerType {
    Java,
    Bedrock
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Network(#[from] reqwest::Error),
    #[error("Failed to connect to server: {0}")]
    Connection(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("Server ping failed: {0}")]
    PingError(String),
}

// Implement serialize for our Error type
impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

mod commands {
    use super::*;

    #[tauri::command]
    pub async fn get_server_metadata(address: String, port: Option<u16>) -> Result<ServerMetadata, Error> {
        // Parse address and resolve port
        let (resolved_address, resolved_port) = resolve_server_address(&address, port).await?;

        println!("Resolved address: {}:{}", resolved_address, resolved_port);

        // Try Java server first
        match query_java_server(&resolved_address, resolved_port).await {
            Ok(metadata) => Ok(metadata),
            Err(java_err) => {
                // If Java fails, try Bedrock with the same resolved address
                match query_bedrock_server(&resolved_address, resolved_port).await {
                    Ok(metadata) => Ok(metadata),
                    Err(_) => Err(java_err)
                }
            }
        }
    }
}

mod settings;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_server_metadata,
            settings::get_setting,
            settings::set_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn query_java_server(address: &str, port: u16) -> Result<ServerMetadata, Error> {
    let start = Instant::now();
    
    // Single connection attempt
    let mut stream = TcpStream::connect((address, port))
        .await
        .map_err(|e| Error::Connection(e.to_string()))?;

    // Simple ping without protocol validation
    match ping(&mut stream, address, port).await {
        Ok(response) => {
            let latency = start.elapsed().as_millis() as u64;
            
            // Extract player list if available
            let players = response.sample
                .map(|sample| {
                    sample.iter()
                        .map(|p| p.name.clone())
                        .collect()
                })
                .unwrap_or_else(|| Vec::new());

            // Convert favicon from PNG bytes to base64 URL if available
            let favicon_url = response.favicon.as_ref().map(|bytes| {
                format!("data:image/png;base64,{}", base64::encode(bytes))
            });

            // Extract MOTD text from Chat component
            let motd = extract_chat_text(&response.description);

            Ok(ServerMetadata {
                name: response.version.clone(),
                motd,
                version: response.version,  // Just show the version string as-is
                player_count: response.online_players as u32,
                max_players: response.max_players as u32,
                players,
                favicon_url,
                is_online: true,
                latency,
                server_type: ServerType::Java
            })
        }
        Err(e) => Err(Error::PingError(e.to_string()))
    }
}

// Helper function to extract text from Chat component
fn extract_chat_text(chat: &Chat) -> String {
    let mut text = chat.text.clone();
    for extra in &chat.extra {
        text.push_str(&extract_chat_text(extra));
    }
    text
}

async fn query_bedrock_server(_address: &str, _port: u16) -> Result<ServerMetadata, Error> {
    // TODO: Implement Bedrock server query
    // For now, return error as we're focusing on Java servers
    Err(Error::PingError("Bedrock servers not yet supported".to_string()))
}

// Helper function to resolve server address
async fn resolve_server_address(address: &str, port: Option<u16>) -> Result<(String, u16), Error> {
    // Default Minecraft port
    const DEFAULT_PORT: u16 = 25565;

    // If port is explicitly provided via parameter, use it
    if let Some(explicit_port) = port {
        return Ok((address.to_string(), explicit_port));
    }

    // Check if address includes port (e.g., "example.com:25565")
    if let Some((host, port_str)) = address.rsplit_once(':') {
        if let Ok(port_num) = port_str.parse::<u16>() {
            return Ok((host.to_string(), port_num));
        }
    }

    // Try SRV record lookup first
    let srv_address = format!("_minecraft._tcp.{}", address);
    if let Ok(addrs) = lookup_host(&srv_address).await {
        let addrs: Vec<_> = addrs.collect();
        if let Some(addr) = addrs.first() {
            return Ok((addr.ip().to_string(), addr.port()));
        }
    }

    // No SRV record found, use default port
    Ok((address.to_string(), DEFAULT_PORT))
}