const STORAGE_KEY = "nyamp:music-folders";

export function getMusicFolderPaths(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((path): path is string => typeof path === "string");
  } catch {
    return [];
  }
}

export function setMusicFolderPaths(paths: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
}

export function mergeMusicFolderPaths(existing: string[], added: string[]): string[] {
  const seen = new Set(existing);
  const merged = [...existing];

  for (const path of added) {
    if (!seen.has(path)) {
      seen.add(path);
      merged.push(path);
    }
  }

  return merged;
}
