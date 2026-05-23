import { useState } from "react";
import { TopBar } from "./components/TopBar";
import { PlayerBar } from "./components/player/PlayerBar";
import { PlaylistView } from "./components/playlist/PlaylistView";
import { Sidebar } from "./components/sidebar/Sidebar";
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

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setIsLiked(false);
  };

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
        onTogglePlay={() => setIsPlaying((value) => !value)}
        onToggleLike={() => setIsLiked((value) => !value)}
      />
    </div>
  );
}

export default App;
