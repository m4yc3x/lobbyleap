// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::Serialize;
use std::time::Instant;
use tokio::net::TcpStream;
use craftping::{tokio::ping, Chat};

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
        // Try Java server first (default port 25565)
        match query_java_server(&address, port.unwrap_or(25565)).await {
            Ok(metadata) => Ok(metadata),
            Err(java_err) => {
                // If Java fails, try Bedrock
                match query_bedrock_server(&address, port.unwrap_or(19132)).await {
                    Ok(metadata) => Ok(metadata),
                    Err(_) => {
                        // Return the Java error as it's more likely to be the intended protocol
                        Err(java_err)
                    }
                }
            }
        }
    }
}

mod settings;
mod minecraft;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_server_metadata,
            settings::get_setting,
            settings::set_setting,
            minecraft::start_minecraft_monitoring,
            minecraft::stop_minecraft_monitoring,
            minecraft::is_monitoring
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn query_java_server(address: &str, port: u16) -> Result<ServerMetadata, Error> {
    let start = Instant::now();
    
    // Connect to the server using tokio's async TcpStream
    let mut stream = TcpStream::connect((address, port))
        .await
        .map_err(|e| Error::Connection(e.to_string()))?;

    // Ping the server
    let response = ping(&mut stream, address, port)
        .await
        .map_err(|e| Error::PingError(e.to_string()))?;

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

    println!("Server version: {}", response.version);

    Ok(ServerMetadata {
        name: response.version.clone(),
        motd,
        version: format!("Protocol: {}", response.protocol),
        player_count: response.online_players as u32,
        max_players: response.max_players as u32,
        players,
        favicon_url,
        is_online: true,
        latency,
        server_type: ServerType::Java
    })
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