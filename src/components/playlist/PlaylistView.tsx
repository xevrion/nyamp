import {
  useCallback,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { ChevronUp } from "lucide-react";
import { formatAddedAt } from "../../lib/formatAddedAt";
import type { Playlist, Track } from "../../types/music";

interface PlaylistViewProps {
  playlist: Playlist;
  currentTrackId: string | null;
  onTrackSelect: (track: Track) => void;
  loading?: boolean;
  onAddMusicFolder?: () => void;
}

const FADE = "linear-gradient(to right, black calc(100% - 2rem), transparent 100%)";
const MIN_COL = 80;
const RESERVED = 144;

export function PlaylistView({
  playlist,
  currentTrackId,
  onTrackSelect,
  loading = false,
  onAddMusicFolder,
}: PlaylistViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [cols, setCols] = useState({
    title: 260,
    artist: 160,
    album: 160,
    added: 120,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{
    key: keyof typeof cols;
    startX: number;
    startW: number;
  } | null>(null);

  const onMouseDown = useCallback(
    (key: keyof typeof cols, event: ReactMouseEvent) => {
      event.preventDefault();
      dragging.current = { key, startX: event.clientX, startW: cols[key] };

      const onMove = (moveEvent: MouseEvent) => {
        if (!dragging.current) return;

        const containerWidth = containerRef.current?.clientWidth ?? 800;
        const maxTotal = containerWidth - RESERVED;
        const delta = moveEvent.clientX - dragging.current.startX;
        const newWidth = Math.max(MIN_COL, dragging.current.startW + delta);

        setCols((previous) => {
          const next = { ...previous, [dragging.current!.key]: newWidth };
          const total = next.title + next.artist + next.album + next.added;

          if (total > maxTotal) {
            next[dragging.current!.key] = newWidth - (total - maxTotal);
          }

          return next;
        });
      };

      const onUp = () => {
        dragging.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [cols],
  );

  const gridTemplate = `${cols.title}px ${cols.artist}px ${cols.album}px ${cols.added}px 1fr`;

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <div className="flex items-end gap-8 px-8 pt-4 pb-10">
        <div className="h-[180px] w-[180px] shrink-0 overflow-hidden rounded-2xl bg-black/8 shadow-2xl">
          {playlist.coverUrl && (
            <img
              src={playlist.coverUrl}
              alt={playlist.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col justify-end pb-1">
          <h1 className="mb-2 text-5xl leading-none font-bold tracking-tight text-black">
            {playlist.name}
          </h1>
          <p className="text-sm font-medium text-black/40">
            {playlist.collaborators.length > 0
              ? playlist.collaborators.join(", ")
              : `${playlist.tracks.length} tracks`}
          </p>
        </div>
      </div>

      <div ref={containerRef} className="px-8">
        <div
          className="select-none px-3 pb-3 text-[10px] font-bold uppercase tracking-widest text-black/30"
          style={{ display: "grid", gridTemplateColumns: gridTemplate }}
        >
          <div>Title</div>
          <div className="relative flex items-center gap-1">
            <span
              className="absolute top-0 -left-1.5 flex h-full w-3 cursor-col-resize items-center justify-center opacity-0 hover:opacity-100"
              onMouseDown={(event) => onMouseDown("title", event)}
            >
              <span className="h-3 w-px rounded-full bg-black/20" />
            </span>
            Artist
          </div>
          <div className="relative">
            <span
              className="absolute top-0 -left-1.5 flex h-full w-3 cursor-col-resize items-center justify-center opacity-0 hover:opacity-100"
              onMouseDown={(event) => onMouseDown("artist", event)}
            >
              <span className="h-3 w-px rounded-full bg-black/20" />
            </span>
            Album
          </div>
          <div className="relative flex items-center gap-1">
            <span
              className="absolute top-0 -left-1.5 flex h-full w-3 cursor-col-resize items-center justify-center opacity-0 hover:opacity-100"
              onMouseDown={(event) => onMouseDown("album", event)}
            >
              <span className="h-3 w-px rounded-full bg-black/20" />
            </span>
            Added <ChevronUp size={10} />
          </div>
          <div className="text-right">Duration</div>
        </div>

        <div
          className="mb-1 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(0,0,0,0.07) 20%, rgba(0,0,0,0.07) 80%, transparent)",
          }}
        />

        <div className="mt-1 space-y-0.5">
          {loading && playlist.tracks.length === 0 && (
            <p className="px-3 py-8 text-sm text-black/35">Scanning library…</p>
          )}

          {!loading && playlist.tracks.length === 0 && (
            <div className="flex flex-col items-start gap-4 px-3 py-12">
              <p className="text-sm text-black/40">
                No tracks yet. Add a music folder to get started.
              </p>
              {onAddMusicFolder && (
                <button
                  onClick={onAddMusicFolder}
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85"
                >
                  Add music folder
                </button>
              )}
            </div>
          )}

          {playlist.tracks.map((track) => {
            const isActive = track.id === currentTrackId;
            const isHovered = track.id === hoveredId;

            return (
              <div
                key={track.id}
                onMouseEnter={() => setHoveredId(track.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onTrackSelect(track)}
                className={`cursor-pointer select-none rounded-xl px-3 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-black/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                    : isHovered
                      ? "bg-black/[0.03]"
                      : ""
                }`}
                style={{ display: "grid", gridTemplateColumns: gridTemplate }}
              >
                <div
                  className={`overflow-hidden font-medium ${
                    isActive ? "text-black" : "text-black/70"
                  }`}
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
                <div className="truncate text-black/35">
                  {formatAddedAt(track.addedAt)}
                </div>
                <div className="text-right text-black/35">{track.duration}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
