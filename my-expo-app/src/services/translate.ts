import TranslateText, { TranslateLanguage } from '@react-native-ml-kit/translate-text';

const isEnglish = (text: string): boolean => {
  const words = text.toLowerCase().split(/\s+/);
  const englishIndicators = ['the', 'is', 'are', 'was', 'were', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'not', 'no', 'yes', 'me', 'him', 'us', 'them', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when', 'where', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very', 'just', 'about', 'also', 'here', 'there', 'then', 'now', 'so', 'if', 'up', 'out', 'don', 'get', 'got', 'let', 'like', 'love', 'want', 'need', 'know', 'think', 'say', 'said', 'tell', 'told', 'go', 'come', 'make', 'take', 'give', 'keep', 'put', 'see', 'look', 'find', 'try', 'use', 'way', 'thing', 'time', 'day', 'night', 'life', 'world', 'heart', 'mind', 'soul', 'eyes', 'face', 'hand', 'head', 'body', 'back', 'home', 'place', 'room', 'door', 'window', 'floor', 'wall', 'fire', 'water', 'air', 'earth', 'sky', 'sun', 'moon', 'star', 'light', 'dark', 'good', 'bad', 'new', 'old', 'big', 'little', 'long', 'short', 'high', 'low', 'right', 'left', 'first', 'last', 'next', 'same', 'different', 'true', 'false', 'real', 'feel', 'felt', 'sure', 'while', 'still', 'even', 'never', 'always', 'often', 'sometimes', 'away', 'alone', 'together', 'again', 'enough', 'maybe', 'already', 'though', 'since', 'until', 'before', 'after', 'between', 'under', 'over', 'through', 'into', 'onto', 'upon'];
  const matches = words.filter(w => englishIndicators.includes(w));
  return matches.length >= Math.ceil(words.length * 0.2);
};

export const translateLyrics = async (lyrics: string): Promise<string> => {
  const lines = lyrics.split('\n');
  const output = [...lines];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      continue;
    }

    try {
      const en = isEnglish(trimmed);
      const result = await TranslateText.translate({
        text: trimmed,
        sourceLanguage: en ? TranslateLanguage.ENGLISH : TranslateLanguage.SPANISH,
        targetLanguage: en ? TranslateLanguage.SPANISH : TranslateLanguage.ENGLISH,
        downloadModelIfNeeded: true,
      });
      output[i] = `${trimmed}\n»${result}`;
    } catch (err) {
      console.error('Translation error:', trimmed, err);
      output[i] = trimmed;
    }
  }

  return output.join('\n');
};
