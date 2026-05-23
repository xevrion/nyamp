use crate::{app::models, features::library::scanner};

pub mod app;
pub mod features;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn scan_folder_cmd(paths: Vec<String>) -> Result<Vec<models::Track>, String> {
    let mut all_tracks = Vec::new();

    for path in paths {
        let mut tracks = scanner::scan_folder(&path)?;
        all_tracks.append(&mut tracks);
    }

    Ok(all_tracks)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, scan_folder_cmd])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
