import { useState, type ReactNode } from "react";
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { formatSeconds, parseDuration } from "../../lib/formatDuration";
import type { Track } from "../../types/music";

interface PlayerBarProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (progress: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
  onVolumeChange: (volume: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
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
          active ? "text-fg" : "text-fg-muted hover:text-progress-fill-strong"
        }`}
      >
        {children}
      </button>
      <div
        className={`absolute -bottom-2.5 h-1 w-1 rounded-full bg-accent transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export function PlayerBar({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onSeek,
  onSeekStart,
  onSeekEnd,
  onVolumeChange,
  onSkipBack,
  onSkipForward,
}: PlayerBarProps) {
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const totalDuration =
    duration > 0 ? duration : track ? parseDuration(track.duration) : 0;
  const progress =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="glass-player shrink-0">
      <div className="progress-wrap relative mx-auto h-[3px] w-[98%] cursor-pointer rounded-2xl bg-progress-track">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          disabled={!track}
          onMouseDown={onSeekStart}
          onTouchStart={onSeekStart}
          onMouseUp={onSeekEnd}
          onTouchEnd={onSeekEnd}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
        />
        <div
          className="h-full rounded-full bg-progress-fill"
          style={{ width: `${progress}%` }}
        />
        <div
          className="progress-thumb pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-surface-elevated opacity-0 shadow-sm transition-opacity"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="flex h-[72px] items-center gap-4 px-6">
        <div className="w-[240px]"></div>

        <div className="flex flex-1 items-center justify-center gap-6">
          <ToggleBtn
            active={isShuffle}
            onClick={() => setIsShuffle((value) => !value)}
          >
            <Shuffle size={15} />
          </ToggleBtn>
          <button
            onClick={onSkipBack}
            disabled={!track}
            className="text-fg-subtle transition-colors hover:text-fg disabled:opacity-30"
          >
            <SkipBack size={19} strokeWidth={2} />
          </button>
          <button
            onClick={onTogglePlay}
            disabled={!track}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated shadow-md transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            {isPlaying ? (
              <Pause size={17} className="text-fg" strokeWidth={2.5} />
            ) : (
              <Play
                size={17}
                className="translate-x-px text-fg"
                strokeWidth={2.5}
              />
            )}
          </button>
          <button
            onClick={onSkipForward}
            disabled={!track}
            className="text-fg-subtle transition-colors hover:text-fg disabled:opacity-30"
          >
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
          <span className="tabular-nums text-[11px] text-fg-muted">
            {formatSeconds(currentTime)}
          </span>
          <span className="text-[11px] text-fg-faint">/</span>
          <span className="tabular-nums text-[11px] text-fg-muted">
            {totalDuration > 0
              ? formatSeconds(totalDuration)
              : (track?.duration ?? "0:00")}
          </span>
          <div className="mx-1 h-3 w-px bg-border" />
          <Volume2 size={14} className="shrink-0 text-fg-hint" />
          <div className="relative flex h-4 w-20 items-center">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-progress-fill-strong"
                style={{ width: `${volume}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
