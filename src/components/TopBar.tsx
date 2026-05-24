import { useState } from "react";
import {
  CloudMoon,
  Flame,
  Flower2,
  Moon,
  Search,
  Sun,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";
import { applyTheme, getTheme, type ThemeId } from "../lib/theme";

const THEME_ICONS: Record<ThemeId, LucideIcon> = {
  light: Sun,
  dark: Moon,
  sakura: Flower2,
  tangerine: Flame,
  ocean: Waves,
  "ocean-dark": CloudMoon,
};

function ThemeIcon({ theme }: { theme: ThemeId }) {
  const Icon = THEME_ICONS[theme];
  return <Icon size={13} className="text-fg-subtle" />;
}

export function TopBar() {
  const [query, setQuery] = useState("");
  const [isThemePopupOpen, setIsThemePopupOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => getTheme());

  const handleThemeToggle = () => {
    setIsThemePopupOpen((open) => !open);
  };

  const handleThemeSelect = (themeId: ThemeId) => {
    applyTheme(themeId);
    setCurrentTheme(themeId);
  };

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between px-8">
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-fg-hint">
        Playlist
        <span className="ml-1 text-base leading-none tracking-normal">···</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-[180px] rounded-full border border-border py-1.5 pr-9 pl-4 text-sm text-fg placeholder:text-fg-muted transition-[background-color] duration-200 focus:bg-surface-chip focus:outline-none"
          />
          <Search
            size={13}
            className="pointer-events-none absolute right-3 text-fg-muted"
          />
        </div>

        <div
          onClick={handleThemeToggle}
          className="cursor-pointer flex h-8 w-8 cursor-default items-center justify-center rounded-full bg-surface-chip text-xs font-bold text-fg-subtle shadow-sm hover:bg-surface-hover"
          aria-label={isThemePopupOpen ? "Close theme menu" : `Theme: ${currentTheme}`}
        >
          {isThemePopupOpen ? (
            <X size={13} className="text-fg-subtle" />
          ) : (
            <ThemeIcon theme={currentTheme} />
          )}
        </div>
        {isThemePopupOpen && <ThemePopup onSelect={handleThemeSelect} />}

      </div>
    </header>
  );
}

function ThemePopup({
  onSelect,
}: {
  onSelect: (themeId: ThemeId) => void;
}) {
  const themes = [
    {
      id: "light",
      label: "Light",
      swatches: ["#fdfbf7", "#f0ede6", "#000000"],
      border: "#e6e6e6",
    },
    {
      id: "dark",
      label: "Dark",
      swatches: ["#121110", "#1c1917", "#fafaf9"],
      border: "#292524",
    },
    {
      id: "sakura",
      label: "Sakura",
      swatches: ["#fff5f7", "#fce8ed", "#c0395a"],
      border: "#f0d0d8",
    },
   
    {
      id: "tangerine",
      label: "Tangerine",
      swatches: ["#fff8f0", "#fdecd8", "#d44800"],
      border: "#f0d8b8",
    },
    {
      id: "ocean",
      label: "Ocean",
      swatches: ["#f0f6ff", "#e0eefa", "#0066cc"],
      border: "#c0d8f0",
    },
    {
      id: "ocean-dark",
      label: "Ocean Night",
      swatches: ["#080e18", "#0e1828", "#38a8f8"],
      border: "#162438",
    },
    
  ];

  return (
    <div className="absolute right-10 top-15 bg-surface-elevated border border-border rounded-xl p-1.5 shadow-lg min-w-[160px]">
      <div className="flex flex-col gap-0.5">
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => onSelect(theme.id as ThemeId)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-surface-hover active:bg-surface-active transition-colors group"
          >

            <div className="flex items-center -space-x-1.5">
              {theme.swatches.map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: color, zIndex: 3 - i }}
                />
              ))}
            </div>


            <span className="text-sm font-medium text-fg tracking-wide">
              {theme.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};