import { useCallback, useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
  LIBRARY_PLAYLIST_ID,
  scanFolders,
  tracksToLibraryPlaylist,
} from "../lib/tauri/library";
import {
  getMusicFolderPaths,
  mergeMusicFolderPaths,
  setMusicFolderPaths,
} from "../lib/storage/musicFolders";
import type { FolderScanFailure } from "../types/library";
import type { Playlist } from "../types/music";

const EMPTY_LIBRARY: Playlist = {
  id: LIBRARY_PLAYLIST_ID,
  name: "Library",
  collaborators: [],
  tracks: [],
};

export function useLibrary() {
  const [playlists, setPlaylists] = useState<Playlist[]>([EMPTY_LIBRARY]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanFailures, setScanFailures] = useState<FolderScanFailure[]>([]);
  const [isTauriApp] = useState(() => isTauri());

  const loadLibrary = useCallback(async () => {
    if (!isTauri()) {
      setPlaylists([EMPTY_LIBRARY]);
      setScanFailures([]);
      setError(null);
      return;
    }

    const paths = getMusicFolderPaths();
    if (paths.length === 0) {
      setPlaylists([EMPTY_LIBRARY]);
      setScanFailures([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await scanFolders(paths);
      setPlaylists([tracksToLibraryPlaylist(response.tracks)]);
      setScanFailures(response.failures);
    } catch (cause) {
      setPlaylists([EMPTY_LIBRARY]);
      setScanFailures([]);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  const addMusicFolder = useCallback(async () => {
    if (!isTauri()) return;

    const selected = await open({
      directory: true,
      multiple: true,
    });

    if (selected === null) return;

    const added = Array.isArray(selected) ? selected : [selected];
    const merged = mergeMusicFolderPaths(getMusicFolderPaths(), added);
    setMusicFolderPaths(merged);
    await loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  return {
    playlists,
    loading,
    error,
    scanFailures,
    isTauriApp,
    loadLibrary,
    addMusicFolder,
  };
}
