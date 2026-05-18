import { useState } from 'react'
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Volume2, MoreHorizontal,
} from 'lucide-react'
import type { Track } from '../../types/music'

interface PlayerBarProps {
  track: Track | null
  isPlaying: boolean
  onTogglePlay: () => void
}

export function PlayerBar({ track, isPlaying, onTogglePlay }: PlayerBarProps) {
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [progress, setProgress] = useState(35)
  const [volume, setVolume] = useState(70)

  return (
    <div className="shrink-0 bg-[#f0f0f0]">
      {/* Full-width progress bar — no stroke, just a soft track */}
      <div className="relative h-[3px] cursor-pointer">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-10"
        />
        <div className="h-full bg-black/8">
          <div className="h-full bg-black/50 transition-none" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center px-6 h-[68px] gap-4">
        <span className="text-[11px] text-black/30 tabular-nums w-8">1:12</span>

        {/* Controls */}
        <div className="flex-1 flex items-center justify-center gap-5">
          <button
            onClick={() => setIsShuffle((v) => !v)}
            className={`transition-colors ${isShuffle ? 'text-black' : 'text-black/25 hover:text-black/55'}`}
          >
            <Shuffle size={15} />
          </button>
          <button className="text-black/55 hover:text-black transition-colors">
            <SkipBack size={18} />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-sm"
          >
            {isPlaying
              ? <Pause size={18} />
              : <Play size={18} className="translate-x-px" />
            }
          </button>
          <button className="text-black/55 hover:text-black transition-colors">
            <SkipForward size={18} />
          </button>
          <button
            onClick={() => setIsRepeat((v) => !v)}
            className={`transition-colors ${isRepeat ? 'text-black' : 'text-black/25 hover:text-black/55'}`}
          >
            <Repeat size={15} />
          </button>
        </div>

        {/* Volume + more */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-black/30 tabular-nums w-8 text-right">
            {track?.duration ?? '0:00'}
          </span>
          <Volume2 size={14} className="text-black/35" />
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
          <button className="text-black/25 hover:text-black/55 transition-colors ml-1">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
