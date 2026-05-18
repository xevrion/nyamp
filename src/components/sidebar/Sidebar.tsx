import { ChevronRight, ChevronDown, Plus } from 'lucide-react'
import type { Playlist } from '../../types/music'

interface SidebarProps {
  playlists: Playlist[]
  activePlaylistId: string
  onSelectPlaylist: (id: string) => void
}

export function Sidebar({ playlists, activePlaylistId, onSelectPlaylist }: SidebarProps) {
  return (
    <aside className="glass-sidebar w-[260px] shrink-0 flex flex-col h-full z-10">
      <div className="flex-1 min-h-0 relative">
        <div className="overflow-y-auto h-full px-5 pt-6 pb-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-black/30 uppercase tracking-widest mb-3">
            Library
            <ChevronRight size={11} />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-black/30 uppercase tracking-widest mb-3">
            Playlists
            <ChevronDown size={11} />
          </div>

          <nav className="flex flex-col gap-0.5 pb-10">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist.id)}
                className={`
                  w-full text-left px-2 py-2 rounded-lg text-sm transition-colors cursor-default
                  ${activePlaylistId === playlist.id ? 'text-black font-semibold' : 'text-black/40 hover:text-black/70 font-medium'}
                `}
              >
                {playlist.name}
              </button>
            ))}

            <button className="mt-3 flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-black/30 hover:text-black/55 transition-colors cursor-default">
              <Plus size={13} />
              New Playlist
            </button>
          </nav>
        </div>

        {/* fades the list into the background instead of cutting off */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(253,251,247,0.55))' }}
        />
      </div>
    </aside>
  )
}
