use sysinfo::{ProcessExt, System, SystemExt};
use std::collections::HashMap;
use serde::Serialize;
use tauri::{Manager, Emitter};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use once_cell::sync::Lazy;

static IS_MONITORING: Lazy<Arc<AtomicBool>> = Lazy::new(|| Arc::new(AtomicBool::new(false)));

#[derive(Serialize, Clone)]
struct MinecraftCredentials {
    uuid: String,
    access_token: String,
    username: String,
}

pub fn monitor_minecraft_process(app_handle: tauri::AppHandle) -> bool {
    let mut sys = System::new_all();
    sys.refresh_all();

    for (_pid, process) in sys.processes() {
        if process.name().contains("javaw") {
            // Get command line arguments
            if let Some(args) = parse_minecraft_args(process.cmd()) {
                let credentials = MinecraftCredentials {
                    uuid: args.get("uuid").unwrap_or(&String::new()).clone(),
                    access_token: args.get("accessToken").unwrap_or(&String::new()).clone(),
                    username: args.get("username").unwrap_or(&String::new()).clone(),
                };

                // Store the credentials
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

                // Get the main window and emit the event
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.emit("minecraft-credentials-updated", credentials);
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