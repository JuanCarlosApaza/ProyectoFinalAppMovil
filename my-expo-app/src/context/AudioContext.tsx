import React, { createContext, useContext, useState, useRef } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext<any>(null);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<any | null>(null);
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const playSound = async (song: any, list: any[]) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      
      setCurrentSong(song);
      setAllSongs(list);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true }
      );

      soundRef.current = newSound;
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackStatus(status);
          setIsPlaying(status.isPlaying); 
          
          if (status.didJustFinish) {
            const index = list.findIndex((s) => s.id === song.id);
            const nextSong = list[(index + 1) % list.length];
            playSound(nextSong, list);
          }
        }
      });
    } catch (error) {
      console.log("Error Context Play:", error);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const seekTo = async (position: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(position);
    }
  };

  return (
    <AudioContext.Provider value={{ 
        currentSong, isPlaying, playbackStatus, 
        playSound, togglePlayPause, allSongs, seekTo 
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);