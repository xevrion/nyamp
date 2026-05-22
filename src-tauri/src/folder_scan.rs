use std::{path::Path, time::SystemTime};

use chrono::{DateTime, Utc};
use lofty::{
    file::{AudioFile, TaggedFileExt},
    read_from_path,
    tag::ItemKey,
};
use serde::Serialize;
use walkdir::WalkDir;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Track {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub added_at: String,
    pub duration: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cover_url: Option<String>,
}

fn is_audio_ext(ext: &str) -> bool {
    matches!(ext, "mp3" | "flac" | "m4a" | "wav" | "ogg" | "opus")
}

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

                let metadata = std::fs::metadata(p).map_err(|e| e.to_string())?; // Result<Metadata, Error> -> Metadata
                let modified_time: SystemTime = metadata.modified().map_err(|e| e.to_string())?; // Result<SystemTime, Error> -> SystemTime

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
        let dir = Path::new("/home/chish/Music/");

        // Nested folder
        let nested = dir.join("nested");
        fs::create_dir_all(&nested).unwrap();
        fs::write(nested.join("song3.ogg"), b"dummy").unwrap();

        let result = scan_folder(dir.to_str().unwrap()).unwrap();

        // Invalid audio blobs should be skipped instead of crashing the scan
        assert_eq!(result.len(), 3);
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
    fn returns_err_for_missing_path() {
        let err = scan_folder("/definitely/not/a/real/path").unwrap_err();
        assert!(err.contains("Path does not exist"));
    }

    #[test]
    fn print_scan_json() {
        let result = scan_folder("/home/chish/Music").unwrap();
        println!("{}", serde_json::to_string_pretty(&result).unwrap());
    }
}
