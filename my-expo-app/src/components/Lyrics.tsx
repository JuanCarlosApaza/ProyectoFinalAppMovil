import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { Search, Languages } from 'lucide-react-native';
import { extractSongInfo, translateLyrics } from '@/services/groq';
import { searchLyrics } from '@/services/genius';
import type { SongInfo } from '@/types';

interface Props {
  nombreMusica: string;
}

const Lyrics = ({ nombreMusica }: Props) => {
  const [loading, setLoading] = useState(false);
  const [infoMusica, setInfoMusica] = useState<SongInfo>({ artista: '', cancion: '' });
  const [lyrics, setLyrics] = useState<string>('');
  const [originalLyrics, setOriginalLyrics] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isTranslated, setIsTranslated] = useState(false);

  useEffect(() => {
    if (nombreMusica) analizarYBuscar(nombreMusica);
  }, [nombreMusica]);

  const analizarYBuscar = async (texto: string) => {
    setLoading(true);
    setError('');
    try {
      const resultado = await extractSongInfo(texto);
      setInfoMusica(resultado);
      buscarLetra(resultado.artista, resultado.cancion);
    } catch (e) {
      setLoading(false);
      setError('Error de identificación');
    }
  };

  const buscarLetra = async (artista: string, cancion: string) => {
    setLoading(true);
    setLyrics('');
    setIsTranslated(false);
    try {
      const textoLimpio = await searchLyrics(artista, cancion);
      setOriginalLyrics(textoLimpio);
      setLyrics(textoLimpio);
    } catch (e) {
      setError('No encontrada.');
    } finally {
      setLoading(false);
    }
  };

  const traducirLetraConIA = async () => {
    if (!originalLyrics || isTranslated) return;
    setLoading(true);
    try {
      const textoTraducido = await translateLyrics(originalLyrics);
      setLyrics(textoTraducido);
      setIsTranslated(true);
    } catch (e) {
      setError('Error en la traducción con IA.');
      console.error(e);
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
                value={infoMusica.artista}
                onChangeText={(t) => setInfoMusica({ ...infoMusica, artista: t })}
              />
            </View>
            <View className="flex-1 bg-black/40 rounded-xl px-3 py-1 border border-white/5">
              <Text className="text-[9px] text-purple-400 font-bold uppercase">Canción</Text>
              <TextInput
                className="text-white text-xs py-0"
                value={infoMusica.cancion}
                onChangeText={(t) => setInfoMusica({ ...infoMusica, cancion: t })}
              />
            </View>

            <TouchableOpacity
              onPress={traducirLetraConIA}
              disabled={loading || !originalLyrics || isTranslated}
              className={`px-3 justify-center rounded-xl ${isTranslated ? 'bg-green-600/20' : 'bg-indigo-600'}`}
            >
              <Languages color={isTranslated ? "#4ade80" : "white"} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => buscarLetra(infoMusica.artista, infoMusica.cancion)}
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
              {isTranslated && <Text className="text-indigo-400 mt-4 font-bold text-xs">TRADUCIENDO CON IA...</Text>}
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
              {lyricsLines || <Text className="text-slate-500 text-center">{error || "Busca algo..."}</Text>}
            </ScrollView>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Lyrics;
