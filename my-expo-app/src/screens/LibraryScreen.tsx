import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, InteractionManager, ActivityIndicator } from 'react-native';
import { FlashList } from "@shopify/flash-list";
import { Search, RefreshCw, Music2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useAudio } from '@/context/AudioContext';
import BottomTabBar from '@/navigation/BottomTabBar';
import SongItem from '@/components/SongItem';
import MiniPlayer from '@/components/MiniPlayer';
import { formatDuration } from '@/utils';
import type { Song } from '@/types';

const LibraryScreen = () => {
    const { currentSong, playSound } = useAudio()!;
    const [songs, setSongs] = useState<Song[]>([]);
    const [search, setSearch] = useState('');
    const [isReady, setIsReady] = useState(false);

    const scanMusic = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
            const media = await MediaLibrary.getAssetsAsync({
                mediaType: 'audio',
                sortBy: 'modificationTime',
                first: 1000,
            });
            setSongs(media.assets);
        }
    };

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            scanMusic().then(() => setIsReady(true));
        });
        return () => task.cancel();
    }, []);

    const filteredSongs = useMemo(() => {
        if (!search) return songs;
        const term = search.toLowerCase();
        return songs.filter(song => song.filename.toLowerCase().includes(term));
    }, [search, songs]);

    const renderSong = useCallback(({ item }: any) => (
        <SongItem
            track={item}
            isCurrent={currentSong?.id === item.id}
            onPress={() => playSound(item, filteredSongs)}
            formatTime={formatDuration}
        />
    ), [currentSong?.id, filteredSongs]);

    return (
        <View className="flex-1 bg-black">
            <LinearGradient
                colors={['#FDD835', '#121212', '#000000']}
                locations={[0, 0.2, 0.5]}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <View className="px-6 pt-16 pb-4">
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-[#FDD835] font-black text-[10px] uppercase tracking-[4px] mb-1">Tu Colección</Text>
                        <Text className="text-white text-4xl font-black tracking-tighter">BIBLIOTECA</Text>
                    </View>
                    <View className="bg-white/5 p-3 rounded-full border border-white/10">
                         <Music2 color="#FDD835" size={32} strokeWidth={1.5} />
                    </View>
                </View>

                <View className="flex-row items-center bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                    <Search color="#FDD835" size={18} />
                    <TextInput
                        placeholder="Buscar canción..."
                        placeholderTextColor="#4b5563"
                        className="flex-1 ml-3 text-white font-semibold"
                        value={search}
                        onChangeText={setSearch}
                        disableFullscreenUI={true}
                    />
                    <TouchableOpacity onPress={scanMusic}>
                        <RefreshCw color="#FDD835" size={16} opacity={0.6} />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1">
                {!isReady ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator color="#FDD835" size="large" />
                    </View>
                ) : (
                    <FlashList
                        data={filteredSongs}
                        renderItem={renderSong}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 200 }}
                        drawDistance={300}
                        removeClippedSubviews={true}
                    />
                )}
            </View>

            <MiniPlayer />
            <BottomTabBar />
        </View>
    );
};

export default LibraryScreen;
