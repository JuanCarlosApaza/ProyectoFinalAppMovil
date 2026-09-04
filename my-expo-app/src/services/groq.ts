import { GROQ_MODEL } from '@/constants';
import type { SongInfo } from '@/types';

const getApiKey = (): string => {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!key) throw new Error('Missing EXPO_PUBLIC_GROQ_API_KEY');
  return key;
};

const groqFetch = async (messages: any[], temperature = 1): Promise<any> => {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  return res.json();
};

export const extractSongInfo = async (filename: string): Promise<SongInfo> => {
  const data = await groqFetch([
    {
      role: 'system',
      content: 'Identifica ARTISTA y CANCIÓN. Devuelve JSON: {"artista": "...", "cancion": "..."}',
    },
    { role: 'user', content: filename },
  ], 1);
  return JSON.parse(data.choices[0].message.content);
};

export const extractSongInfoWithJson = async (filename: string): Promise<SongInfo> => {
  const data = await groqFetch([
    {
      role: 'system',
      content: `ERES UN EXTRACTOR DE METADATOS MUSICALES ESTRICTO.

REGLAS:
1. Analiza el nombre del archivo y extrae el artista y el título de la canción.
2. Si el nombre contiene guiones "-", el artista suele estar antes del guion.
3. Si el nombre contiene paréntesis, lo que hay dentro suele ser el artista featuring.
4. Si no puedes determinar el artista con certeza (>70%), devuelve: {"necesita_autor": true}
5. Si estás seguro, devuelve: {"artista": "...", "cancion": "..."}

EJEMPLOS:
- "Bad Bunny - Tití Me Preguntó" → {"artista": "Bad Bunny", "cancion": "Tití Me Preguntó"}
- "The Weeknd ft. Playboi Carti - Timeless" → {"artista": "The Weeknd", "cancion": "Timeless"}
- "unknown_song_2024" → {"necesita_autor": true}`,
    },
    { role: 'user', content: filename },
  ], 0.3);

  const result = JSON.parse(data.choices[0].message.content);

  if (result.necesita_autor) {
    return { artista: '', cancion: '' };
  }

  return { artista: result.artista, cancion: result.cancion };
};

export const translateLyrics = async (lyrics: string): Promise<string> => {
  const data = await groqFetch([
    {
      role: 'system',
      content: `ERES UN TRADUCTOR MUSICAL EXPERTO.
REGLAS:
1. Detecta el idioma: Si es Inglés traduce a Español. Si es Español traduce a Inglés.
2. Mantén los corchetes como [Verse], [Chorus], [Intro] exactamente igual, NO los traduzcas.
3. FORMATO OBLIGATORIO:
   Línea original
   »Traducción
4. No añadidas comentarios extra ni notas de autor.`,
    },
    { role: 'user', content: lyrics },
  ], 0.3);

  return data.choices[0].message.content;
};
