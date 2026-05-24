//! Audio playback engine.
//!
//! Wraps rodio 0.22's `MixerDeviceSink` + `Player` pair into a thread-safe
//! handle suitable for Tauri's managed state. The design keeps the device sink
//! alive for the lifetime of the app (it owns the OS stream), and creates a
//! fresh `Player` per track so that stop/play semantics are clean.
//!
//! All public methods take `&self` — the internal mutex is the only shared
//! state. Panics inside the lock are intentional: a poisoned mutex means the
//! audio thread crashed, at which point the app is in an unrecoverable state.
use std::{
    fs::File,
    io::BufReader,
    path::Path,
    sync::{Arc, Mutex},
    time::Duration,
};

use rodio::{Decoder, DeviceSinkBuilder, MixerDeviceSink, Player};
use serde::Serialize;

/// Serialisable snapshot of player state sent to the frontend over IPC.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerState {
    /// Currently loaded track path, if any.
    pub track_path: Option<String>,
    /// True when audio is actively playing (not paused, not stopped/empty).
    pub is_playing: bool,
    /// Elapsed playback position in seconds.
    pub position_secs: f64,
    /// Volume in [0.0, 1.0].
    pub volume: f32,
}

/// Inner mutable fields kept behind the shared mutex.
struct Inner {
    /// Owns the OS audio stream — must not be dropped before `player`.
    _sink: MixerDeviceSink,
    /// Active player, or `None` when nothing is loaded.
    player: Option<Player>,
    /// Path currently loaded (mirrors what the player holds).
    track_path: Option<String>,
    /// Volume remembered across track changes.
    volume: f32,
}

impl Inner {
    fn try_new() -> Result<Self, String> {
        let sink = DeviceSinkBuilder::open_default_sink().map_err(|e| e.to_string())?;
        Ok(Self {
            _sink: sink,
            player: None,
            track_path: None,
            volume: 1.0,
        })
    }
}

/// Thread-safe handle to the single audio engine.
///
/// Cloning is cheap — every clone shares the same `Arc<Mutex<Inner>>`.
#[derive(Clone)]
pub struct PlayerEngine(Arc<Mutex<Inner>>);

impl PlayerEngine {
    /// Initialise the engine and open the default audio output device.
    pub fn try_new() -> Result<Self, String> {
        Ok(Self(Arc::new(Mutex::new(Inner::try_new()?))))
    }

    /// Load a file and start playing it immediately.
    ///
    /// Any previously active `Player` is stopped by dropping it; rodio drains
    /// the queue when the `Player` is dropped.
    pub fn play(&self, path: &str) -> Result<(), String> {
        let path = path.to_owned();
        let mut inner = self.0.lock().unwrap();

        // Drop the old player — this stops output and frees its queue.
        inner.player = None;

        let file = File::open(Path::new(&path))
            .map_err(|e| format!("Cannot open '{}': {}", path, e))?;

        let source = Decoder::new(BufReader::new(file))
            .map_err(|e| format!("Cannot decode '{}': {}", path, e))?;

        // `Player::connect_new` registers the player with the device mixer so
        // audio starts flowing as soon as we append the source.
        let player = Player::connect_new(inner._sink.mixer());
        player.set_volume(inner.volume);
        player.append(source);

        inner.player = Some(player);
        inner.track_path = Some(path);

        Ok(())
    }

    /// Pause the active player. No-op when nothing is loaded.
    pub fn pause(&self) {
        let inner = self.0.lock().unwrap();
        if let Some(p) = &inner.player {
            p.pause();
        }
    }

    /// Resume a paused player. No-op when nothing is loaded.
    pub fn resume(&self) {
        let inner = self.0.lock().unwrap();
        if let Some(p) = &inner.player {
            p.play();
        }
    }

    /// Stop playback and unload the current track.
    pub fn stop(&self) {
        let mut inner = self.0.lock().unwrap();
        // Dropping the player stops audio output immediately.
        inner.player = None;
        inner.track_path = None;
    }

    /// Seek to `seconds` from the start of the current track.
    ///
    /// Symphonia's MP3 decoder only supports forward seeks via `try_seek`, so
    /// we always reload the file and then seek forward from the beginning. This
    /// is slightly more work but is reliable across all supported formats.
    pub fn seek(&self, seconds: f64) -> Result<(), String> {
        let mut inner = self.0.lock().unwrap();

        let path = match &inner.track_path {
            None => return Err("No track loaded".into()),
            Some(p) => p.clone(),
        };

        let was_paused = inner.player.as_ref().map_or(true, |p| p.is_paused());

        // Rebuild the player from the file so we can seek from a clean state.
        inner.player = None;

        let file = File::open(Path::new(&path))
            .map_err(|e| format!("Cannot open '{}': {}", path, e))?;

        let source = Decoder::new(BufReader::new(file))
            .map_err(|e| format!("Cannot decode '{}': {}", path, e))?;

        let player = Player::connect_new(inner._sink.mixer());
        player.set_volume(inner.volume);
        player.append(source);

        player
            .try_seek(Duration::from_secs_f64(seconds))
            .map_err(|e| e.to_string())?;

        if was_paused {
            player.pause();
        }

        inner.player = Some(player);

        Ok(())
    }

    /// Set volume to a value in [0.0, 1.0].
    ///
    /// Values outside that range are accepted by rodio (>1.0 amplifies and may
    /// clip), but the frontend should clamp to [0, 100] and divide by 100.
    pub fn set_volume(&self, volume: f32) {
        let mut inner = self.0.lock().unwrap();
        inner.volume = volume;
        if let Some(p) = &inner.player {
            p.set_volume(volume);
        }
    }

    /// Return a serialisable snapshot of the current playback state.
    pub fn state(&self) -> PlayerState {
        let inner = self.0.lock().unwrap();

        let (is_playing, position_secs) = match &inner.player {
            None => (false, 0.0),
            Some(p) => (!p.is_paused() && !p.empty(), p.get_pos().as_secs_f64()),
        };

        PlayerState {
            track_path: inner.track_path.clone(),
            is_playing,
            position_secs,
            volume: inner.volume,
        }
    }
}
