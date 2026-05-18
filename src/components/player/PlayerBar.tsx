import { useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart } from 'lucide-react'
import type { Track } from '../../types/music'

interface PlayerBarProps {
  track: Track | null
  isPlaying: boolean
  isLiked: boolean
  onTogglePlay: () => void
  onToggleLike: () => void
}

// shuffle/repeat buttons with a dot indicator when active
function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-center">
      <button onClick={onClick} className={`transition-colors ${active ? 'text-black' : 'text-black/30 hover:text-black/60'}`}>
        {children}
      </button>
      <div className={`absolute -bottom-2.5 w-1 h-1 rounded-full bg-black transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}

export function PlayerBar({ track, isPlaying, isLiked, onTogglePlay, onToggleLike }: PlayerBarProps) {
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [progress, setProgress] = useState(84)
  const [volume, setVolume] = useState(70)

  return (
    <div className="glass-player shrink-0">
      <div className="relative h-[3px] w-full bg-black/6 cursor-pointer progress-wrap">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-10"
        />
        <div className="h-full bg-black/60 rounded-full" style={{ width: `${progress}%` }} />
        <div
          className="progress-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-black/10 rounded-full shadow-sm opacity-0 transition-opacity pointer-events-none"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="flex items-center px-6 h-[72px] gap-4">
        {/* track info + like */}
        <div className="flex items-center gap-3 w-[260px] shrink-0">
          <div className="w-10 h-10 rounded-xl bg-black/8 overflow-hidden shadow-sm shrink-0">
            {track?.coverUrl && <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />}
          </div>
          {track ? (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-black truncate leading-tight">{track.title}</p>
              <p className="text-[11px] text-black/40 truncate mt-0.5">{track.artist}</p>
            </div>
          ) : (
            <p className="text-sm text-black/25">Nothing playing</p>
          )}
          <button
            onClick={onToggleLike}
            className={`shrink-0 transition-colors ${isLiked ? 'text-red-400' : 'text-black/20 hover:text-red-400'}`}
          >
            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* playback controls */}
        <div className="flex-1 flex items-center justify-center gap-6">
          <ToggleBtn active={isShuffle} onClick={() => setIsShuffle((v) => !v)}>
            <Shuffle size={15} />
          </ToggleBtn>
          <button className="text-black/50 hover:text-black transition-colors">
            <SkipBack size={19} strokeWidth={2} />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying
              ? <Pause size={17} className="text-black" strokeWidth={2.5} />
              : <Play size={17} className="text-black translate-x-[1px]" strokeWidth={2.5} />
            }
          </button>
          <button className="text-black/50 hover:text-black transition-colors">
            <SkipForward size={19} strokeWidth={2} />
          </button>
          <ToggleBtn active={isRepeat} onClick={() => setIsRepeat((v) => !v)}>
            <Repeat size={15} />
          </ToggleBtn>
        </div>

        {/* time + volume */}
        <div className="w-[260px] shrink-0 flex items-center justify-end gap-3">
          <span className="text-[11px] text-black/30 tabular-nums">3:38</span>
          <span className="text-[11px] text-black/20">/</span>
          <span className="text-[11px] text-black/30 tabular-nums">{track?.duration ?? '0:00'}</span>
          <div className="w-px h-3 bg-black/10 mx-1" />
          <Volume2 size={14} className="text-black/35 shrink-0" />
          <div className="relative w-20 h-4 flex items-center">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-10"
            />
            <div className="w-full h-[3px] rounded-full bg-black/10 overflow-hidden">
              <div className="h-full bg-black/50 rounded-full" style={{ width: `${volume}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
