import { useCallback, useEffect, useRef, useState } from "react";
import { TopBar } from "./components/TopBar";
import { PlayerBar } from "./components/player/PlayerBar";
import { PlaylistView } from "./components/playlist/PlaylistView";
import { Sidebar } from "./components/sidebar/Sidebar";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useLibrary } from "./hooks/useLibrary";
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
  const [isLiked, setIsLiked] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  const activePlaylist =
    playlists.find((playlist) => playlist.id === activePlaylistId) ??
    playlists[0];

  const loadTrackRef = useRef<(track: Track, autoPlay: boolean) => void>(() => {});

  const handleTrackEnded = useCallback((): Track | null => {
    const tracks = activePlaylist.tracks;
    if (!currentTrack || tracks.length === 0) {
      setIsPlaying(false);
      return null;
    }

    const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id);
    if (currentIndex >= 0 && currentIndex < tracks.length - 1) {
      const nextTrack = tracks[currentIndex + 1];
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
      setIsLiked(false);
      return nextTrack;
    }

    setIsPlaying(false);
    return null;
  }, [activePlaylist.tracks, currentTrack]);

  const {
    audioRef,
    loadTrack,
    play,
    pause,
    currentTime,
    duration,
    volume,
    playbackError,
    seekByProgress,
    setVolume,
    beginSeek,
    endSeek,
  } = useAudioPlayer(() => {
    const nextTrack = handleTrackEnded();
    if (nextTrack) {
      loadTrackRef.current(nextTrack, true);
    }
  });

  loadTrackRef.current = loadTrack;

  const handleTrackSelect = useCallback(
    (track: Track) => {
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsLiked(false);
      loadTrack(track, true);
    },
    [loadTrack],
  );

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
      setIsPlaying(true);
      setIsLiked(false);
      loadTrack(nextTrack, true);
    },
    [activePlaylist.tracks, currentTrack, loadTrack],
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    } else {
      play();
      setIsPlaying(true);
    }
  }, [currentTrack, isPlaying, pause, play]);

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
      <audio ref={audioRef} className="hidden" preload="metadata" />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          playlists={playlists}
          currentTrack={currentTrack}
          activePlaylistId={activePlaylistId}
          onSelectPlaylist={setActivePlaylistId}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <div
          className="w-px shrink-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(0,0,0,0.07) 20%, rgba(0,0,0,0.07) 80%, transparent)",
          }}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar />

          <div
            className="mx-6 h-px shrink-0"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(0,0,0,0.06) 20%, rgba(0,0,0,0.06) 80%, transparent)",
            }}
          />

          {!isTauriApp && (
            <div className="mx-8 mt-4 rounded-xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm text-black/50">
              Run with{" "}
              <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">
                pnpm tauri dev
              </code>{" "}
              to scan your music library.
            </div>
          )}

          {error && (
            <div className="mx-8 mt-4 rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {playbackError && (
            <div className="mx-8 mt-4 rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm text-red-700">
              {playbackError}
            </div>
          )}

          {scanFailures.length > 0 && (
            <div className="mx-8 mt-4 rounded-xl border border-amber-200/60 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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

      <div
        className="h-px shrink-0"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.08) 85%, transparent)",
        }}
      />

      <PlayerBar
        track={currentTrack}
        isPlaying={isPlaying}
        isLiked={isLiked}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onTogglePlay={togglePlay}
        onToggleLike={() => setIsLiked((value) => !value)}
        onSeek={seekByProgress}
        onSeekStart={beginSeek}
        onSeekEnd={endSeek}
        onVolumeChange={setVolume}
        onSkipBack={() => selectAdjacentTrack(-1)}
        onSkipForward={() => selectAdjacentTrack(1)}
      />
    </div>
  );
}

export default App;
