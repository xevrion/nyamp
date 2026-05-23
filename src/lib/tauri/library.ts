import { invoke } from "@tauri-apps/api/core";
import type { ScanFoldersResponse } from "../../types/library";
import type { Playlist, Track } from "../../types/music";

export const LIBRARY_PLAYLIST_ID = "library";

export async function scanFolders(
  paths: string[],
): Promise<ScanFoldersResponse> {
  return invoke<ScanFoldersResponse>("scan_folder_cmd", { paths });
}

export function tracksToLibraryPlaylist(tracks: Track[]): Playlist {
  return {
    id: LIBRARY_PLAYLIST_ID,
    name: "Library",
    collaborators: [],
    coverUrl: tracks[0]?.coverUrl,
    tracks,
  };
}
