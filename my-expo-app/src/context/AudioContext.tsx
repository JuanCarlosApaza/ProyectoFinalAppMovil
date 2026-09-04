import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

interface AudioColdContextValue {
  currentSong: any | null;
  allSongs: any[];
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playSound: (song: any, list: any[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  seekTo: (position: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

interface AudioHotContextValue {
  playbackStatus: any;
}

const AudioColdContext = createContext<AudioColdContextValue | null>(null);
const AudioHotContext = createContext<AudioHotContextValue | null>(null);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<any | null>(null);
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  const soundRef = useRef<Audio.Sound | null>(null);
  const isLoadingRef = useRef(false);
  const repeatModeRef = useRef(repeatMode);
  const isShuffleRef = useRef(isShuffle);
  const allSongsRef = useRef(allSongs);
  const currentSongRef = useRef(currentSong);

  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { allSongsRef.current = allSongs; }, [allSongs]);
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const playNext = useCallback(() => {
    if (isLoadingRef.current) return;
    const list = allSongsRef.current;
    const current = currentSongRef.current;
    if (!current || list.length === 0) return;

    let nextSong;
    if (isShuffleRef.current) {
      const otherSongs = list.filter(s => s.id !== current.id);
      nextSong = otherSongs[Math.floor(Math.random() * otherSongs.length)] || list[0];
    } else {
      const index = list.findIndex(s => s.id === current.id);
      const isLast = index === list.length - 1;
      nextSong = isLast ? (repeatModeRef.current === 'all' ? list[0] : null) : list[index + 1];
    }

    if (nextSong) playSound(nextSong, list);
  }, []);

  const playSound = useCallback(async (song: any, list: any[]) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch {
          // ignore cleanup errors
        }
        soundRef.current = null;
      }

      setCurrentSong(song);
      setAllSongs(list);

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 1000 }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setPlaybackStatus(status);
        setIsPlaying(status.isPlaying);

        if (status.didJustFinish && !status.isLooping) {
          if (repeatModeRef.current === 'one') {
            sound.replayAsync();
          } else {
            playNext();
          }
        }
      });
    } catch {
      // silent fail
    } finally {
      isLoadingRef.current = false;
    }
  }, [playNext]);

  const playPrevious = useCallback(() => {
    if (isLoadingRef.current || !currentSongRef.current || allSongsRef.current.length === 0) return;
    const list = allSongsRef.current;
    const index = list.findIndex(s => s.id === currentSongRef.current!.id);
    const prevIndex = (index - 1 + list.length) % list.length;
    playSound(list[prevIndex], list);
  }, [playSound]);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current || isLoadingRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, [isPlaying]);

  const seekTo = useCallback(async (position: number) => {
    if (soundRef.current) await soundRef.current.setPositionAsync(position);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  }, []);

  const coldValue = useMemo<AudioColdContextValue>(() => ({
    currentSong, allSongs, isPlaying, isShuffle, repeatMode,
    playSound, playNext, playPrevious, togglePlayPause,
    seekTo, toggleShuffle, toggleRepeat,
  }), [
    currentSong, allSongs, isPlaying, isShuffle, repeatMode,
    playSound, playNext, playPrevious, togglePlayPause,
    seekTo, toggleShuffle, toggleRepeat,
  ]);

  const hotValue = useMemo<AudioHotContextValue>(() => ({
    playbackStatus,
  }), [playbackStatus]);

  return (
    <AudioColdContext.Provider value={coldValue}>
      <AudioHotContext.Provider value={hotValue}>
        {children}
      </AudioHotContext.Provider>
    </AudioColdContext.Provider>
  );
};

export const useAudio = () => useContext(AudioColdContext);
export const usePlaybackStatus = () => useContext(AudioHotContext);
