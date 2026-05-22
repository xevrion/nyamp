use std::{path::Path, time::UNIX_EPOCH};

use serde::Serialize;
use walkdir::WalkDir;

#[derive(Debug, Serialize)]
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn make_temp_dir() -> std::path::PathBuf {
        let mut dir = std::env::temp_dir();
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        dir.push(format!("nyamp_scan_test_{}", unique));
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn scans_only_audio_files() {
        let dir = make_temp_dir();

        // Top-level files
        fs::write(dir.join("song1.mp3"), b"dummy").unwrap();
        fs::write(dir.join("song2.flac"), b"dummy").unwrap();
        fs::write(dir.join("note.txt"), b"not audio").unwrap();

        // Nested folder
        let nested = dir.join("nested");
        fs::create_dir_all(&nested).unwrap();
        fs::write(nested.join("song3.ogg"), b"dummy").unwrap();

        let result = scan_folder(dir.to_str().unwrap()).unwrap();

        // Only mp3/flac/ogg should be included
        assert_eq!(result.len(), 3);

        let mut exts: Vec<String> = result.iter().map(|t| t.extension.clone()).collect();
        exts.sort();
        assert_eq!(exts, vec!["flac", "mp3", "ogg"]);

        // cleanup
        fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn returns_err_for_missing_path() {
        let err = scan_folder("/definitely/not/a/real/path").unwrap_err();
        assert!(err.contains("Path does not exist"));
    }
}
