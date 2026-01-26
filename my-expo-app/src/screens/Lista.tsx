import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MoreVertical, Disc3, RefreshCw, Search, Headphones, Music2, CassetteTape } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';
import Navbar from '@/navigation/Navbar';
const Lista = () => {
    const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);
    const [search, setSearch] = useState('');
    const navigation = useNavigation<any>();
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const scanMusic = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
            const media = await MediaLibrary.getAssetsAsync({
                mediaType: 'audio',
                sortBy: 'modificationTime',
            });
            setSongs(media.assets);
        } else {
            Alert.alert("Permiso denegado", "Se requiere acceso a tus archivos.");
        }
    };

    useEffect(() => { scanMusic(); }, []);

    const filteredSongs = songs.filter(song =>
        song.filename.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View className="flex-1 bg-[#020617]">
            <View className="px-6 pt-16 pb-6">
                <View className="flex-row items-center justify-between mb-8">
                    <View className="flex-1">
                        <View className="bg-cyan-500/10 self-start px-3 py-1 rounded-full border border-cyan-500/20 mb-3">
                            <Text className="text-cyan-400 font-black text-[10px] uppercase tracking-[3px]">
                                Reproductor Local
                            </Text>
                        </View>

                        <View className="flex-row items-end">
                            <Text className="text-white text-5xl font-black tracking-tighter">
                                Musica
                            </Text>
                        </View>
                    </View>

                    <View className="relative">
                        <View className="absolute -inset-4 bg-cyan-500/10 rounded-full opacity-50" />
                        <Headphones color="#22d3ee" size={70} strokeWidth={1} />
                    </View>
                </View>

                <View className="flex-row items-center bg-slate-900/80 px-5 py-4 rounded-3xl border border-white/5 shadow-2xl">
                    <Search color="#22d3ee" size={20} strokeWidth={2.5} />
                    <TextInput
                        placeholder="Busca tu música..."
                        placeholderTextColor="#475569"
                        className="flex-1 ml-4 text-white font-bold text-base"
                        value={search}
                        onChangeText={setSearch}
                    />
                    <TouchableOpacity onPress={scanMusic} className="bg-cyan-500/20 p-2 rounded-xl">
                        <RefreshCw color="#22d3ee" size={16} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 140 }}
            >
                <View className="flex-row items-center mb-6 px-1">
                    <Music2 color="#22d3ee" size={16} />
                    <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[2px] ml-2">
                        {filteredSongs.length} Pistas Encontradas
                    </Text>
                </View>

                {filteredSongs.map((track) => (
                    <TouchableOpacity
                        key={track.id}
                        activeOpacity={0.6}
                        onPress={() => navigation.navigate('Reproductor', {
                            song: track,
                            allSongs: filteredSongs 
                        })} className="flex-row items-center justify-between py-3 mb-2"
                    >
                        <View className="flex-row items-center flex-1 mr-4">
                            <View className="w-12 h-12 rounded-2xl bg-slate-900 items-center justify-center mr-4 border border-white/5">
                                <Disc3 color="#22d3ee" size={22} strokeWidth={1.5} />
                            </View>

                            <View className="flex-1">
                                <Text numberOfLines={1} className="text-slate-100 font-bold text-[15px] mb-1">
                                    {track.filename.replace(/\.(mp3|wav|m4a|aac)$/i, '')}
                                </Text>
                                <View className="flex-row items-center">
                                    <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-tighter">
                                        {formatTime(track.duration)} • Audio Digital
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity className="p-2">
                            <MoreVertical color="#334155" size={18} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}

                {filteredSongs.length === 0 && (
                    <View className="py-20 items-center">
                        <CassetteTape color="#1e293b" size={60} strokeWidth={1} />
                        <Text className="text-slate-600 font-bold mt-4 tracking-widest text-[10px] uppercase">
                            No hay resultados
                        </Text>
                    </View>
                )}
            </ScrollView>
            <Navbar/>
        </View>
    );
};

export default Lista;