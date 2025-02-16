use sysinfo::{ProcessExt, System, SystemExt};
use std::collections::HashMap;
use serde::Serialize;
use tauri::{Manager, Emitter};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use once_cell::sync::Lazy;

static IS_MONITORING: Lazy<Arc<AtomicBool>> = Lazy::new(|| Arc::new(AtomicBool::new(false)));

#[derive(Serialize, Clone, Debug)]
struct MinecraftCredentials {
    uuid: String,
    access_token: String,
    username: String,
    #[serde(rename = "gameDir")]
    game_dir: String,
    #[serde(rename = "clientId")]
    client_id: String,
    xuid: String,
    #[serde(rename = "userType")]
    user_type: String,
}

pub fn monitor_minecraft_process(app_handle: tauri::AppHandle) -> bool {
    let mut sys = System::new_all();
    sys.refresh_all();

    for (_pid, process) in sys.processes() {
        if process.name().contains("javaw") {
            // Get command line arguments
            if let Some(args) = parse_minecraft_args(process.cmd()) {
                println!("Found Minecraft process with args: {:?}", args);
                
                // Create credentials with proper field mapping
                let credentials = MinecraftCredentials {
                    uuid: args.get("uuid").unwrap_or(&String::new()).to_string(),
                    access_token: args.get("accessToken").unwrap_or(&String::new()).to_string(),
                    username: args.get("username").unwrap_or(&String::new()).to_string(),
                    game_dir: args.get("gameDir").unwrap_or(&String::new()).to_string(),
                    client_id: args.get("clientId").unwrap_or(&String::new()).to_string(),
                    xuid: args.get("xuid").unwrap_or(&String::new()).to_string(),
                    user_type: args.get("userType").unwrap_or(&String::new()).to_string(),
                };

                println!("Storing credentials: {:?}", credentials);

                // Store all credentials
                let _ = super::settings::set_setting(
                    app_handle.clone(),
                    "minecraft_uuid".into(),
                    credentials.uuid.clone(),
                );
                let _ = super::settings::set_setting(
                    app_handle.clone(),
                    "minecraft_access_token".into(),
                    credentials.access_token.clone(),
                );
                let _ = super::settings::set_setting(
                    app_handle.clone(),
                    "minecraft_username".into(),
                    credentials.username.clone(),
                );
                let _ = super::settings::set_setting(
                    app_handle.clone(),
                    "minecraft_game_dir".into(),
                    credentials.game_dir.clone(),
                );
                let _ = super::settings::set_setting(
                    app_handle.clone(),
                    "minecraft_client_id".into(),
                    credentials.client_id.clone(),
                );
                let _ = super::settings::set_setting(
                    app_handle.clone(),
                    "minecraft_xuid".into(),
                    credentials.xuid.clone(),
                );
                let _ = super::settings::set_setting(
                    app_handle.clone(),
                    "minecraft_user_type".into(),
                    credentials.user_type.clone(),
                );

                // Get the main window and emit the event
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.emit("minecraft-credentials-updated", &credentials);
                }
                return true;
            }
        }
    }
    false
}

fn parse_minecraft_args(cmd: &[String]) -> Option<HashMap<String, String>> {
    let mut args = HashMap::new();
    let mut current_key: Option<String> = None;

    for arg in cmd {
        if arg.starts_with("--") {
            current_key = Some(arg[2..].to_string());
        } else if let Some(key) = current_key.take() {
            args.insert(key, arg.clone());
        }
    }

    // Only require uuid, accessToken, and username
    if args.contains_key("uuid") && args.contains_key("accessToken") && args.contains_key("username") {
        Some(args)
    } else {
        None
    }
}

#[tauri::command]
pub async fn start_minecraft_monitoring(app_handle: tauri::AppHandle) {
    // If already monitoring, don't start another thread
    if IS_MONITORING.load(Ordering::SeqCst) {
        return;
    }

    IS_MONITORING.store(true, Ordering::SeqCst);
    println!("Starting Minecraft monitoring thread");

    std::thread::spawn(move || {
        while IS_MONITORING.load(Ordering::SeqCst) {
            if monitor_minecraft_process(app_handle.clone()) {
                IS_MONITORING.store(false, Ordering::SeqCst);
                break;
            }
            std::thread::sleep(std::time::Duration::from_secs(5));
        }
    });
}

#[tauri::command]
pub async fn stop_minecraft_monitoring(app_handle: tauri::AppHandle) {
    IS_MONITORING.store(false, Ordering::SeqCst);
    if let Some(window) = app_handle.get_webview_window("main") {
        let _ = window.emit("minecraft-monitoring-error", "Monitoring stopped by user");
    }
    println!("Monitoring stopped by user");
}

#[tauri::command]
pub async fn is_monitoring() -> bool {
    IS_MONITORING.load(Ordering::SeqCst)
}