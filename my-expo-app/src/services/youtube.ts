import type { YouTubeVideo } from '@/types';

const getApiKey = (): string => {
  const key = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
  if (!key) throw new Error('Missing EXPO_PUBLIC_YOUTUBE_API_KEY');
  return key;
};

export const searchYouTube = async (query: string): Promise<YouTubeVideo[]> => {
  const apiKey = getApiKey();
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=25&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`);
  }

  const data = await res.json();
  return data.items || [];
};

export const getVideoDetails = async (videoId: string): Promise<any> => {
  const apiKey = getApiKey();
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`);
  }

  const data = await res.json();
  return data.items?.[0] || null;
};
