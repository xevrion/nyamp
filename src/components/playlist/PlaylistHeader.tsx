import type { Playlist } from '../../types/music'

interface PlaylistHeaderProps {
  playlist: Playlist
}

export function PlaylistHeader({ playlist }: PlaylistHeaderProps) {
  return (
    <div className="flex items-end gap-8 px-8 pt-8 pb-6">
      <div className="w-[200px] h-[200px] shrink-0 rounded-xl bg-black/10 overflow-hidden shadow-md">
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-1 pb-2">
        <span className="text-xs font-semibold tracking-widest text-black/40 uppercase">
          Playlist
        </span>
        <h1 className="text-4xl font-bold text-black tracking-tight mt-1">
          {playlist.name}
        </h1>
        <p className="text-sm text-black/50 mt-1">
          {playlist.collaborators.join(', ')}
        </p>
      </div>
    </div>
  )
}
