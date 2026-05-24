import { useCallback, useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { PlayerBar } from "./components/player/PlayerBar";
import { PlaylistView } from "./components/playlist/PlaylistView";
import { Sidebar } from "./components/sidebar/Sidebar";
import { useLibrary } from "./hooks/useLibrary";
import { parseDuration } from "./lib/formatDuration";
import { LIBRARY_PLAYLIST_ID } from "./lib/tauri/library";
import type { Track } from "./types/music";

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
  const [currentPage, setCurrentPage] = useState("home");

  const activePlaylist =
    playlists.find((playlist) => playlist.id === activePlaylistId) ??
    playlists[0];

  const duration =
    currentTrack && currentTrack.duration
      ? parseDuration(currentTrack.duration)
      : 0;

  const handleTrackSelect = useCallback((track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const selectAdjacentTrack = useCallback(
    (direction: -1 | 1) => {
      const tracks = activePlaylist.tracks;
      if (!currentTrack || tracks.length === 0) return;

      const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id);
      if (currentIndex === -1) return;

      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= tracks.length) return;

      const nextTrack = tracks[nextIndex];
      setCurrentTrack(nextTrack);
      setCurrentTime(0);
      setIsPlaying(true);
    },
    [activePlaylist.tracks, currentTrack],
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((value) => !value);
  }, [currentTrack]);

  const seekByProgress = useCallback(
    (progress: number) => {
      if (duration <= 0) return;
      setCurrentTime((progress / 100) * duration);
    },
    [duration],
  );

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
      togglePlay();
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
        onTogglePlay={togglePlay}
        onSeek={seekByProgress}
        onSeekStart={() => {}}
        onSeekEnd={() => {}}
        onVolumeChange={setVolume}
        onSkipBack={() => selectAdjacentTrack(-1)}
        onSkipForward={() => selectAdjacentTrack(1)}
      />
    </div>
  );
}

export default App;
