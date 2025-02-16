// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod minecraft;
mod settings;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            settings::get_setting,
            settings::set_setting,
            minecraft::start_minecraft_monitoring,
            minecraft::stop_minecraft_monitoring,
            minecraft::is_monitoring,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
