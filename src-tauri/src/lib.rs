use std::collections::HashSet;

use crate::{app::models, features::library::scanner};

pub mod app;
pub mod features;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn scan_folder_cmd(paths: Vec<String>) -> models::ScanFoldersResponse {
    let mut all_tracks = Vec::new();
    let mut failures = Vec::new();
    let mut seen = HashSet::new();

    for path in paths {
        match scanner::scan_folder(&path) {
            Ok(tracks) => {
                for track in tracks {
                    if seen.insert(track.id.clone()) {
                        all_tracks.push(track);
                    }
                }
            }
            Err(error) => failures.push(models::FolderScanFailure { path, error }),
        }
    }

    models::ScanFoldersResponse {
        tracks: all_tracks,
        failures,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, scan_folder_cmd])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
