import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import type {
  Track,
  RepeatMode,
  PlaybackMetrics,
  UsePlayerController,
} from '@/types';

const METRICS_INTERVAL = 1000;

const initialMetrics: PlaybackMetrics = {
  positionMs: 0,
  durationMs: 0,
  isBuffering: false,
  rate: 1.0,
  volume: 1.0,
};

export const usePlayerController = (): UsePlayerController => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [metrics, setMetrics] = useState<PlaybackMetrics>(initialMetrics);

  const soundRef = useRef<Audio.Sound | null>(null);
  const isLoadingRef = useRef(false);

  const repeatModeRef = useRef<RepeatMode>('off');
  const isShuffleRef = useRef(false);
  const queueRef = useRef<Track[]>([]);
  const currentTrackRef = useRef<Track | null>(null);

  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);

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

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const computeNextTrack = useCallback((): Track | null => {
    const list = queueRef.current;
    const current = currentTrackRef.current;
    if (!current || list.length === 0) return null;

    if (isShuffleRef.current) {
      const others = list.filter((t) => t.id !== current.id);
      return others[Math.floor(Math.random() * others.length)] ?? list[0];
    }

    const idx = list.findIndex((t) => t.id === current.id);
    const isLast = idx === list.length - 1;

    if (isLast) {
      return repeatModeRef.current === 'all' ? list[0] : null;
    }
    return list[idx + 1];
  }, []);

  const handlePlaybackUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        setMetrics((prev) => ({ ...prev, isBuffering: status.isLoaded === false }));
        return;
      }

      setMetrics({
        positionMs: status.positionMillis,
        durationMs: status.durationMillis ?? 0,
        isBuffering: status.isBuffering,
        rate: status.rate,
        volume: status.volume,
      });
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish && !status.isLooping) {
        if (repeatModeRef.current === 'one') {
          soundRef.current?.replayAsync();
        } else {
          const next = computeNextTrack();
          if (next) {
            loadTrackInternal(next, queueRef.current);
          }
        }
      }
    },
    [computeNextTrack]
  );

  const loadTrackInternal = useCallback(
    async (track: Track, trackQueue: Track[]) => {
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

        setCurrentTrack(track);
        setQueue(trackQueue);

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          { shouldPlay: true, progressUpdateIntervalMillis: METRICS_INTERVAL }
        );

        soundRef.current = sound;
        setIsPlaying(true);
        sound.setOnPlaybackStatusUpdate(handlePlaybackUpdate);
      } catch {
        // silent fail — UI stays in previous state
      } finally {
        isLoadingRef.current = false;
      }
    },
    [handlePlaybackUpdate]
  );

  const loadTrack = useCallback(
    async (track: Track, trackQueue?: Track[]) => {
      const list = trackQueue ?? queueRef.current;
      await loadTrackInternal(track, list);
    },
    [loadTrackInternal]
  );

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current || isLoadingRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, [isPlaying]);

  const seekTo = useCallback(async (positionMs: number) => {
    await soundRef.current?.setPositionAsync(positionMs);
  }, []);

  const skipNext = useCallback(() => {
    if (isLoadingRef.current) return;
    const next = computeNextTrack();
    if (next) loadTrackInternal(next, queueRef.current);
  }, [computeNextTrack, loadTrackInternal]);

  const skipPrevious = useCallback(() => {
    if (isLoadingRef.current) return;
    const list = queueRef.current;
    const current = currentTrackRef.current;
    if (!current || list.length === 0) return;

    const idx = list.findIndex((t) => t.id === current.id);
    const prevIdx = (idx - 1 + list.length) % list.length;
    loadTrackInternal(list[prevIdx], list);
  }, [loadTrackInternal]);

  const setShuffle = useCallback((enabled: boolean) => {
    setIsShuffle(enabled);
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    await soundRef.current?.setVolumeAsync(volume);
  }, []);

  const setRate = useCallback(async (rate: number) => {
    await soundRef.current?.setRateAsync(rate, true);
  }, []);

  const destroy = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {
        // ignore
      }
      soundRef.current = null;
    }
    setCurrentTrack(null);
    setQueue([]);
    setIsPlaying(false);
    setMetrics(initialMetrics);
  }, []);

  return {
    currentTrack,
    queue,
    isPlaying,
    isShuffle,
    repeatMode,
    metrics,
    loadTrack,
    togglePlayPause,
    seekTo,
    skipNext,
    skipPrevious,
    setShuffle,
    setRepeatMode,
    setVolume,
    setRate,
    destroy,
  };
};
