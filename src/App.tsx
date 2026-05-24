import { useCallback, useEffect, useRef, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { TopBar } from "./components/TopBar";
import { PlayerBar } from "./components/player/PlayerBar";
import { PlaylistView } from "./components/playlist/PlaylistView";
import { Sidebar } from "./components/sidebar/Sidebar";
import { useLibrary } from "./hooks/useLibrary";
import { parseDuration } from "./lib/formatDuration";
import {
  playerGetState,
  playerPause,
  playerPlay,
  playerResume,
  playerSeek,
  playerSetVolume,
} from "./lib/tauri/player";
import { LIBRARY_PLAYLIST_ID } from "./lib/tauri/library";
import type { Track } from "./types/music";

// How often we ask the backend for the current playback position (ms).
const POLL_INTERVAL_MS = 500;

function App() {
  const {
    playlists,
    loading,
    error,
    scanFailures,
    isTauriApp,
    addMusicFolder,
  } = useLibrary();

  const [activePlaylistId, setActivePlaylistId] = useState(LIBRARY_PLAYLIST_ID);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  // Volume before mute, so we can restore it on unmute.
  const preMuteVolumeRef = useRef(70);

  // Keep a ref to the poll interval so we can clear it on unmount.
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePlaylist =
    playlists.find((playlist) => playlist.id === activePlaylistId) ??
    playlists[0];

  const duration =
    currentTrack && currentTrack.duration
      ? parseDuration(currentTrack.duration)
      : 0;

  // Stable ref so the poll callback can read current state without re-creating
  // the interval every render.
  const isRepeatRef = useRef(false);
  const isShuffleRef = useRef(false);
  const currentTrackRef = useRef<Track | null>(null);
  const activePlaylistRef = useRef(activePlaylist);

  useEffect(() => { isRepeatRef.current = isRepeat; }, [isRepeat]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { activePlaylistRef.current = activePlaylist; }, [activePlaylist]);

  // Forward-declare so startPositionPoll can reference it.
  const handleTrackSelectRef = useRef<(track: Track) => Promise<void>>(async () => {});

  // Start polling the backend for position updates while something is playing.
  const startPositionPoll = useCallback(() => {
    if (pollRef.current !== null) return;
    pollRef.current = setInterval(async () => {
      const state = await playerGetState();
      if (!state) return;

      setCurrentTime(state.positionSecs);

      // Track finished naturally (backend reports not playing, but we thought it was).
      if (!state.isPlaying && state.trackPath !== null) {
        setIsPlaying(false);

        if (isRepeatRef.current) {
          // Replay the same track.
          const track = currentTrackRef.current;
          if (track) void handleTrackSelectRef.current(track);
        } else if (isShuffleRef.current) {
          const tracks = activePlaylistRef.current.tracks;
          if (tracks.length > 1) {
            const current = currentTrackRef.current;
            const others = tracks.filter((t) => t.id !== current?.id);
            const next = others[Math.floor(Math.random() * others.length)];
            void handleTrackSelectRef.current(next);
          }
        } else {
          // Auto-advance to next track.
          const tracks = activePlaylistRef.current.tracks;
          const current = currentTrackRef.current;
          if (current && tracks.length > 0) {
            const idx = tracks.findIndex((t) => t.id === current.id);
            if (idx !== -1 && idx + 1 < tracks.length) {
              void handleTrackSelectRef.current(tracks[idx + 1]);
            }
          }
        }
      } else {
        setIsPlaying(state.isPlaying);
      }
    }, POLL_INTERVAL_MS);
  }, []);

  const stopPositionPoll = useCallback(() => {
    if (pollRef.current === null) return;
    clearInterval(pollRef.current);
    pollRef.current = null;
  }, []);

  useEffect(() => {
    return () => stopPositionPoll();
  }, [stopPositionPoll]);

  const handleTrackSelect = useCallback(
    async (track: Track) => {
      setCurrentTrack(track);
      setCurrentTime(0);
      setIsPlaying(true);

      if (isTauri()) {
        try {
          // track.id is the file path (set by the scanner).
          await playerPlay(track.id);
          startPositionPoll();
        } catch (e) {
          console.error("player_play failed:", e);
          setIsPlaying(false);
        }
      }
    },
    [startPositionPoll],
  );

  // Keep the ref in sync so the poll callback can call it without a stale closure.
  useEffect(() => {
    handleTrackSelectRef.current = handleTrackSelect;
  }, [handleTrackSelect]);

  const selectAdjacentTrack = useCallback(
    (direction: -1 | 1) => {
      const tracks = activePlaylist.tracks;
      if (!currentTrack || tracks.length === 0) return;

      if (isShuffle) {
        const others = tracks.filter((t) => t.id !== currentTrack.id);
        const next = others.length > 0
          ? others[Math.floor(Math.random() * others.length)]
          : tracks[0];
        void handleTrackSelect(next);
        return;
      }

      const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
      if (currentIndex === -1) return;

      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= tracks.length) return;

      void handleTrackSelect(tracks[nextIndex]);
    },
    [activePlaylist.tracks, currentTrack, isShuffle, handleTrackSelect],
  );

  const togglePlay = useCallback(async () => {
    if (!currentTrack) return;

    if (isTauri()) {
      try {
        if (isPlaying) {
          await playerPause();
          stopPositionPoll();
        } else {
          await playerResume();
          startPositionPoll();
        }
      } catch (e) {
        console.error("player pause/resume failed:", e);
      }
    }

    setIsPlaying((v) => !v);
  }, [currentTrack, isPlaying, startPositionPoll, stopPositionPoll]);

  const seekByProgress = useCallback(
    async (progress: number) => {
      if (duration <= 0) return;
      const seconds = (progress / 100) * duration;
      setCurrentTime(seconds);

      if (isTauri()) {
        try {
          await playerSeek(seconds);
        } catch (e) {
          console.error("player_seek failed:", e);
        }
      }
    },
    [duration],
  );

  const handleVolumeChange = useCallback(async (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(false);
    preMuteVolumeRef.current = newVolume;
    if (isTauri()) {
      // Frontend uses 0–100; the backend expects 0.0–1.0.
      await playerSetVolume(newVolume / 100);
    }
  }, []);

  const handleToggleMute = useCallback(async () => {
    const muting = !isMuted;
    setIsMuted(muting);
    if (isTauri()) {
      await playerSetVolume(muting ? 0 : preMuteVolumeRef.current / 100);
    }
  }, [isMuted]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.key !== " ") return;

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      void togglePlay();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1">
        <Sidebar
          playlists={playlists}
          currentTrack={currentTrack}
          activePlaylistId={activePlaylistId}
          onSelectPlaylist={setActivePlaylistId}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <div className="w-px shrink-0 nyamp-divider-v" />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar />

          <div className="mx-6 h-px shrink-0 nyamp-divider-h" />

          {!isTauriApp && (
            <div className="mx-8 mt-4 rounded-xl border border-border-subtle bg-info-bg px-4 py-3 text-sm text-info-fg">
              Run with{" "}
              <code className="rounded bg-surface-active px-1.5 py-0.5 text-xs">
                pnpm tauri dev
              </code>{" "}
              to scan your music library.
            </div>
          )}

          {error && (
            <div className="mx-8 mt-4 rounded-xl border border-error-border bg-error-bg px-4 py-3 text-sm text-error-fg">
              {error}
            </div>
          )}

          {scanFailures.length > 0 && (
            <div className="mx-8 mt-4 rounded-xl border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-fg">
              {scanFailures.map((failure) => (
                <p key={failure.path}>
                  {failure.path}: {failure.error}
                </p>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <PlaylistView
              playlist={activePlaylist}
              currentTrackId={currentTrack?.id ?? null}
              onTrackSelect={handleTrackSelect}
              loading={loading}
              onAddMusicFolder={isTauriApp ? addMusicFolder : undefined}
            />
          </div>
        </main>
      </div>

      <div className="h-px shrink-0 nyamp-divider-player" />

      <PlayerBar
        track={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        onTogglePlay={togglePlay}
        onSeek={seekByProgress}
        onSeekStart={() => {}}
        onSeekEnd={() => {}}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleShuffle={() => setIsShuffle((v) => !v)}
        onToggleRepeat={() => setIsRepeat((v) => !v)}
        onSkipBack={() => selectAdjacentTrack(-1)}
        onSkipForward={() => selectAdjacentTrack(1)}
      />
    </div>
  );
}

export default App;
