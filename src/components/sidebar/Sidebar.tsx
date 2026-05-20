import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import type { Playlist } from "../../types/music";

interface SidebarProps {
  playlists: Playlist[];
  activePlaylistId: string;
  onSelectPlaylist: (id: string) => void;
}

export function Sidebar({
  playlists,
  activePlaylistId,
  onSelectPlaylist,
}: SidebarProps) {
  return (
    <aside className="glass-sidebar z-10 flex h-full w-[260px] shrink-0 flex-col">
      <div className="relative min-h-0 flex-1">
        <div className="h-full overflow-y-auto px-5 pt-6 pb-2">
          <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-black/30">
            Library
            <ChevronRight size={11} />
          </div>
          <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-black/30">
            Playlists
            <ChevronDown size={11} />
          </div>

          <nav className="flex flex-col gap-0.5 pb-10">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist.id)}
                className={`w-full cursor-default rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                  activePlaylistId === playlist.id
                    ? "font-semibold text-black"
                    : "font-medium text-black/40 hover:text-black/70"
                }`}
              >
                {playlist.name}
              </button>
            ))}

            <button className="mt-3 flex cursor-default items-center gap-1.5 px-2 py-2 text-sm font-semibold text-black/30 transition-colors hover:text-black/55">
              <Plus size={13} />
              New Playlist
            </button>
          </nav>
        </div>

        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-16"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(253,251,247,0.55))",
          }}
        />
      </div>
    </aside>
  );
}
