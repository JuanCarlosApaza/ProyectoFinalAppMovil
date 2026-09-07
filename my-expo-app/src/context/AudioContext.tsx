import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import type { Song } from '@/types';

interface AudioColdContextValue {
  currentSong: Song | null;
  allSongs: Song[];
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playSound: (song: Song, list: Song[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  seekTo: (position: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

interface AudioHotContextValue {
  positionMillis: number;
  durationMillis: number;
  isBuffering: boolean;
}

const AudioColdContext = createContext<AudioColdContextValue | null>(null);
const AudioHotContext = createContext<AudioHotContextValue | null>(null);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  const [hotState, setHotState] = useState<AudioHotContextValue>({
    positionMillis: 0,
    durationMillis: 0,
    isBuffering: false,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const isLoadingRef = useRef(false);
  const repeatModeRef = useRef(repeatMode);
  const isShuffleRef = useRef(isShuffle);
  const allSongsRef = useRef(allSongs);
  const currentSongRef = useRef(currentSong);
  const playNextRef = useRef<() => void>(() => {});

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

  const computeNextSong = useCallback((list: Song[], current: Song | null): Song | null => {
    if (!current || list.length === 0) return null;

    if (isShuffleRef.current) {
      const others = list.filter(s => s.id !== current.id);
      return others[Math.floor(Math.random() * others.length)] || list[0];
    }

    const index = list.findIndex(s => s.id === current.id);
    const isLast = index === list.length - 1;

    if (isLast) {
      return repeatModeRef.current === 'all' ? list[0] : null;
    }
    return list[index + 1];
  }, []);

  const playSound = useCallback(async (song: Song, list: Song[]) => {
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
        { shouldPlay: true, progressUpdateIntervalMillis: 500 }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
          setHotState(prev => ({ ...prev, isBuffering: true }));
          return;
        }

        setHotState({
          positionMillis: status.positionMillis,
          durationMillis: status.durationMillis ?? 0,
          isBuffering: status.isBuffering,
        });
        setIsPlaying(status.isPlaying);

        if (status.didJustFinish && !status.isLooping) {
          if (repeatModeRef.current === 'one') {
            sound.replayAsync();
          } else {
            playNextRef.current();
          }
        }
      });
    } catch {
      // silent fail
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  const playNext = useCallback(() => {
    if (isLoadingRef.current) return;
    const list = allSongsRef.current;
    const current = currentSongRef.current;
    const nextSong = computeNextSong(list, current);
    if (nextSong) playSound(nextSong, list);
  }, [computeNextSong, playSound]);

  useEffect(() => {
    playNextRef.current = playNext;
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

  return (
    <AudioColdContext.Provider value={coldValue}>
      <AudioHotContext.Provider value={hotState}>
        {children}
      </AudioHotContext.Provider>
    </AudioColdContext.Provider>
  );
};

export const useAudio = () => useContext(AudioColdContext);
export const usePlaybackStatus = () => useContext(AudioHotContext);
