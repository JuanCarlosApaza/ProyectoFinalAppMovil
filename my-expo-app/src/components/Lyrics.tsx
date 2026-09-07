import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { Search, Languages } from 'lucide-react-native';
import { translateLyrics } from '@/services/translate';
import { searchLyrics } from '@/services/genius';
import { saveLyrics, loadLyrics } from '@/services/lyricsCache';

interface Props {
  songId: string;
  nombreMusica: string;
}

const Lyrics = ({ songId, nombreMusica }: Props) => {
  const [loading, setLoading] = useState(false);
  const [artista, setArtista] = useState('');
  const [cancion, setCancion] = useState('');
  const [lyrics, setLyrics] = useState<string>('');
  const [originalLyrics, setOriginalLyrics] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isTranslated, setIsTranslated] = useState(false);

  useEffect(() => {
    if (nombreMusica) {
      const parts = nombreMusica.split(' - ');
      if (parts.length >= 2) {
        setArtista(parts[0].trim());
        setCancion(parts.slice(1).join(' - ').trim());
      } else {
        setCancion(nombreMusica.trim());
      }
    }
  }, [nombreMusica]);

  useEffect(() => {
    loadLyrics(songId).then((cached) => {
      if (cached) {
        setOriginalLyrics(cached);
        setLyrics(cached);
        setIsTranslated(false);
      }
    });
  }, [songId]);

  const buscarLetra = async () => {
    if (!artista.trim() || !cancion.trim()) {
      setError('Escribe artista y canción.');
      return;
    }

    setLoading(true);
    setLyrics('');
    setIsTranslated(false);
    setError('');
    try {
      const textoLimpio = await searchLyrics(artista.trim(), cancion.trim());
      setOriginalLyrics(textoLimpio);
      setLyrics(textoLimpio);
      await saveLyrics(songId, textoLimpio);
    } catch {
      setError('No encontrada.');
    } finally {
      setLoading(false);
    }
  };

  const traducirLetra = async () => {
    if (!originalLyrics || isTranslated) return;
    setLoading(true);
    try {
      const textoTraducido = await translateLyrics(originalLyrics);
      setLyrics(textoTraducido);
      setIsTranslated(true);
    } catch {
      setError('Error en la traducción.');
    } finally {
      setLoading(false);
    }
  };

  const lyricsLines = useMemo(() => {
    if (!lyrics) return null;
    return lyrics.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine === "") return <View key={index} className="h-4" />;
      const isHeader = trimmedLine.startsWith('[') && trimmedLine.endsWith(']');
      const isTranslation = trimmedLine.startsWith('»');

      return (
        <Text
          key={index}
          className={isHeader
            ? "text-slate-500 text-[11px] font-black uppercase mt-4 mb-1"
            : isTranslation
            ? "text-indigo-400/90 text-[15px] italic mb-2"
            : "text-slate-100 text-[17px] font-semibold leading-6"}
        >
          {isTranslation ? trimmedLine.replace('»', '').trim() : trimmedLine}
        </Text>
      );
    });
  }, [lyrics]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <View className="flex-1 bg-[#05080e] px-4 pt-4">
        <View className="bg-slate-900 rounded-[30px] p-4 mb-4 border border-white/10 shadow-xl">
          <View className="flex-row gap-x-2">
            <View className="flex-1 bg-black/40 rounded-xl px-3 py-1 border border-white/5">
              <Text className="text-[9px] text-purple-400 font-bold uppercase">Artista</Text>
              <TextInput
                className="text-white text-xs py-0"
                value={artista}
                onChangeText={setArtista}
                placeholder="Ej: Bad Bunny"
                placeholderTextColor="#475569"
              />
            </View>
            <View className="flex-1 bg-black/40 rounded-xl px-3 py-1 border border-white/5">
              <Text className="text-[9px] text-purple-400 font-bold uppercase">Canción</Text>
              <TextInput
                className="text-white text-xs py-0"
                value={cancion}
                onChangeText={setCancion}
                placeholder="Ej: Tití Me Preguntó"
                placeholderTextColor="#475569"
              />
            </View>

            <TouchableOpacity
              onPress={traducirLetra}
              disabled={loading || !originalLyrics || isTranslated}
              className={`px-3 justify-center rounded-xl ${isTranslated ? 'bg-green-600/20' : 'bg-indigo-600'}`}
            >
              <Languages color={isTranslated ? "#4ade80" : "white"} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={buscarLetra}
              className="bg-purple-600 px-3 justify-center rounded-xl"
            >
              <Search color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1 bg-white/5 rounded-t-[40px] border-t border-white/10 overflow-hidden">
          {loading ? (
            <View className="mt-20 items-center">
              <ActivityIndicator color="#a855f7" size="large" />
              {isTranslated && <Text className="text-indigo-400 mt-4 font-bold text-xs">TRADUCIENDO...</Text>}
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
              {lyricsLines || <Text className="text-slate-500 text-center">{error || "Escribe artista y canción, luego presiona buscar"}</Text>}
            </ScrollView>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Lyrics;
