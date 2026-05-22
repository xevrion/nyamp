import { useState, type ReactNode } from "react";
import {
  Heart,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import type { Track } from "../../types/music";

interface PlayerBarProps {
  track: Track | null;
  isPlaying: boolean;
  isLiked: boolean;
  onTogglePlay: () => void;
  onToggleLike: () => void;
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={onClick}
        className={`transition-colors ${
          active ? "text-black" : "text-black/30 hover:text-black/60"
        }`}
      >
        {children}
      </button>
      <div
        className={`absolute -bottom-2.5 h-1 w-1 rounded-full bg-black transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export function PlayerBar({
  track,
  isPlaying,
  isLiked,
  onTogglePlay,
  onToggleLike,
}: PlayerBarProps) {
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [progress, setProgress] = useState(84);
  const [volume, setVolume] = useState(70);

  return (
    <div className="glass-player shrink-0">
      <div className="progress-wrap relative h-[3px] w-[98%] cursor-pointer bg-black/6 mx-auto rounded-2xl">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(event) => setProgress(Number(event.target.value))}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="h-full rounded-full bg-black/60"
          style={{ width: `${progress}%` }}
        />
        <div
          className="progress-thumb pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white opacity-0 shadow-sm transition-opacity"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="flex h-[72px] items-center gap-4 px-6">
        {/* <div className="flex w-[260px] shrink-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-black/8 shadow-sm">
            {track?.coverUrl && (
              <img
                src={track.coverUrl}
                alt={track.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {track ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm leading-tight font-semibold text-black">
                {track.title}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-black/40">
                {track.artist}
              </p>
            </div>
          ) : (
            <p className="text-sm text-black/25">Nothing playing</p>
          )}
          <button
            onClick={onToggleLike}
            className={`shrink-0 transition-colors ${
              isLiked ? "text-red-400" : "text-black/20 hover:text-red-400"
            }`}
          >
            <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div> */}
        <div className="w-[240px]"></div>

        <div className="flex flex-1 items-center justify-center gap-6">
          <ToggleBtn
            active={isShuffle}
            onClick={() => setIsShuffle((value) => !value)}
          >
            <Shuffle size={15} />
          </ToggleBtn>
          <button className="text-black/50 transition-colors hover:text-black">
            <SkipBack size={19} strokeWidth={2} />
          </button>
          <button
            onClick={onTogglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105"
          >
            {isPlaying ? (
              <Pause size={17} className="text-black" strokeWidth={2.5} />
            ) : (
              <Play
                size={17}
                className="translate-x-[1px] text-black"
                strokeWidth={2.5}
              />
            )}
          </button>
          <button className="text-black/50 transition-colors hover:text-black">
            <SkipForward size={19} strokeWidth={2} />
          </button>
          <ToggleBtn
            active={isRepeat}
            onClick={() => setIsRepeat((value) => !value)}
          >
            <Repeat size={15} />
          </ToggleBtn>
        </div>

        <div className="flex w-[260px] shrink-0 items-center justify-end gap-3">
          <span className="tabular-nums text-[11px] text-black/30">3:38</span>
          <span className="text-[11px] text-black/20">/</span>
          <span className="tabular-nums text-[11px] text-black/30">
            {track?.duration ?? "0:00"}
          </span>
          <div className="mx-1 h-3 w-px bg-black/10" />
          <Volume2 size={14} className="shrink-0 text-black/35" />
          <div className="relative flex h-4 w-20 items-center">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-black/50"
                style={{ width: `${volume}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
