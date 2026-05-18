import { Heart } from 'lucide-react'
import type { Playlist, Track } from '../../types/music'

interface SidebarProps {
  playlists: Playlist[]
  activePlaylistId: string
  currentTrack: Track | null
  isLiked: boolean
  onSelectPlaylist: (id: string) => void
  onToggleLike: () => void
}

export function Sidebar({
  playlists,
  activePlaylistId,
  currentTrack,
  isLiked,
  onSelectPlaylist,
  onToggleLike,
}: SidebarProps) {
  return (
    <aside className="w-[280px] shrink-0 flex flex-col h-full bg-[#ececec]">
      {/* Nav — scrollable with fade-out at bottom */}
      <div className="flex-1 min-h-0 relative">
        <div className="overflow-y-auto h-full px-4 pt-6 pb-2">
          <div className="mb-4">
            <span className="text-[11px] font-semibold tracking-widest text-black/30 uppercase px-3">
              Playlists
            </span>
          </div>
          <nav className="flex flex-col gap-0.5 pb-8">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist.id)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors cursor-default
                  ${activePlaylistId === playlist.id
                    ? 'bg-black/8 text-black font-medium'
                    : 'text-black/50 hover:text-black/80 hover:bg-black/5 font-normal'
                  }
                `}
              >
                {playlist.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Fade-out mask at the bottom of the nav list */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #ececec)' }}
        />
      </div>

      {/* Now playing */}
      {currentTrack && (
        <div className="p-4">
          <div className="w-full aspect-square rounded-2xl bg-black/8 overflow-hidden mb-3 shadow-sm">
            {currentTrack.coverUrl ? (
              <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black truncate">{currentTrack.title}</p>
              <p className="text-xs text-black/45 truncate mt-0.5">{currentTrack.artist}</p>
            </div>
            <button
              onClick={onToggleLike}
              className={`shrink-0 mt-0.5 transition-colors ${isLiked ? 'text-black' : 'text-black/25 hover:text-black/50'}`}
            >
              <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
