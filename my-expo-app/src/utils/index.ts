import { AUDIO_EXTENSIONS } from '@/constants';

export const formatTime = (millis: number): string => {
  if (!millis) return '0:00';
  const totalSeconds = millis / 1000;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const cleanFileName = (filename: string): string => {
  return filename.replace(AUDIO_EXTENSIONS, '');
};

export const sanitizeFileName = (name: string): string => {
  return name.replace(/[/\\?%*:|"<>]/g, '_');
};
