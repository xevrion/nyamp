export type ThemeId = "light" | "dark" | "sakura" | "tangerine" | "ocean" | "ocean-dark" ;

const STORAGE_KEY = "nyamp-theme";

export function getTheme(): ThemeId {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "sakura" || stored === "tangerine" || stored === "ocean" || stored === "ocean-dark" ) return stored;
  return "light";
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme(): ThemeId {
  const next: ThemeId = getTheme() === "light" ? "dark" : getTheme() === "dark" ? "sakura" : getTheme() === "sakura" ? "tangerine" : getTheme() === "tangerine" ? "ocean" : getTheme() === "ocean" ? "ocean-dark" : "light";
  applyTheme(next);
  return next;
}

applyTheme(getTheme());
