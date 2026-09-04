import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Music, User, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react-native';
import { extractSongInfoWithJson } from '@/services/groq';
import type { SongInfo } from '@/types';

interface ArtistExtractorProps {
  visible: boolean;
  onClose: (data: SongInfo) => void;
  nombreMusica: string;
}

const ArtistExtractor = ({ visible, onClose, nombreMusica }: ArtistExtractorProps) => {
  const [loading, setLoading] = useState(false);
  const [songInfo, setSongInfo] = useState<SongInfo>({ artista: '', cancion: '' });
  const [needsAuthor, setNeedsAuthor] = useState(false);

  useEffect(() => {
    if (visible && nombreMusica) {
      analyzeWithAI(nombreMusica);
    }
  }, [visible, nombreMusica]);

  const analyzeWithAI = async (texto: string) => {
    setLoading(true);
    setNeedsAuthor(false);

    try {
      const result = await extractSongInfoWithJson(texto);

      if (!result.artista && !result.cancion) {
        setSongInfo({ artista: '', cancion: texto });
        setNeedsAuthor(true);
      } else {
        setSongInfo(result);
        if (!result.artista) {
          setNeedsAuthor(true);
        }
      }
    } catch (error) {
      console.error("Error IA:", error);
      setSongInfo({ artista: '', cancion: texto });
      setNeedsAuthor(true);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View className="w-full bg-slate-900/50 rounded-3xl p-6 border border-white/10 my-4">
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center">
          <View className={`p-2 rounded-xl ${needsAuthor ? 'bg-amber-500/20' : 'bg-purple-500/20'}`}>
            <Sparkles color={needsAuthor ? "#f59e0b" : "#a855f7"} size={18} />
          </View>
          <View className="ml-3">
            <Text className="text-white font-bold uppercase tracking-widest text-sm">
              {needsAuthor ? "Completar Datos" : "IA Identificó"}
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="py-10 items-center">
          <ActivityIndicator size="large" color="#a855f7" />
          <Text className="text-slate-500 mt-4 font-medium italic text-xs">Analizando track...</Text>
        </View>
      ) : (
        <View>
          {needsAuthor && (
            <View className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-5 flex-row items-center">
              <AlertCircle color="#f59e0b" size={16} />
              <Text className="text-amber-500 text-[10px] ml-2 font-bold flex-1">
                Título confuso. Por favor, confirma el Artista.
              </Text>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-slate-500 text-[9px] font-black uppercase mb-2 ml-1 tracking-widest">Artista</Text>
            <View className="flex-row items-center bg-slate-800/60 border border-white/5 rounded-2xl px-4">
              <User size={14} color={songInfo.artista ? "#a855f7" : "#475569"} />
              <TextInput
                value={songInfo.artista}
                onChangeText={(t) => setSongInfo({...songInfo, artista: t})}
                placeholder="Artista..."
                placeholderTextColor="#475569"
                className="flex-1 p-3 text-white text-base font-bold"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-500 text-[9px] font-black uppercase mb-2 ml-1 tracking-widest">Canción</Text>
            <View className="flex-row items-center bg-slate-800/60 border border-white/5 rounded-2xl px-4">
              <Music size={14} color="#a855f7" />
              <TextInput
                value={songInfo.cancion}
                onChangeText={(t) => setSongInfo({...songInfo, cancion: t})}
                className="flex-1 p-3 text-white text-base font-medium"
                placeholder="Canción..."
                placeholderTextColor="#475569"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => onClose(songInfo)}
            activeOpacity={0.8}
            className="bg-purple-600 py-4 rounded-2xl items-center"
          >
            <View className="flex-row items-center">
              <CheckCircle2 size={16} color="white" />
              <Text className="text-white font-black uppercase ml-2 text-xs tracking-widest">Listo</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ArtistExtractor;
