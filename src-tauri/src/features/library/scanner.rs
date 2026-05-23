//! Library scanning logic.
//!
//! This module scans music folders, parses audio metadata with `lofty`, and
//! returns serializable track data for the frontend. Single-folder scans can
//! fail only when the root path is missing or unreadable; multi-folder scans
//! keep going and report per-folder failures.
use base64::{engine::general_purpose::STANDARD, Engine};
use std::{collections::HashSet, path::Path};

use chrono::{DateTime, Utc};
use lofty::{
    file::{AudioFile, TaggedFileExt},
    picture::PictureType,
    read_from_path,
    tag::ItemKey,
};

use walkdir::WalkDir;

use crate::app::models::{self, Track};

/// Return true if the file extension indicates a supported audio format.
fn is_audio_ext(ext: &str) -> bool {
    matches!(ext, "mp3" | "flac" | "m4a" | "wav" | "ogg" | "opus")
}

/// Scan one folder recursively and return any tracks that could be parsed.
///
/// Unsupported files and unreadable audio files are skipped. The function only
/// returns `Err` when the folder itself is missing or a filesystem metadata
/// read fails.
pub fn scan_folder(path: &str) -> Result<Vec<Track>, String> {
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

                let Ok(tagged_file) = read_from_path(p) else {
                    continue;
                };

                let tag = tagged_file
                    .primary_tag()
                    .or_else(|| tagged_file.first_tag());

                let title = tag
                    .and_then(|t| t.get_string(ItemKey::TrackTitle))
                    .map(|s| s.to_owned())
                    .unwrap_or_else(|| {
                        p.file_stem()
                            .and_then(|s| s.to_str())
                            .unwrap_or("Unknown")
                            .to_string()
                    });

                let artist = tag
                    .and_then(|t| t.get_string(ItemKey::TrackArtist))
                    .map(|s| s.to_owned())
                    .unwrap_or_else(|| "Unknown Artist".to_string());

                let album = tag
                    .and_then(|t| t.get_string(ItemKey::AlbumTitle))
                    .map(|s| s.to_owned())
                    .unwrap_or_else(|| "Unknown Album".to_string());

                let duration_secs = tagged_file.properties().duration().as_secs();
                let duration = format!("{}:{:02}", duration_secs / 60, duration_secs % 60);

                let Ok(metadata) = std::fs::metadata(p) else {
                    continue;
                };

                let Ok(modified_time) = metadata.modified() else {
                    continue;
                };

                // Convert SystemTime to DateTime<Utc>
                let datetime: DateTime<Utc> = modified_time.into();

                // Format as ISO 8601 string for added_at
                let added_at = datetime.to_rfc3339();

                let path_str = p.to_string_lossy().to_string();

                // Get Cover Art from embedded metadata and format it into MIME encoding.
                let cover_url = tag
                    .and_then(|t| {
                        t.get_picture_type(PictureType::CoverFront)
                            .or_else(|| t.pictures().first())
                    })
                    .map(|pic| {
                        let mime = pic.mime_type().map(|m| m.as_str()).unwrap_or("image/jpeg");

                        format!("data:{};base64,{}", mime, STANDARD.encode(pic.data()))
                    });

                out.push(Track {
                    id: path_str.clone(),
                    title,
                    artist,
                    album,
                    added_at,
                    cover_url,
                    duration,
                });
            }
        }
    }

    Ok(out)
}

/// Scan multiple folders and combine the results into a single response.
///
/// Failed folders are reported in `failures`, while successful folders still
/// contribute tracks to the final response.
pub fn scan_folders(paths: Vec<String>) -> models::ScanFoldersResponse {
    let mut all_tracks = Vec::new();
    let mut failures = Vec::new();
    let mut seen = HashSet::new();

    for path in paths {
        match scan_folder(&path) {
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
    fn scan_empty_dir_returns_empty() {
        let dir = make_temp_dir();

        let result = scan_folder(dir.to_str().unwrap()).unwrap();

        assert!(result.is_empty());

        fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn scan_folder_skips_invalid_audio_files() {
        let dir = make_temp_dir();

        fs::write(dir.join("broken.mp3"), b"dummy").unwrap();
        fs::write(dir.join("note.txt"), b"not audio").unwrap();

        let result = scan_folder(dir.to_str().unwrap()).unwrap();

        assert!(result.is_empty());

        fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn scan_folders_reports_partial_failures() {
        let dir = make_temp_dir();
        let missing = "/definitely/not/a/real/path".to_string();

        let res = crate::features::library::scanner::scan_folders(vec![
            dir.to_str().unwrap().to_string(),
            missing.clone(),
        ]);

        assert!(res.tracks.is_empty());
        assert_eq!(res.failures.len(), 1);
        assert_eq!(res.failures[0].path, missing);

        fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn returns_err_for_missing_path() {
        let err = scan_folder("/definitely/not/a/real/path").unwrap_err();
        assert!(err.contains("Path does not exist"));
    }
}
