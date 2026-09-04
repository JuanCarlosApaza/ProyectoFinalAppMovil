import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  ChevronLeft,
  Share2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  ListMusic,
  AlignLeft,
  X,
  FolderHeart,
  Plus,
  Shuffle,
  Repeat,
  Repeat1,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio, usePlaybackStatus } from '@/context/AudioContext';
import VinylDisc from '@/components/VinylDisc';
import Lyrics from '@/components/Lyrics';
import { addSongToAlbum, createAlbum, getAllAlbums } from '@/services/database';
import { formatTime, cleanFileName } from '@/utils';
import { COLORS } from '@/constants';
import type { Song, Album } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SongListItem = React.memo(({ song, index, isCurrent, onPress }: {
  song: any;
  index: number;
  isCurrent: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mb-3 flex-row items-center rounded-2xl p-4 ${isCurrent ? 'border border-cyan-500/40 bg-cyan-500/20' : 'border border-slate-700/50 bg-slate-800/40'}`}
  >
    <Text className={`mr-4 w-6 text-lg font-bold ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`}>
      {index + 1}
    </Text>
    <View className="flex-1">
      <Text numberOfLines={1} className={`${isCurrent ? 'font-bold text-cyan-400' : 'text-slate-100'}`}>
        {song.filename}
      </Text>
    </View>
  </TouchableOpacity>
));

const PlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const {
    currentSong,
    isPlaying,
    playSound,
    allSongs,
    seekTo,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    togglePlayPause,
    playNext,
    playPrevious,
  } = useAudio()!;
  const { playbackStatus } = usePlaybackStatus()!;

  const [albumName, setAlbumName] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'lista' | 'letras' | 'albumes'>('lista');

  useEffect(() => {
    if (modalType === 'albumes') {
      const result = getAllAlbums();
      setAlbums(result as Album[]);
    }
  }, [modalType, modalVisible]);

  useEffect(() => {
    const songFromParam = route.params?.song;
    const listFromParam = route.params?.allSongs;
    if (songFromParam && songFromParam.id !== currentSong?.id) {
      playSound(songFromParam, listFromParam);
    }
  }, [route.params?.song]);

  const position = playbackStatus?.positionMillis || 0;
  const duration = playbackStatus?.durationMillis || 0;

  const handleAddSongToAlbum = useCallback((albumId: number) => {
    if (!currentSong?.id) {
      Alert.alert('Error', 'No hay canción seleccionada');
      return;
    }
    try {
      addSongToAlbum(albumId, currentSong as Song);
      Alert.alert('¡Listo!', 'Canción agregada al álbum correctamente');
      setModalVisible(false);
    } catch (e) {
      console.log(e);
      Alert.alert('Aviso', 'Hubo un error al agregar la canción al álbum');
    }
  }, [currentSong]);

  const handleCreateAlbum = useCallback(() => {
    if (!albumName.trim()) return;
    try {
      createAlbum(albumName, [COLORS.primary, COLORS.background]);
      setAlbumName('');
      const result = getAllAlbums();
      setAlbums(result as Album[]);
      Alert.alert('Éxito', 'Carpeta creada');
    } catch {
      Alert.alert('Error', 'Ya existe esta carpeta');
    }
  }, [albumName]);

  const openModal = useCallback((type: 'lista' | 'letras' | 'albumes') => {
    setModalType(type);
    setModalVisible(true);
  }, []);

  const renderSongItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <SongListItem
      song={item}
      index={index}
      isCurrent={item.id === currentSong?.id}
      onPress={() => playSound(item, allSongs)}
    />
  ), [currentSong?.id, playSound, allSongs]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  if (!currentSong) return null;

  return (
    <View className="flex-1 bg-slate-950 px-8">
      <LinearGradient
        colors={['#FDD835', '#1a1a1a', '#000000']}
        locations={[0, 0.3, 0.7]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* HEADER */}
      <View className="flex-row items-center justify-between pt-14 pb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-[9px] font-bold tracking-[3px] text-slate-500 uppercase">
            Reproduciendo
          </Text>
          <Text className="mt-1 text-[11px] font-bold text-white italic">Audio Digital</Text>
        </View>

        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Share2 color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <VinylDisc />

      {/* INFO CANCIÓN */}
      <View className="mb-8 items-start">
        <Text numberOfLines={1} className="mb-1 text-3xl font-black tracking-tighter text-white">
          {cleanFileName(currentSong.filename)}
        </Text>
        <View className="flex-row items-center">
          <View className="mr-2 h-2 w-2 rounded-full bg-yellow-300" />
          <Text className="font-semibold tracking-wide text-slate-400">
            Biblioteca Local • {currentSong.mediaType?.toUpperCase() || 'AUDIO'}
          </Text>
        </View>
      </View>

      {/* SLIDER */}
      <View className="mb-8">
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          minimumTrackTintColor="#FDD835"
          maximumTrackTintColor="#FFFF"
          thumbTintColor="#FFFF"
          onSlidingComplete={(value) => seekTo(value)}
        />
        <View className="-mt-1 flex-row justify-between px-1">
          <Text className="text-xs font-bold text-white">{formatTime(position)}</Text>
          <Text className="text-xs font-bold text-gray-400">{formatTime(duration)}</Text>
        </View>
      </View>

      {/* CONTROLES PRINCIPALES */}
      <View className="mb-30 w-full flex-row items-center justify-between px-6">
        <TouchableOpacity onPress={toggleShuffle} activeOpacity={0.7} className="w-14 items-center">
          <Shuffle size={22} color={isShuffle ? '#FDD835' : '#999'} />
          <Text className={`mt-1 text-[9px] font-bold ${isShuffle ? 'text-[#FDD835]' : 'text-[#999]'}`}>
            SHUFFLE
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center justify-center gap-6">
          <TouchableOpacity onPress={playPrevious} activeOpacity={0.7}>
            <SkipBack color="#fff" size={32} fill="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            className="h-16 w-16 items-center justify-center rounded-full bg-[#FDD835] shadow-lg shadow-[#FDD835]/50"
            activeOpacity={0.8}>
            {isPlaying ? (
              <Pause color="#000" size={30} fill="#000" />
            ) : (
              <Play color="#000" size={30} fill="#000" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} activeOpacity={0.7}>
            <SkipForward color="#fff" size={32} fill="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={toggleRepeat} activeOpacity={0.7} className="w-14 items-center">
          {repeatMode === 'one' ? (
            <Repeat1 size={22} color="#FDD835" />
          ) : (
            <Repeat size={22} color={repeatMode === 'all' ? '#FDD835' : '#999'} />
          )}
          <Text className={`mt-1 text-[9px] font-bold ${repeatMode !== 'off' ? 'text-[#FDD835]' : 'text-[#999]'}`}>
            {repeatMode === 'one' ? 'ONE' : repeatMode === 'all' ? 'ALL' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* NAVBAR INFERIOR */}
      <View className="absolute right-6 bottom-10 left-6 h-16 flex-row items-center justify-around rounded-full bg-white/95 shadow-2xl">
        <TouchableOpacity onPress={() => openModal('lista')} className="items-center px-4">
          <ListMusic color={modalType === 'lista' && modalVisible ? '#22d3ee' : '#64748b'} size={20} />
          <Text className={`mt-1 text-[9px] font-bold ${modalType === 'lista' && modalVisible ? 'text-cyan-400' : 'text-slate-500'}`}>
            LISTA
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openModal('letras')} className="items-center px-4">
          <AlignLeft color={modalType === 'letras' && modalVisible ? '#22d3ee' : '#64748b'} size={20} />
          <Text className={`mt-1 text-[9px] font-bold ${modalType === 'letras' && modalVisible ? 'text-cyan-400' : 'text-slate-500'}`}>
            LETRAS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openModal('albumes')} className="items-center px-4">
          <FolderHeart color={modalType === 'albumes' && modalVisible ? '#22d3ee' : '#64748b'} size={20} />
          <Text className={`mt-1 text-[9px] font-bold ${modalType === 'albumes' && modalVisible ? 'text-cyan-400' : 'text-slate-500'}`}>
            FAVORITOS
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal
        animationType="slide"
        visible={modalVisible}
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View
            style={{
              height: SCREEN_HEIGHT * 0.8,
              backgroundColor: '#0f172a',
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.1)',
              paddingHorizontal: 32,
              paddingTop: 16,
              overflow: 'hidden',
            }}>
            <View className="mb-6 h-1.5 w-12 self-center rounded-full bg-slate-700" />

            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-black tracking-widest text-white uppercase italic">
                {modalType}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="rounded-full bg-slate-800 p-2.5">
                <X color="#fff" size={20} />
              </TouchableOpacity>
            </View>

            {/* LISTA — FlashList virtualizado */}
            {modalType === 'lista' && (
              <FlashList
                data={allSongs}
                renderItem={renderSongItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            )}

            {/* LETRAS */}
            {modalType === 'letras' && (
              <Lyrics nombreMusica={cleanFileName(currentSong.filename)} />
            )}

            {/* ALBUMES */}
            {modalType === 'albumes' && (
              <View className="px-6 py-6">
                <Text className="mb-4 text-xl font-black text-white">Agregar a favoritos</Text>

                <View className="mb-4 flex-row">
                  <TextInput
                    className="flex-1 rounded-l-2xl border border-slate-700 bg-slate-900 p-2 text-white"
                    placeholder="Nueva carpeta..."
                    placeholderTextColor="#475569"
                    value={albumName}
                    onChangeText={setAlbumName}
                  />
                  <TouchableOpacity
                    className="justify-center rounded-r-2xl bg-cyan-500 p-2"
                    onPress={handleCreateAlbum}>
                    <Plus color="#000" size={20} />
                  </TouchableOpacity>
                </View>

                {albums.length === 0 ? (
                  <Text className="mt-10 text-center text-slate-500">
                    No tienes carpetas creadas
                  </Text>
                ) : (
                  albums.map((album) => (
                    <TouchableOpacity
                      key={album.id}
                      onPress={() => handleAddSongToAlbum(album.id)}
                      className="mb-3 flex-row items-center rounded-2xl bg-slate-900/60 p-4">
                      <FolderHeart color="#22d3ee" size={22} />
                      <Text className="ml-4 flex-1 font-bold text-white">{album.nombre}</Text>
                      <Plus color="#22d3ee" size={18} />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PlayerScreen;
