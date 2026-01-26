import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export default function Musica() {
  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);
  const [selectedSong, setSelectedSong] = useState<MediaLibrary.Asset | null>(null);

  // Inicializamos el reproductor apuntando a la URI de la canción seleccionada
  const player = useAudioPlayer(selectedSong?.uri || null);
  const status = useAudioPlayerStatus(player);

  const scanMusic = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      const media = await MediaLibrary.getAssetsAsync({ mediaType: 'audio' });
      setSongs(media.assets);
    } else {
      Alert.alert("Permiso denegado", "Acepta los permisos en ajustes.");
    }
  };

  const handlePlaySong = (song: MediaLibrary.Asset) => {
    setSelectedSong(song);
    // El player cargará la nueva URI automáticamente por el hook
    player.play();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Música</Text>
      
      <TouchableOpacity style={styles.button} onPress={scanMusic}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>ACTUALIZAR BIBLIOTECA sdsa</Text>
      </TouchableOpacity>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }} // Espacio para el mini player
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, selectedSong?.id === item.id && styles.selectedCard]} 
            onPress={() => handlePlaySong(item)}
          >
            <View>
              <Text style={styles.songName} numberOfLines={1}>{item.filename}</Text>
              <Text style={styles.songInfo}>{(item.duration / 60).toFixed(2)} min</Text>
            </View>
            {selectedSong?.id === item.id && status.playing && (
               <Text style={{ color: '#007AFF' }}>🎶</Text>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Mini Reproductor Flotante */}
      {selectedSong && (
        <View style={styles.miniPlayer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>{selectedSong.filename}</Text>
            <Text style={styles.miniPlayerSubtitle}>Reproduciendo ahora</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={() => status.playing ? player.pause() : player.play()}
          >
            <Text style={styles.playButtonText}>
              {status.playing ? "⏸" : "▶️"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#f9f9f9', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10 
  },
  selectedCard: { backgroundColor: '#e3f2fd', borderColor: '#007AFF', borderWidth: 1 },
  songName: { fontSize: 15, fontWeight: '600', maxWidth: '85%' },
  songInfo: { fontSize: 12, color: 'gray', marginTop: 4 },
  
  // Estilos del Mini Player
  miniPlayer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
  },
  miniPlayerTitle: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  miniPlayerSubtitle: { color: '#aaa', fontSize: 11 },
  playButton: { backgroundColor: '#fff', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  playButtonText: { fontSize: 20 }
});