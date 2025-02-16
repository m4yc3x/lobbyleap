use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{self, Read};
use std::path::PathBuf;
use thiserror::Error;
use tauri::Manager;

const DELIMITER: u8 = 0x1F; // Unit separator
const RECORD_SEP: u8 = 0x1E; // Record separator

#[derive(Debug, Error)]
pub enum SettingsError {
    #[error("IO error: {0}")]
    Io(#[from] io::Error),
    #[error("Failed to parse settings: {0}")]
    Parse(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    values: HashMap<String, String>,
    file_path: PathBuf,
}

impl Settings {
    pub fn new(file_path: PathBuf) -> Result<Self, SettingsError> {
        let settings = if file_path.exists() {
            let mut file = File::open(&file_path)?;
            let mut bytes = Vec::new();
            file.read_to_end(&mut bytes)?;
            Self::parse_bytes(&bytes, file_path)?
        } else {
            let settings = Settings {
                values: HashMap::new(),
                file_path,
            };
            settings.save()?;
            settings
        };

        Ok(settings)
    }

    fn parse_bytes(bytes: &[u8], file_path: PathBuf) -> Result<Self, SettingsError> {
        let mut values = HashMap::new();
        let mut current_record = Vec::new();

        for &byte in bytes {
            if byte == RECORD_SEP {
                if !current_record.is_empty() {
                    let record = String::from_utf8(current_record.clone())
                        .map_err(|e| SettingsError::Parse(e.to_string()))?;
                    
                    let parts: Vec<&str> = record.split(char::from(DELIMITER)).collect();
                    if parts.len() == 2 {
                        values.insert(parts[0].to_string(), parts[1].to_string());
                    }
                    current_record.clear();
                }
            } else {
                current_record.push(byte);
            }
        }

        Ok(Settings { values, file_path })
    }

    pub fn get(&self, key: &str) -> Option<&String> {
        self.values.get(key)
    }

    pub fn set(&mut self, key: String, value: String) -> Result<(), SettingsError> {
        self.values.insert(key, value);
        self.save()
    }

    pub fn save(&self) -> Result<(), SettingsError> {
        let mut bytes = Vec::new();

        for (key, value) in &self.values {
            bytes.extend_from_slice(key.as_bytes());
            bytes.push(DELIMITER);
            bytes.extend_from_slice(value.as_bytes());
            bytes.push(RECORD_SEP);
        }

        fs::write(&self.file_path, &bytes)?;
        Ok(())
    }
}

#[tauri::command]
pub async fn get_setting(app_handle: tauri::AppHandle, key: String) -> Result<Option<String>, String> {
    let app_dir = app_handle.path().app_config_dir()
        .map_err(|e| format!("Failed to get app config directory: {}", e))?;
    
    // Create the directory if it doesn't exist
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create settings directory: {}", e))?;
    
    let settings_path = app_dir.join("settings.bin");
    let settings = Settings::new(settings_path)
        .map_err(|e| e.to_string())?;

    Ok(settings.get(&key).cloned())
}

#[tauri::command]
pub async fn set_setting(app_handle: tauri::AppHandle, key: String, value: String) -> Result<(), String> {
    let app_dir = app_handle.path().app_config_dir()
        .map_err(|e| format!("Failed to get app config directory: {}", e))?;
    
    // Create the directory if it doesn't exist
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create settings directory: {}", e))?;
    
    let settings_path = app_dir.join("settings.bin");
    let mut settings = Settings::new(settings_path)
        .map_err(|e| e.to_string())?;

    settings.set(key, value)
        .map_err(|e| e.to_string())
}
