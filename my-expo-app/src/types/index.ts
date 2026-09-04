export interface Song {
  id: string;
  filename: string;
  uri: string;
  mediaType: string;
  duration?: number;
}

export interface Track {
  id: string;
  filename: string;
  uri: string;
  mediaType: string;
  title?: string;
  artist?: string;
  album?: string;
  coverArt?: string;
  duration?: number;
  isFavorite?: boolean;
  playCount?: number;
  addedAt?: number;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlaybackMetrics {
  positionMs: number;
  durationMs: number;
  isBuffering: boolean;
  rate: number;
  volume: number;
}

export interface PlayerControllerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  metrics: PlaybackMetrics;
}

export interface PlayerControllerActions {
  loadTrack: (track: Track, queue?: Track[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (positionMs: number) => Promise<void>;
  skipNext: () => void;
  skipPrevious: () => void;
  setShuffle: (enabled: boolean) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setVolume: (volume: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  destroy: () => Promise<void>;
}

export interface Album {
  id: number;
  nombre: string;
  coverGradient: string[];
  songs: Song[];
  isFavorites?: boolean;
}

export interface AudioState {
  currentSong: Song | null;
  allSongs: Song[];
  isPlaying: boolean;
  playbackStatus: any;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  playSound: (song: Song, list: Song[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  seekTo: (position: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export type UsePlayerController = PlayerControllerState & PlayerControllerActions;

export interface SongInfo {
  artista: string;
  cancion: string;
}

export interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      default?: { url: string };
      high?: { url: string };
    };
  };
}
