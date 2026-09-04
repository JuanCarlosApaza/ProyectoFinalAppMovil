const getGeniusToken = (): string => {
  const token = process.env.EXPO_PUBLIC_GENIUS_API_KEY;
  if (!token) throw new Error('Missing EXPO_PUBLIC_GENIUS_API_KEY');
  return token;
};

const extractCleanLyrics = (html: string): string => {
  const regexMuro = /data-lyrics-container="true"[^>]*>([\s\S]*?)(?=data-lyrics-container="true"|class="RightSidebar|class="LyricsFooter|id="div-gpt-ad|$)/g;
  let match;
  let textoAcumulado = '';

  while ((match = regexMuro.exec(html)) !== null) {
    let bloque = match[1];
    bloque = bloque.replace(/<div[^>]*data-exclude-from-selection="true"[\s\S]*?<\/div>/g, '');
    bloque = bloque.replace(/<br\s*\/?>/gi, '\n');
    bloque = bloque.replace(/<[^>]+>/g, '');
    textoAcumulado += bloque + '\n';
  }

  let limpio = textoAcumulado
    .replace(/<div/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();

  const indicePrimerCorchete = limpio.indexOf('[');
  if (indicePrimerCorchete !== -1) {
    limpio = limpio.substring(indicePrimerCorchete);
  }

  return limpio;
};

export const searchLyrics = async (artist: string, song: string): Promise<string> => {
  const query = encodeURIComponent(`${artist} ${song}`);
  const searchRes = await fetch(
    `https://api.genius.com/search?q=${query}&access_token=${getGeniusToken()}`
  );
  const searchData = await searchRes.json();

  if (!searchData.response?.hits?.length) {
    throw new Error('Letra no encontrada');
  }

  const path = searchData.response.hits[0].result.path;
  const webRes = await fetch(`https://genius.com${path}`);
  const html = await webRes.text();

  return extractCleanLyrics(html);
};
