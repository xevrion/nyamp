use std::{path::Path, time::UNIX_EPOCH};

use serde::Serialize;
use walkdir::WalkDir;

#[derive(Serialize)]
pub struct ScannedTrack {
    pub id: String,
    pub title: String,
    pub path: String,
    pub extension: String,
    pub size: u64,
    pub modified: Option<u64>,
}

fn is_audio_ext(ext: &str) -> bool {
    matches!(ext, "mp3" | "flac" | "m4a" | "wav" | "ogg" | "opus")
}

pub fn scan_folder(path: &str) -> Result<Vec<ScannedTrack>, String> {
    let mut out = Vec::new();
    let root = Path::new(path);

    if !root.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    for entry in WalkDir::new(root)
        .follow_links(false)
        .into_iter()
        .filter_map(Result::ok)
    {
        let p = entry.path();

        if !p.is_file() {
            continue;
        }

        if let Some(ext_os) = p.extension() {
            if let Some(ext) = ext_os.to_str().map(|s| s.to_lowercase()) {
                if !is_audio_ext(&ext) {
                    continue;
                }

                let meta = p.metadata().map_err(|e| e.to_string())?;
                let modified = meta
                    .modified()
                    .ok()
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok().map(|t| t.as_secs()));

                let title = p
                    .file_stem()
                    .and_then(|s| s.to_str())
                    .unwrap_or("Unknown")
                    .to_string();
                let path_str = p.to_string_lossy().to_string();

                out.push(ScannedTrack {
                    id: path_str.clone(),
                    title,
                    path: path_str,
                    extension: ext,
                    size: meta.len(),
                    modified,
                });
            }
        }
    }

    Ok(out)
}
