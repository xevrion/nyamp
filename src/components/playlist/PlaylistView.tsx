import { useState, useRef, useCallback } from 'react'
import { ChevronUp } from 'lucide-react'
import type { Playlist, Track } from '../../types/music'

interface PlaylistViewProps {
  playlist: Playlist
  currentTrackId: string | null
  onTrackSelect: (track: Track) => void
}

const FADE = 'linear-gradient(to right, black calc(100% - 2rem), transparent 100%)'

const MIN_COL = 80
// duration col + padding stay fixed, resizable cols can't eat into that
const RESERVED = 80 + 64 // duration width + px-8 padding both sides

export function PlaylistView({ playlist, currentTrackId, onTrackSelect }: PlaylistViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [cols, setCols] = useState({ title: 260, artist: 160, album: 160, added: 120 })
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<{ key: keyof typeof cols; startX: number; startW: number } | null>(null)

  const onMouseDown = useCallback((key: keyof typeof cols, e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = { key, startX: e.clientX, startW: cols[key] }

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const containerW = containerRef.current?.clientWidth ?? 800
      const maxTotal = containerW - RESERVED
      const delta = ev.clientX - dragging.current.startX
      const newW = Math.max(MIN_COL, dragging.current.startW + delta)

      setCols((prev) => {
        const next = { ...prev, [dragging.current!.key]: newW }
        const total = next.title + next.artist + next.album + next.added
        if (total > maxTotal) {
          // clamp so the sum never exceeds available space
          next[dragging.current!.key] = newW - (total - maxTotal)
        }
        return next
      })
    }
    const onUp = () => {
      dragging.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [cols])

  const gridTemplate = `${cols.title}px ${cols.artist}px ${cols.album}px ${cols.added}px 1fr`

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <div className="flex items-end gap-8 px-8 pt-4 pb-10">
        <div className="w-[180px] h-[180px] shrink-0 rounded-2xl bg-black/8 overflow-hidden shadow-2xl">
          {playlist.coverUrl && (
            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex flex-col justify-end pb-1">
          <h1 className="text-5xl font-bold text-black tracking-tight leading-none mb-2">{playlist.name}</h1>
          <p className="text-sm text-black/40 font-medium">{playlist.collaborators.join(', ')}</p>
        </div>
      </div>

      <div className="px-8" ref={containerRef}>
        {/* column headers with drag handles */}
        <div className="flex text-[10px] font-bold text-black/30 uppercase tracking-widest pb-3 px-3 select-none" style={{ display: 'grid', gridTemplateColumns: gridTemplate }}>
          <div>Title</div>
          <div className="flex items-center gap-1 relative">
            <span
              className="absolute -left-1.5 top-0 h-full w-3 cursor-col-resize flex items-center justify-center opacity-0 hover:opacity-100"
              onMouseDown={(e) => onMouseDown('title', e)}
            >
              <span className="w-px h-3 bg-black/20 rounded-full" />
            </span>
            Artist
          </div>
          <div className="relative">
            <span
              className="absolute -left-1.5 top-0 h-full w-3 cursor-col-resize flex items-center justify-center opacity-0 hover:opacity-100"
              onMouseDown={(e) => onMouseDown('artist', e)}
            >
              <span className="w-px h-3 bg-black/20 rounded-full" />
            </span>
            Album
          </div>
          <div className="flex items-center gap-1 relative">
            <span
              className="absolute -left-1.5 top-0 h-full w-3 cursor-col-resize flex items-center justify-center opacity-0 hover:opacity-100"
              onMouseDown={(e) => onMouseDown('album', e)}
            >
              <span className="w-px h-3 bg-black/20 rounded-full" />
            </span>
            Added <ChevronUp size={10} />
          </div>
          <div className="text-right">Duration</div>
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
                  flex items-center py-3 px-3 rounded-xl
                  cursor-default transition-colors select-none text-sm
                  ${isActive ? 'bg-black/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]' : isHovered ? 'bg-black/[0.03]' : ''}
                `}
                style={{ display: 'grid', gridTemplateColumns: gridTemplate }}
              >
                <div
                  className={`overflow-hidden font-medium ${isActive ? 'text-black' : 'text-black/70'}`}
                  style={{ WebkitMaskImage: FADE, maskImage: FADE }}
                >
                  <span className="block whitespace-nowrap">{track.title}</span>
                </div>
                <div
                  className="overflow-hidden text-black/40"
                  style={{ WebkitMaskImage: FADE, maskImage: FADE }}
                >
                  <span className="block whitespace-nowrap">{track.artist}</span>
                </div>
                <div
                  className="overflow-hidden text-black/40"
                  style={{ WebkitMaskImage: FADE, maskImage: FADE }}
                >
                  <span className="block whitespace-nowrap">{track.album}</span>
                </div>
                <div className="text-black/35 truncate">{track.addedAt}</div>
                <div className="text-right text-black/35">{track.duration}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
