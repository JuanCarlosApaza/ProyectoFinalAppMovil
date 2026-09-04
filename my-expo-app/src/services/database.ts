import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '@/constants';
import type { Album, Song } from '@/types';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
  }
  return db;
};

export const initDatabase = (): void => {
  const database = getDatabase();
  database.execSync(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      filename TEXT,
      uri TEXT,
      mediaType TEXT
    );

    CREATE TABLE IF NOT EXISTS albumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE,
      gradient TEXT
    );

    CREATE TABLE IF NOT EXISTS canciones_album (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      album_id INTEGER,
      song_id TEXT,
      FOREIGN KEY(album_id) REFERENCES albumes(id) ON DELETE CASCADE,
      FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE,
      UNIQUE(album_id, song_id)
    );
  `);
};

export const loadAlbums = (): Album[] => {
  const database = getDatabase();
  const result: any[] = database.getAllSync('SELECT * FROM albumes');
  return result.map(album => ({
    id: album.id,
    nombre: album.nombre,
    coverGradient: album.gradient ? JSON.parse(album.gradient) : ['#FDD835', '#FFFFFF'],
    songs: [],
  }));
};

export const loadAlbumSongs = (albumId: number): Song[] => {
  const database = getDatabase();
  return database.getAllSync(
    `SELECT s.id, s.filename, s.uri, s.mediaType
     FROM canciones_album ca
     JOIN songs s ON ca.song_id = s.id
     WHERE ca.album_id = ?`,
    [albumId]
  );
};

export const createAlbum = (name: string, gradient: string[]): void => {
  const database = getDatabase();
  database.runSync(
    'INSERT INTO albumes (nombre, gradient) VALUES (?, ?)',
    [name, JSON.stringify(gradient)]
  );
};

export const updateAlbum = (albumId: number, name: string, gradient: string[]): void => {
  const database = getDatabase();
  database.runSync(
    'UPDATE albumes SET nombre = ?, gradient = ? WHERE id = ?',
    [name, JSON.stringify(gradient), albumId]
  );
};

export const deleteAlbum = (albumId: number): void => {
  const database = getDatabase();
  database.runSync('DELETE FROM albumes WHERE id = ?', [albumId]);
};

export const addSongToAlbum = (albumId: number, song: Song): void => {
  const database = getDatabase();
  database.runSync(
    'INSERT OR IGNORE INTO songs (id, filename, uri, mediaType) VALUES (?, ?, ?, ?)',
    [song.id.toString(), song.filename, song.uri, song.mediaType]
  );
  database.runSync(
    'INSERT OR IGNORE INTO canciones_album (album_id, song_id) VALUES (?, ?)',
    [albumId, song.id.toString()]
  );
};

export const removeSongFromAlbum = (albumId: number, songId: string): void => {
  const database = getDatabase();
  database.runSync(
    'DELETE FROM canciones_album WHERE album_id = ? AND song_id = ?',
    [albumId, songId]
  );
};

export const getAllAlbums = (): any[] => {
  const database = getDatabase();
  return database.getAllSync('SELECT * FROM albumes');
};
