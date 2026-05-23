# nyamp `src-tauri` architecture

Short developer notes for the current Tauri-side code.

## Layout

- `src-tauri/src/lib.rs` keeps Tauri commands and minimal wiring.
- `src-tauri/src/app/models.rs` holds IPC structs shared with the frontend.
- `src-tauri/src/features/library/scanner.rs` holds library scan logic.

## Module rules

- `lib.rs`: command registration only.
- `features/*`: domain logic and tests.
- `app/models.rs`: serializable request/response types.
- `utils/` or `infra/`: shared helpers or wrappers when they are needed later.

## Current API

- `Track`: one scanned audio file returned to the frontend.
- `FolderScanFailure`: a folder path plus the error that happened while scanning it.
- `ScanFoldersResponse`: combined result for multi-folder scans.

## Scanner behaviour

- `scan_folder(path: &str) -> Result<Vec<Track>, String>` scans one folder.
- `scan_folders(paths: Vec<String>) -> ScanFoldersResponse` scans many folders, keeps going on failures, and deduplicates tracks by `id`.
- Missing paths and filesystem metadata errors return `Err` from `scan_folder`.
- Track metadata falls back to file stem, `Unknown Artist`, and `Unknown Album` when tags are missing.
- Duration is returned as `M:SS`.
- Cover art is returned as a base64 data URI when available.

## Tauri command

- `scan_folder_cmd(paths: Vec<String>) -> ScanFoldersResponse`
- It calls the scanner service and returns tracks plus per-folder failures.

## Tests

- `src-tauri/src/features/library/scanner.rs` covers empty folders, invalid files, missing paths, and partial failures.

## Working on the crate

```bash
cd src-tauri
cargo check
cargo test
```

If you add a new feature, keep the command thin, put the logic in `features/`, and put shared data types in `app/models.rs`.
