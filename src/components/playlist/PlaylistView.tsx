import { useState } from 'react'
import { ChevronUp } from 'lucide-react'
import type { Playlist, Track } from '../../types/music'

interface PlaylistViewProps {
  playlist: Playlist
  currentTrackId: string | null
  onTrackSelect: (track: Track) => void
}

export function PlaylistView({ playlist, currentTrackId, onTrackSelect }: PlaylistViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <div className="flex items-end gap-8 px-8 pt-4 pb-10">
        <div className="w-[180px] h-[180px] shrink-0 rounded-2xl bg-black/8 overflow-hidden shadow-2xl">
          {playlist.coverUrl && (
            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex flex-col justify-end pb-1">
          <h1 className="text-5xl font-bold text-black tracking-tight leading-none mb-2">
            {playlist.name}
          </h1>
          <p className="text-sm text-black/40 font-medium">{playlist.collaborators.join(', ')}</p>
        </div>
      </div>

      <div className="px-8">
        <div className="grid grid-cols-12 text-[10px] font-bold text-black/30 uppercase tracking-widest pb-3 px-3">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Artist</div>
          <div className="col-span-3">Album</div>
          <div className="col-span-1 flex items-center gap-1">Added <ChevronUp size={10} /></div>
          <div className="col-span-1 text-right">Duration</div>
        </div>

        <div className="h-px mb-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.07) 20%, rgba(0,0,0,0.07) 80%, transparent)' }} />

        <div className="mt-1 space-y-0.5">
          {playlist.tracks.map((track) => {
            const isActive = track.id === currentTrackId
            const isHovered = track.id === hoveredId

            return (
              <div
                key={track.id}
                onMouseEnter={() => setHoveredId(track.id)}
                onMouseLeave={() => setHoveredId(null)}
                onDoubleClick={() => onTrackSelect(track)}
                className={`
                  grid grid-cols-12 items-center py-3 px-3 rounded-xl
                  cursor-default transition-colors select-none text-sm
                  ${isActive ? 'bg-black/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]' : isHovered ? 'bg-black/[0.03]' : ''}
                `}
              >
                <div className={`col-span-5 font-medium truncate pr-4 ${isActive ? 'text-black' : 'text-black/70'}`}>
                  {track.title}
                </div>
                <div className="col-span-2 truncate text-black/40">{track.artist}</div>
                <div className="col-span-3 truncate text-black/40">{track.album}</div>
                <div className="col-span-1 text-black/35">{track.addedAt}</div>
                <div className="col-span-1 text-right text-black/35">{track.duration}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
