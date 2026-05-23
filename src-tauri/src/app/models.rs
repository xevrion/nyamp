use serde::Serialize;

/// Serializable track metadata shared with the frontend.
///
/// This type represents one audio file discovered during a folder scan.
/// Field-level docs describe the exact meaning of each property.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Track {
    /// File path used as the track id.
    pub id: String,
    /// Track title (from tags or file stem fallback).
    pub title: String,
    /// Track artist (from tags or `Unknown Artist`).
    pub artist: String,
    /// Album title (from tags or `Unknown Album`).
    pub album: String,
    /// ISO 8601 / RFC3339 timestamp (UTC) representing file modification time.
    pub added_at: String,
    /// Duration string in `M:SS` format.
    pub duration: String,
    /// Optional image data URI for embedded artwork.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cover_url: Option<String>,
}

/// A folder-level scan failure returned by the multi-folder scan command.
///
/// This is used to report which folder failed and why, while still returning
/// tracks discovered in the remaining folders.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderScanFailure {
    /// Folder path that failed to scan.
    pub path: String,
    /// Human-readable error message for the failure.
    pub error: String,
}

/// Combined result from scanning multiple folders.
///
/// Successful tracks are returned in `tracks`. Any folder that could not be
/// scanned is listed in `failures` so the caller can show a partial-success
/// result instead of failing the whole operation.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanFoldersResponse {
    /// All tracks found across the provided folders, deduplicated by path.
    pub tracks: Vec<Track>,
    /// Per-folder scan failures collected during the scan.
    pub failures: Vec<FolderScanFailure>,
}
