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
    <div className="flex flex-col h-full">
      <div className="flex flex-1 min-h-0">
        <Sidebar
          playlists={MOCK_PLAYLISTS}
          activePlaylistId={activePlaylistId}
          onSelectPlaylist={setActivePlaylistId}
        />

        <div
          className="w-px shrink-0"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.07) 20%, rgba(0,0,0,0.07) 80%, transparent)' }}
        />

        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          <TopBar />

          <div
            className="h-px shrink-0 mx-6"
            style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.06) 20%, rgba(0,0,0,0.06) 80%, transparent)' }}
          />

          <div className="flex-1 overflow-y-auto">
            <PlaylistView
              playlist={activePlaylist}
              currentTrackId={currentTrack.id}
              onTrackSelect={handleTrackSelect}
            />
          </div>
        </main>
      </div>

      <div
        className="h-px shrink-0"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.08) 85%, transparent)' }}
      />

      <PlayerBar
        track={currentTrack}
        isPlaying={isPlaying}
        isLiked={isLiked}
        onTogglePlay={() => setIsPlaying((v) => !v)}
        onToggleLike={() => setIsLiked((v) => !v)}
      />
    </div>
  )
}
