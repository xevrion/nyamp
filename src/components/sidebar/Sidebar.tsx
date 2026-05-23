import { ChevronDown, ChevronRight, Heart, Home, Plus, Search } from "lucide-react";
import type { Playlist, Track } from "../../types/music";





interface SidebarProps {
  playlists: Playlist[];
  activePlaylistId: string;
  currentTrack: Track | null;
  onSelectPlaylist: (id: string) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function Sidebar({
  playlists,
  activePlaylistId,
  currentTrack,
  currentPage,
  setCurrentPage,
  onSelectPlaylist,
}: SidebarProps) {
  return (
    <aside className="glass-sidebar z-10 flex h-full min-w-[260px] shrink-0 flex-col p-5">
      <div className="relative min-h-0 flex-1">
        <div className="h-full overflow-y-auto px-5 pt-6 mb-2">
          <div className="flex flex-col gap-2 mb-6">
            <div onClick={()=>setCurrentPage('home')} className="flex items-center cursor-pointer font-medium text-[14px] tracking-tighter text-neutral-400 hover:text-neutral-800 gap-1">
              <Home size={14} className={`font-bold ${currentPage === "home" ? "font-bold text-neutral-800" : ""}`} />
              <span className={currentPage === "home" ? "font-bold text-neutral-800" : ""}>Home</span>
            </div>

            <div onClick={()=>setCurrentPage('browse')}  className="flex items-center cursor-pointer font-medium text-[14px] tracking-tighter text-neutral-400 hover:text-neutral-800 gap-1">
              <Search size={14} className={`font-bold ${currentPage === "browse" ? "font-bold text-neutral-800" : ""}`} />
              <span className={currentPage === "browse" ? "font-bold text-neutral-800" : ""}>Browse</span>
            </div>
          </div>

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
                className={`w-full cursor-pointer rounded-lg px-2 py-2 text-left text-sm transition-colors ${activePlaylistId === playlist.id
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

        <div className="absolute -bottom-5 left-0 right-0 h-fit w-full shrink-0 overflow-hidden">
          {currentTrack?.coverUrl && (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="h-full w-full rounded-2xl object-cover"
            />
          )}
          <div className="flex items-center justify-between py-5">
            <div>
              <p className="text-sm font-medium text-black">
                {currentTrack?.title ?? "Nothing playing"}
              </p>
              <p className="text-sm font-medium text-black/40">
                {currentTrack?.artist ?? ""}
              </p>
            </div>
            <div>
              <Heart size={16} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
