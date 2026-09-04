import { NativeModules, Platform } from 'react-native';

const YTDL = Platform.OS === 'android' ? NativeModules.YouTubeDownloader : null;

export const initDownloader = async (): Promise<string> => {
  console.log('[DL] initDownloader called, Platform:', Platform.OS);
  console.log('[DL] YTDL module:', YTDL ? 'FOUND' : 'NULL');
  if (!YTDL) return 'skip';
  try {
    console.log('[DL] Calling YTDL.init()...');
    const result = await YTDL.init();
    console.log('[DL] YTDL.init() result:', result);
    return result;
  } catch (e: any) {
    console.error('[DL] YTDL.init() ERROR:', e.message || e);
    throw e;
  }
};

export const downloadAudio = async (videoId: string): Promise<any> => {
  console.log('[DL] downloadAudio called for:', videoId);
  if (!YTDL) {
    console.error('[DL] YTDL module is NULL, cannot download');
    throw new Error('Solo disponible en Android');
  }
  try {
    console.log('[DL] Calling YTDL.downloadAudio...');
    const result = await YTDL.downloadAudio(videoId);
    console.log('[DL] downloadAudio result:', JSON.stringify(result));
    return result;
  } catch (e: any) {
    console.error('[DL] downloadAudio ERROR:', e.message || e);
    throw e;
  }
};
