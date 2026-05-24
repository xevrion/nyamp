use crate::{
    app::models,
    features::{library::scanner, player::engine},
};

pub mod app;
pub mod features;

/// Simple command used by the UI as a smoke test for the Tauri bridge.
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Tauri command that scans one or more music folders.
///
/// The command delegates to the library scanner and returns a partial-success
/// response containing both discovered tracks and any folder-level failures.
#[tauri::command]
fn scan_folder_cmd(paths: Vec<String>) -> models::ScanFoldersResponse {
    scanner::scan_folders(paths)
}

// ── Player commands ──────────────────────────────────────────────────────────
//
// Each command takes the `PlayerEngine` from managed state and delegates to it.
// Errors are returned as plain strings so the frontend can display them.

/// Load a track by file path and begin playback immediately.
#[tauri::command]
fn player_play(
    path: String,
    engine: tauri::State<engine::PlayerEngine>,
) -> Result<(), String> {
    engine.play(&path)
}

/// Pause the current track. No-op when nothing is playing.
#[tauri::command]
fn player_pause(engine: tauri::State<engine::PlayerEngine>) {
    engine.pause();
}

/// Resume a paused track. No-op when nothing is loaded.
#[tauri::command]
fn player_resume(engine: tauri::State<engine::PlayerEngine>) {
    engine.resume();
}

/// Stop playback and unload the current track.
#[tauri::command]
fn player_stop(engine: tauri::State<engine::PlayerEngine>) {
    engine.stop();
}

/// Seek to a position in the current track.
///
/// `seconds` is the target offset from the beginning of the track. Returns an
/// error when no track is loaded or the decoder does not support seeking.
#[tauri::command]
fn player_seek(
    seconds: f64,
    engine: tauri::State<engine::PlayerEngine>,
) -> Result<(), String> {
    engine.seek(seconds)
}

/// Set the playback volume.
///
/// `volume` should be in [0.0, 1.0]. The frontend is expected to pass
/// `sliderValue / 100` so a slider of 0–100 maps to the correct range.
#[tauri::command]
fn player_set_volume(volume: f32, engine: tauri::State<engine::PlayerEngine>) {
    engine.set_volume(volume);
}

/// Return a snapshot of current playback state for the frontend to display.
#[tauri::command]
fn player_get_state(
    engine: tauri::State<engine::PlayerEngine>,
) -> engine::PlayerState {
    engine.state()
}

/// Build and run the Tauri application.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialise the player engine; panic early if the audio device is missing
    // rather than producing a confusing error later on first play.
    let player = engine::PlayerEngine::try_new()
        .expect("Failed to open audio output device");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(player)
        .invoke_handler(tauri::generate_handler![
            greet,
            scan_folder_cmd,
            player_play,
            player_pause,
            player_resume,
            player_stop,
            player_seek,
            player_set_volume,
            player_get_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
