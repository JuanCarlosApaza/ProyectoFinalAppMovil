import { documentDirectory, readAsStringAsync, writeAsStringAsync, deleteAsync, makeDirectoryAsync, getInfoAsync } from 'expo-file-system/legacy';

const CACHE_DIR = `${documentDirectory}lyrics/`;

let dirExists = false;

const ensureDir = async () => {
  if (dirExists) return;
  
  const dirInfo = await getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
  dirExists = true;
};

const getFilePath = (songId: string): string => {
  return `${CACHE_DIR}${songId}.txt`;
};

export const saveLyrics = async (songId: string, lyrics: string): Promise<void> => {
  await ensureDir();
  const path = getFilePath(songId);
  await writeAsStringAsync(path, lyrics);
};

export const loadLyrics = async (songId: string): Promise<string | null> => {
  await ensureDir();
  const path = getFilePath(songId);
  const info = await getInfoAsync(path);
  if (!info.exists) return null;
  return readAsStringAsync(path);
};

export const removeLyrics = async (songId: string): Promise<void> => {
  const path = getFilePath(songId);
  const info = await getInfoAsync(path);
  if (info.exists) {
    await deleteAsync(path);
  }
};

export const isLyricsCached = async (songId: string): Promise<boolean> => {
  await ensureDir();
  const path = getFilePath(songId);
  const info = await getInfoAsync(path);
  return info.exists;
};
