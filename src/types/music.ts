export interface Track {
  id: string
  title: string
  artist: string
  album: string
  addedAt: string // e.g. "3 days ago"
  duration: string // e.g. "3:45"
  coverUrl?: string
}

export interface Playlist {
  id: string
  name: string
  collaborators: string[]
  coverUrl?: string
  tracks: Track[]
}
