import type { Track } from "./music";

export interface FolderScanFailure {
  path: string;
  error: string;
}

export interface ScanFoldersResponse {
  tracks: Track[];
  failures: FolderScanFailure[];
}
