use serde::Serialize;

/// A serializable representation of a discovered audio track.
///
/// Fields are intentionally simple to match the frontend contract:
/// - `id`: absolute path used as an identifier for the file.
/// - `title`, `artist`, `album`: values taken from metadata tags, or
///   sensible fallbacks when missing.
/// - `addedAt`: RFC3339 timestamp of the file modification time.
/// - `duration`: human-readable duration formatted `M:SS`.
/// - `coverUrl`: optional data URI (e.g. `data:image/jpeg;base64,...`) containing
///   embedded artwork when present; omitted when not available.
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
