import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Plus,
  Heart,
  Music,
  Edit2,
  Trash2,
  ChevronLeft,
  Search,
  Check,
  X,
  Album as AlbumIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '@/context/AudioContext';
import BottomTabBar from '@/navigation/BottomTabBar';
import MiniPlayer from '@/components/MiniPlayer';
import { GRADIENTS } from '@/constants';
import {
  initDatabase,
  loadAlbums,
  loadAlbumSongs,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  removeSongFromAlbum,
} from '@/services/database';
import type { Album } from '@/types';

const { width } = Dimensions.get('window');

const VinylDisc = ({ gradient, size = 180 }: { gradient: string[]; size?: number }) => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          width: size * 0.85,
          height: size * 0.85,
          top: size * 0.075,
          left: size * 0.15,
          borderRadius: 12,
          backgroundColor: '#1a1a1a',
        }}
      />
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{ rotate: rotation }],
        }}
      >
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#000',
          }}
        >
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: size - i * 12,
                height: size - i * 12,
                borderRadius: (size - i * 12) / 2,
                borderWidth: 1,
                borderColor: '#333',
                top: i * 6,
                left: i * 6,
              }}
            />
          ))}
          <View
            style={{
              position: 'absolute',
              width: size * 0.5,
              height: size * 0.5,
              borderRadius: (size * 0.5) / 2,
              top: size * 0.25,
              left: size * 0.25,
              overflow: 'hidden',
              borderWidth: 3,
              borderColor: '#FDD835',
            }}
          >
            <LinearGradient colors={gradient as [string, string, ...string[]]} style={{ flex: 1 }} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const AlbumsScreen = () => {
  const { playSound } = useAudio()!;
  const [albums, setAlbums] = useState<Album[]>([
    {
      id: -1,
      nombre: 'Favoritos',
      coverGradient: GRADIENTS[6],
      songs: [],
      isFavorites: true,
    },
  ]);
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    gradient: false,
  });
  const [formData, setFormData] = useState({
    albumName: '',
    editName: '',
    gradient: GRADIENTS[0],
    search: '',
  });

  useEffect(() => {
    initDatabase();
    cargarAlbumes();
  }, []);

  const cargarAlbumes = () => {
    const result = loadAlbums();
    setAlbums([
      {
        id: -1,
        nombre: 'Favoritos',
        coverGradient: GRADIENTS[6],
        songs: [],
        isFavorites: true,
      },
      ...result,
    ]);
  };

  const cargarCancionesAlbum = async (albumId: number) => {
    return loadAlbumSongs(albumId);
  };

  const updateModal = (modal: keyof typeof modals, value: boolean) => {
    setModals(prev => ({ ...prev, [modal]: value }));
  };

  const updateForm = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const crearAlbum = () => {
    if (formData.albumName.trim() === '') {
      Alert.alert('Error', 'Ingresa un nombre para el álbum');
      return;
    }
    try {
      createAlbum(formData.albumName, formData.gradient);
      updateForm('albumName', '');
      updateModal('create', false);
      cargarAlbumes();
      Alert.alert('Éxito', 'Álbum creado correctamente');
    } catch (error) {
      Alert.alert('Error', 'El álbum ya existe o hubo un problema');
    }
  };

  const editarAlbum = (albumId: number) => {
    if (formData.editName.trim() === '') {
      Alert.alert('Error', 'Ingresa un nombre válido');
      return;
    }
    try {
      updateAlbum(albumId, formData.editName, formData.gradient);
      updateModal('edit', false);
      cargarAlbumes();
      Alert.alert('Éxito', 'Álbum actualizado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el álbum');
    }
  };

  const eliminarAlbum = (albumId: number) => {
    Alert.alert(
      'Eliminar Álbum',
      '¿Estás seguro de eliminar este álbum?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteAlbum(albumId);
            cargarAlbumes();
            if (currentView === 'detail' && selectedAlbum?.id === albumId) {
              setCurrentView('grid');
              setSelectedAlbum(null);
            }
            Alert.alert('Eliminado', 'Álbum eliminado correctamente');
          },
        },
      ]
    );
  };

  const eliminarCancion = (songId: string) => {
    if (!selectedAlbum) return;
    Alert.alert(
      'Eliminar Canción',
      '¿Quieres eliminar esta canción del álbum?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            removeSongFromAlbum(selectedAlbum.id, songId);
            const updatedSongs = await cargarCancionesAlbum(selectedAlbum.id);
            setSelectedAlbum(prev => prev ? { ...prev, songs: updatedSongs } : null);
          },
        },
      ]
    );
  };

  const abrirAlbumDetalle = async (album: Album) => {
    setSelectedAlbum(album);
    const songs = await cargarCancionesAlbum(album.id);
    setSelectedAlbum({ ...album, songs });
    setCurrentView('detail');
  };

  const reproducirCancion = (song: any) => {
    if (!selectedAlbum) return;
    playSound(song, selectedAlbum.songs);
  };

  const filteredAlbums = albums.filter((a) =>
    a.nombre.toLowerCase().includes(formData.search.toLowerCase())
  );

  if (currentView === 'grid') {
    return (
      <View className="flex-1 bg-black">
        <View className="pt-16 px-6 pb-4">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-white text-4xl font-black">Mis Álbumes</Text>
              <Text className="text-neutral-500 text-sm mt-1">{albums.length} álbumes</Text>
            </View>
            <TouchableOpacity
              onPress={() => updateModal('create', true)}
              className="bg-yellow-400 rounded-full p-4"
            >
              <Plus size={28} color="#000" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-neutral-900 rounded-2xl px-4 py-3 border border-neutral-800">
            <Search size={20} color="#737373" />
            <TextInput
              className="flex-1 ml-3 text-white"
              placeholder="Buscar álbum..."
              placeholderTextColor="#737373"
              value={formData.search}
              onChangeText={(v) => updateForm('search', v)}
            />
            {formData.search !== '' && (
              <TouchableOpacity onPress={() => updateForm('search', '')}>
                <X size={20} color="#737373" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {filteredAlbums.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <AlbumIcon size={64} color="#404040" />
            <Text className="text-neutral-500 text-lg mt-4">No se encontraron álbumes</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAlbums}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View className="w-1/2 p-3">
                <TouchableOpacity
                  onPress={() => abrirAlbumDetalle(item)}
                  className="bg-neutral-900 rounded-3xl p-4"
                >
                  <View className="items-center mb-4">
                    <VinylDisc gradient={item.coverGradient} size={width * 0.35} />
                  </View>
                  <View className="items-center">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-white font-black text-base" numberOfLines={1}>
                        {item.nombre}
                      </Text>
                      {item.isFavorites && (
                        <Heart size={14} fill="#FDD835" color="#FDD835" style={{ marginLeft: 6 }} />
                      )}
                    </View>
                    <View className="flex-row items-center">
                      <Music size={12} color="#737373" />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        <Modal visible={modals.create} transparent animationType="fade">
          <View className="flex-1 bg-black/95 justify-center items-center px-6">
            <View className="bg-neutral-900 rounded-3xl p-6 w-full border-2 border-yellow-400">
              <Text className="text-white text-2xl font-black mb-6 text-center">Nuevo Álbum</Text>

              <View className="items-center mb-6">
                <VinylDisc gradient={formData.gradient} size={120} />
              </View>

              <TextInput
                className="bg-black text-white p-4 rounded-2xl mb-4 border border-neutral-700"
                placeholder="Nombre del álbum..."
                placeholderTextColor="#737373"
                value={formData.albumName}
                onChangeText={(v) => updateForm('albumName', v)}
              />

              <TouchableOpacity
                onPress={() => updateModal('gradient', true)}
                className="bg-neutral-800 py-3 rounded-2xl mb-6 flex-row items-center justify-center"
              >
                <View className="flex-row">
                  {formData.gradient.map((color, i) => (
                    <View
                      key={i}
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: color,
                        borderRadius: 12,
                        marginHorizontal: 2,
                        borderWidth: 2,
                        borderColor: '#FDD835',
                      }}
                    />
                  ))}
                </View>
                <Text className="text-white font-bold ml-3">Cambiar colores</Text>
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    updateModal('create', false);
                    updateForm('albumName', '');
                  }}
                  className="flex-1 bg-neutral-800 py-4 rounded-2xl items-center"
                >
                  <Text className="text-white font-bold">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={crearAlbum}
                  className="flex-1 bg-yellow-400 py-4 rounded-2xl items-center"
                >
                  <Text className="text-black font-bold">Crear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={modals.gradient} transparent animationType="slide">
          <View className="flex-1 bg-black/95 justify-end">
            <View className="bg-neutral-900 rounded-t-3xl p-6 border-t-2 border-yellow-400">
              <Text className="text-white text-lg font-bold mb-4">Selecciona colores:</Text>
              <ScrollView className="max-h-80 mb-4">
                {GRADIENTS.map((grad, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      updateForm('gradient', grad);
                      updateModal('gradient', false);
                    }}
                    className="mb-3"
                  >
                    <View className="flex-row items-center bg-neutral-800 p-4 rounded-2xl">
                      <LinearGradient colors={grad as [string, string, ...string[]]} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 16 }} />
                      <Text className="text-white font-semibold flex-1">Gradiente {i + 1}</Text>
                      {JSON.stringify(grad) === JSON.stringify(formData.gradient) && (
                        <Check size={24} color="#FDD835" strokeWidth={3} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => updateModal('gradient', false)}
                className="bg-yellow-400 py-4 rounded-2xl items-center"
              >
                <Text className="text-black font-bold">Atrás</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <MiniPlayer />
        <BottomTabBar />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView>
        <LinearGradient
          colors={[(selectedAlbum?.coverGradient || GRADIENTS[0])[0], (selectedAlbum?.coverGradient || GRADIENTS[0])[1], '#000000'] as [string, string, ...string[]]}
          style={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 }}
        >
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => setCurrentView('grid')}
              className="bg-black/50 rounded-full p-3"
            >
              <ChevronLeft size={28} color="#FDD835" strokeWidth={3} />
            </TouchableOpacity>

            {!selectedAlbum?.isFavorites && (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    updateForm('editName', selectedAlbum?.nombre || '');
                    updateForm('gradient', selectedAlbum?.coverGradient || GRADIENTS[0]);
                    updateModal('edit', true);
                  }}
                  className="bg-black/50 rounded-full p-3"
                >
                  <Edit2 size={24} color="#FDD835" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => eliminarAlbum(selectedAlbum!.id)}
                  className="bg-black/50 rounded-full p-3"
                >
                  <Trash2 size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View className="items-center mb-6">
            <VinylDisc gradient={selectedAlbum?.coverGradient || GRADIENTS[0]} size={Math.min(width * 0.55, 220)} />
          </View>

          <View className="items-center">
            <Text className="text-white text-4xl font-black mb-2 text-center">{selectedAlbum?.nombre}</Text>
            <View className="flex-row items-center">
              <Music size={16} color="#FDD835" />
              <Text className="text-white/80 text-lg ml-2">
                {selectedAlbum?.songs.length} {selectedAlbum?.songs.length === 1 ? 'canción' : 'canciones'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-6 pb-10">
          {selectedAlbum?.songs.length === 0 ? (
            <View className="items-center py-20">
              <Music size={64} color="#404040" />
              <Text className="text-neutral-500 text-center mt-4 text-lg">No hay canciones</Text>
            </View>
          ) : (
            selectedAlbum?.songs.map((song, i) => (
              <TouchableOpacity
                key={song.id}
                onPress={() => reproducirCancion(song)}
                className="bg-neutral-900/50 rounded-2xl p-4 mb-3 border border-neutral-800"
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-xl bg-yellow-400 items-center justify-center mr-4">
                    <Text className="text-black font-black text-base">{i + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base mb-1">{song.filename}</Text>
                    <Text className="text-neutral-400 text-sm">Canción {i + 1}</Text>
                  </View>
                  {!selectedAlbum.isFavorites && (
                    <TouchableOpacity
                      onPress={() => eliminarCancion(song.id)}
                      className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center"
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={modals.edit} transparent animationType="fade">
        <View className="flex-1 bg-black/95 justify-center items-center px-6">
          <View className="bg-neutral-900 rounded-3xl p-6 w-full border-2 border-yellow-400">
            <Text className="text-white text-2xl font-black mb-6 text-center">Editar Álbum</Text>

            <View className="items-center mb-6">
              <VinylDisc gradient={formData.gradient} size={120} />
            </View>

            <TextInput
              className="bg-black text-white p-4 rounded-2xl mb-4 border border-neutral-700"
              placeholder="Nombre del álbum..."
              placeholderTextColor="#737373"
              value={formData.editName}
              onChangeText={(v) => updateForm('editName', v)}
            />

            <TouchableOpacity
              onPress={() => updateModal('gradient', true)}
              className="bg-neutral-800 py-3 rounded-2xl mb-6 flex-row items-center justify-center"
            >
              <View className="flex-row">
                {formData.gradient.map((color, i) => (
                  <View
                    key={i}
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: color,
                      borderRadius: 12,
                      marginHorizontal: 2,
                      borderWidth: 2,
                      borderColor: '#FDD835',
                    }}
                  />
                ))}
              </View>
              <Text className="text-white font-bold ml-3">Cambiar colores</Text>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => updateModal('edit', false)}
                className="flex-1 bg-neutral-800 py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => selectedAlbum && editarAlbum(selectedAlbum.id)}
                className="flex-1 bg-yellow-400 py-4 rounded-2xl items-center"
              >
                <Text className="text-black font-bold">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AlbumsScreen;
