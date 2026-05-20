export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  addedAt: string;
  duration: string;
  coverUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  collaborators: string[];
  coverUrl?: string;
  tracks: Track[];
}
