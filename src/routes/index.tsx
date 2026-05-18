import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '../components/sidebar/Sidebar'
import { PlaylistView } from '../components/playlist/PlaylistView'
import { PlayerBar } from '../components/player/PlayerBar'
import { TopBar } from '../components/TopBar'
import { MOCK_PLAYLISTS, MOCK_CURRENT_TRACK } from '../lib/mockData'
import type { Track } from '../types/music'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [activePlaylistId, setActivePlaylistId] = useState(MOCK_PLAYLISTS[0].id)
  const [currentTrack, setCurrentTrack] = useState<Track>(MOCK_CURRENT_TRACK)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const activePlaylist = MOCK_PLAYLISTS.find((p) => p.id === activePlaylistId) ?? MOCK_PLAYLISTS[0]

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    setIsLiked(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#f2f2f2]">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          playlists={MOCK_PLAYLISTS}
          activePlaylistId={activePlaylistId}
          currentTrack={currentTrack}
          isLiked={isLiked}
          onSelectPlaylist={setActivePlaylistId}
          onToggleLike={() => setIsLiked((v) => !v)}
        />

        {/* Soft shadow divider instead of a border */}
        <div className="w-px bg-gradient-to-b from-transparent via-black/8 to-transparent shrink-0" />

        <main className="flex-1 overflow-y-auto bg-[#f6f6f6]">
          <PlaylistView
            playlist={activePlaylist}
            currentTrackId={currentTrack.id}
            onTrackSelect={handleTrackSelect}
          />
        </main>
      </div>

      {/* Soft shadow divider above player */}
      <div className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent shrink-0" />

      <PlayerBar
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((v) => !v)}
      />
    </div>
  )
}
