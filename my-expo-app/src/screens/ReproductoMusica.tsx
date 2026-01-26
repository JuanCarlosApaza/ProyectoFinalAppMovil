import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, Dimensions } from "react-native";
import { 
    ChevronLeft, Heart, MoreVertical, Play, Share2, 
    Pause, SkipBack, SkipForward 
} from "lucide-react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { useAudio } from "@/context/AudioContext";
import Navbar from "@/navigation/Navbar";

const { width } = Dimensions.get('window');

const Reproductor = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    
    const { 
        currentSong, isPlaying, playbackStatus, 
        playSound, togglePlayPause, allSongs, seekTo 
    } = useAudio();

    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const songFromParam = route.params?.song;
        const listFromParam = route.params?.allSongs;

        if (songFromParam && songFromParam.id !== currentSong?.id) {
            playSound(songFromParam, listFromParam);
        }
    }, [route.params?.song]);

    const position = playbackStatus?.positionMillis || 0;
    const duration = playbackStatus?.durationMillis || 0;

    const handleNext = () => {
        const currentIndex = allSongs.findIndex((s: any) => s.id === currentSong.id);
        const nextSong = allSongs[(currentIndex + 1) % allSongs.length];
        playSound(nextSong, allSongs);
    };

    const handlePrevious = () => {
        const currentIndex = allSongs.findIndex((s: any) => s.id === currentSong.id);
        const prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
        const prevSong = allSongs[prevIndex];
        playSound(prevSong, allSongs);
    };

    const formatTime = (millis: number) => {
        if (!millis) return "0:00";
        const totalSeconds = millis / 1000;
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!currentSong) return null;

    return (
        <View className="flex-1 bg-slate-950 px-8">
            {/* HEADER */}
            <View className="flex-row justify-between items-center pt-14 pb-8">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-slate-500 font-bold uppercase text-[9px] tracking-[3px]">Reproduciendo</Text>
                    <Text className="text-cyan-400 font-bold text-[11px] mt-1 italic">Audio Digital</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    <Share2 color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            {/* ARTE DEL DISCO */}
            <View className="items-center justify-center my-10">
                <View style={{ width: width * 0.75, height: width * 0.75 }} className="rounded-[60px] bg-slate-900 shadow-2xl items-center justify-center border-2 border-cyan-500/20 overflow-hidden">
                    <View className="absolute inset-0 bg-cyan-500/5 opacity-50" />
                    <Text className="text-cyan-500 text-[120px] font-black opacity-20">
                        {currentSong.filename.charAt(0).toUpperCase()}
                    </Text>
                    <View className="absolute bottom-10 w-24 h-1.5 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500" />
                </View>
            </View>

            {/* INFO CANCIÓN */}
            <View className="mb-10 items-start">
                <Text numberOfLines={1} className="text-white text-3xl font-black mb-2 tracking-tighter">
                    {currentSong.filename.replace(/\.(mp3|wav|m4a|aac)$/i, '')}
                </Text>
                <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-cyan-500 mr-2" />
                    <Text className="text-slate-400 font-semibold tracking-wide">
                        Biblioteca Local • {currentSong.mediaType?.toUpperCase() || 'AUDIO'}
                    </Text>
                </View>
            </View>

            {/* SLIDER (ADELANTAR/RETROCEDER FUNCIONAL) */}
            <View className="mb-12">
                <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    minimumTrackTintColor="#22d3ee"
                    maximumTrackTintColor="#1e293b"
                    thumbTintColor="#22d3ee"
                    onSlidingComplete={(value) => seekTo(value)}
                />
                <View className="flex-row justify-between px-1 mt-[-4px]">
                    <Text className="text-cyan-500/60 text-[11px] font-bold">{formatTime(position)}</Text>
                    <Text className="text-slate-500 text-[11px] font-bold">{formatTime(duration)}</Text>
                </View>
            </View>

            {/* CONTROLES */}
            <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
                    <Heart color={isLiked ? "#22d3ee" : "#475569"} fill={isLiked ? "#22d3ee" : "none"} size={26} />
                </TouchableOpacity>
                
                <View className="flex-row items-center justify-center space-x-10">
                    <TouchableOpacity onPress={handlePrevious} activeOpacity={0.5}>
                        <SkipBack color="#fff" size={36} fill="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={togglePlayPause}
                        className="w-20 h-20 bg-cyan-500 rounded-full items-center justify-center shadow-2xl shadow-cyan-500/50"
                        activeOpacity={0.8}
                    >
                        {isPlaying ? (
                            <Pause color="#000" size={35} fill="#000" />
                        ) : (
                            <Play color="#000" size={35} fill="#000" style={{ marginLeft: 6 }} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleNext} activeOpacity={0.5}>
                        <SkipForward color="#fff" size={36} fill="#fff" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity>
                    <MoreVertical color="#475569" size={26} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Reproductor;