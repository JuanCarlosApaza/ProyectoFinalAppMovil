import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Disc3, Pause, Play } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAudio } from '@/context/AudioContext';

const MiniPlayer = () => {
    const navigation = useNavigation<any>();
    const { currentSong, isPlaying, togglePlayPause } = useAudio()!;

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, [scale]);

    const handleNavigate = useCallback(() => {
        navigation.navigate('Player');
    }, [navigation]);

    if (!currentSong) return null;

    return (
        <View 
            className="absolute bottom-[105px] left-5 right-5 shadow-2xl shadow-black z-50"
            style={{ elevation: 10 }}
        >
            <Animated.View style={animatedStyle}>
                <TouchableOpacity 
                    activeOpacity={0.9}
                    onPress={handleNavigate}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <View className="bg-[#121212] flex-row items-center p-3 rounded-[24px] border border-white/10">
                        <View className={`p-2 rounded-xl ${isPlaying ? 'bg-[#FDD835]' : 'bg-zinc-800'}`}>
                            <Disc3 color={isPlaying ? "#000" : "#FFF"} size={22} strokeWidth={2.5} />
                        </View>
                        
                        <View className="flex-1 ml-4">
                            <Text numberOfLines={1} className="text-white font-black text-xs uppercase tracking-tight">
                                {currentSong.filename.replace(/\.(mp3|wav|m4a|aac)$/i, '')}
                            </Text>
                            <View className="flex-row items-center mt-0.5">
                                <View className={`h-1.5 w-1.5 rounded-full mr-2 ${isPlaying ? 'bg-[#FDD835]' : 'bg-zinc-600'}`} />
                                <Text className="text-zinc-500 text-[8px] font-black uppercase tracking-[1px]">
                                    {isPlaying ? 'Reproduciendo' : 'En Pausa'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            onPress={togglePlayPause}
                            className="bg-white h-10 w-10 rounded-full items-center justify-center ml-2"
                        >
                            {isPlaying ? (
                                <Pause color="#000" size={20} fill="#000" />
                            ) : (
                                <Play color="#000" size={20} fill="#000" style={{ marginLeft: 2 }} />
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default React.memo(MiniPlayer);
