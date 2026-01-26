import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { ChevronLeft, Share2, MoreVertical, Play, Heart, Download, Shuffle, Home, Search, Library, User, Disc3 } from 'lucide-react-native';

export default function MusicApp() {
  const [activeTab, setActiveTab] = useState('listen');
  const [liked, setLiked] = useState(false);
  
  const tracks = [
    { id: 1, title: 'The Mole', artist: 'Hans Zimmer', duration: '5:43' },
    { id: 2, title: 'We Need Our Army Back', artist: 'Hans Zimmer', duration: '4:58' },
    { id: 3, title: 'Shivering Soldier', artist: 'Hans Zimmer', duration: '6:02' },
    { id: 4, title: 'Supermarine', artist: 'Hans Zimmer', duration: '7:58' },
    { id: 5, title: 'The Tide', artist: 'Hans Zimmer', duration: '4:32' },
    { id: 6, title: 'Regimental Brothers', artist: 'Hans Zimmer, Lorne Balfe', duration: '3:47' },
    { id: 7, title: 'Impulse', artist: 'Hans Zimmer', duration: '5:28' },
    { id: 8, title: 'Home', artist: 'Hans Zimmer, Benjamin Wallfisch', duration: '5:55' },
  ];

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Header con gradiente celeste oscuro */}
      <View className="bg-slate-900">
        {/* Navigation */}
        <View className="flex-row justify-between items-center px-5 pt-14 pb-4">
          <TouchableOpacity className="w-11 h-11 items-center justify-center rounded-full bg-black/30">
            <ChevronLeft color="#fff" size={26} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity className="w-11 h-11 items-center justify-center rounded-full bg-black/30">
            <Share2 color="#fff" size={22} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Album Cover & Info */}
        <View className="px-6 pb-10">
          <View className="items-center mb-7">
            {/* Album Cover con sombra y gradiente celeste */}
            <View className="w-52 h-52 rounded-3xl bg-slate-800 shadow-2xl mb-6 overflow-hidden border-2 border-cyan-500/30">
              <View className="w-full h-full items-center justify-center relative">
                <View className="absolute inset-0 bg-cyan-900/30" />
                <View className="items-center z-10">
                  <Text className="text-white text-8xl font-black tracking-wider">D</Text>
                  <View className="w-20 h-1 bg-cyan-400 rounded-full mt-2" />
                  <Text className="text-cyan-300 text-xs font-bold tracking-[0.3em] mt-3">MUSIC</Text>
                </View>
              </View>
            </View>
            
            <Text className="text-white text-3xl font-black text-center mb-2 tracking-tight">
              Dunkirk
            </Text>
            <Text className="text-slate-300 text-base text-center mb-1.5 font-medium">
              Original Motion Picture Soundtrack
            </Text>
            <Text className="text-cyan-400 text-sm font-semibold">Hans Zimmer • 2017</Text>
            <Text className="text-slate-400 text-xs mt-1">8 tracks • 44 min</Text>
          </View>

          {/* Action Buttons mejorados */}
          <View className="flex-row items-center justify-between px-2">
            <TouchableOpacity 
              onPress={() => setLiked(!liked)}
              className="items-center"
            >
              <View className="w-14 h-14 rounded-full bg-slate-800/60 items-center justify-center border border-cyan-500/20">
                <Heart 
                  color={liked ? "#22d3ee" : "#fff"} 
                  size={24} 
                  fill={liked ? "#22d3ee" : "none"}
                  strokeWidth={2} 
                />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 rounded-full bg-slate-800/60 items-center justify-center border border-cyan-500/20">
                <Download color="#fff" size={24} strokeWidth={2} />
              </View>
            </TouchableOpacity>
            
            {/* Play Button Grande */}
            <TouchableOpacity className="flex-row items-center bg-cyan-500 rounded-full px-10 py-5 shadow-xl shadow-cyan-500/40">
              <Play color="#000" size={26} fill="#000" strokeWidth={2} />
              <Text className="text-black font-black text-lg ml-3 tracking-wide">PLAY</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 rounded-full bg-slate-800/60 items-center justify-center border border-cyan-500/20">
                <Shuffle color="#fff" size={22} strokeWidth={2} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <View className="w-14 h-14 rounded-full bg-slate-800/60 items-center justify-center border border-cyan-500/20">
                <MoreVertical color="#fff" size={24} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Track List con diseño mejorado */}
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-3">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Tracks</Text>
        </View>
        
        {tracks.map((track, index) => (
          <TouchableOpacity
            key={track.id}
            className="flex-row items-center py-4 border-b border-slate-800 active:bg-slate-900/50 rounded-xl"
          >
            <View className="w-10 h-10 rounded-lg bg-cyan-600 items-center justify-center mr-4 shadow-lg shadow-cyan-500/30">
              <Text className="text-white text-base font-black">
                {track.id}
              </Text>
            </View>
            
            <View className="flex-1">
              <Text className="text-white font-bold text-base mb-1.5 tracking-tight">
                {track.title}
              </Text>
              <Text className="text-slate-400 text-sm font-medium">
                {track.artist}
              </Text>
            </View>
            
            <Text className="text-cyan-400 text-sm font-semibold mr-3">
              {track.duration}
            </Text>
            
            <TouchableOpacity className="w-9 h-9 items-center justify-center">
              <MoreVertical color="#64748b" size={20} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        
        <View className="h-40" />
      </ScrollView>

      
    </View>
  );
}