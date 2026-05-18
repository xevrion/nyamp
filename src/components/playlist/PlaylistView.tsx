import { useState } from 'react'
import type { Playlist, Track } from '../../types/music'

interface PlaylistViewProps {
  playlist: Playlist
  currentTrackId: string | null
  onTrackSelect: (track: Track) => void
}

export function PlaylistView({ playlist, currentTrackId, onTrackSelect }: PlaylistViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Playlist header */}
      <div className="flex items-end gap-8 px-8 pt-8 pb-8">
        <div className="w-[190px] h-[190px] shrink-0 rounded-2xl bg-black/8 overflow-hidden shadow-md">
          {playlist.coverUrl && (
            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex flex-col gap-1 pb-2">
          <span className="text-[11px] font-semibold tracking-widest text-black/30 uppercase">
            Playlist
          </span>
          <h1 className="text-[2.6rem] font-bold text-black tracking-tight leading-none mt-2">
            {playlist.name}
          </h1>
          <p className="text-sm text-black/45 mt-2">
            {playlist.collaborators.join(', ')}
          </p>
        </div>
      </div>

      {/* Track table */}
      <div className="px-8 pb-4">
        {/* Table header — no border, just spacing + subtle text */}
        <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr] gap-4 px-3 pb-3">
          {(['Title', 'Artist', 'Album', 'Added At', 'Duration'] as const).map((col) => (
            <span key={col} className="text-[11px] font-semibold tracking-widest text-black/25 uppercase">
              {col}
            </span>
          ))}
        </div>

        {/* Subtle divider — just a shadow line, no stroke */}
        <div className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent mb-1" />

        <div className="mt-1">
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
                  grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr] gap-4 px-3 py-2.5 rounded-xl
                  cursor-default transition-all select-none
                  ${isActive
                    ? 'bg-black/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]'
                    : isHovered
                      ? 'bg-black/4'
                      : ''
                  }
                `}
              >
                <span className={`text-sm truncate ${isActive ? 'text-black font-medium' : 'text-black/75'}`}>
                  {track.title}
                </span>
                <span className="text-sm text-black/45 truncate">{track.artist}</span>
                <span className="text-sm text-black/45 truncate">{track.album}</span>
                <span className="text-sm text-black/35 truncate">{track.addedAt}</span>
                <span className="text-sm text-black/35 text-right">{track.duration}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
