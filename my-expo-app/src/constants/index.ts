export const COLORS = {
  primary: '#FDD835',
  background: '#020617',
  backgroundDark: '#000000',
  surface: '#0f172a',
  surfaceLight: '#1a1a1a',
  text: '#ffffff',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  border: 'rgba(255,255,255,0.1)',
} as const;

export const GRADIENTS: string[][] = [
  ['#FDD835', '#FFFFFF'],
  ['#000000', '#FDD835'],
  ['#FDD835', '#FFB300'],
  ['#1A1A1A', '#3A3A3A'],
  ['#FFFFFF', '#FDD835'],
  ['#FFD700', '#FFF8DC'],
  ['#FF1744', '#FF8A80'],
];

export const DB_NAME = 'beatbox.db';

export const GROQ_MODEL = 'llama-3.3-70b-versatile';

export const AUDIO_EXTENSIONS = /\.(mp3|wav|m4a|aac)$/i;
