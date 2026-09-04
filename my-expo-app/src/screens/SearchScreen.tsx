import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Alert, ActivityIndicator, StyleSheet, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from "react-native-youtube-iframe";
import { Search, X, Play, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomTabBar from '@/navigation/BottomTabBar';
import { searchYouTube } from '@/services/youtube';
import { initDownloader, downloadAudio } from '@/services/downloader';
import type { YouTubeVideo } from '@/types';

const SearchScreen: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<YouTubeVideo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [activeTrack, setActiveTrack] = useState<YouTubeVideo | null>(null);
  const [videoStatus, setVideoStatus] = useState('ready');
  const [descargandoId, setDescargandoId] = useState<string | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [downloaderReady, setDownloaderReady] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('[SearchScreen] Init downloader useEffect');
    initDownloader()
      .then((res) => {
        console.log('[SearchScreen] Downloader listo, result:', res);
        setDownloaderReady(true);
      })
      .catch(e => {
        console.error('[SearchScreen] Error init downloader:', e.message || e);
      });
  }, []);

  useEffect(() => {
    if (videoStatus === 'playing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [videoStatus]);

  const buscarMusica = async () => {
    if (!busqueda.trim()) return;
    setCargando(true);
    try {
      const items = await searchYouTube(busqueda);
      console.log(`[YouTube] ${items.length} resultados para: "${busqueda}"`);
      setResultados(items);
    } catch (e: any) {
      console.error('[YouTube] Error:', e.message || e);
      Alert.alert('Error', `No se pudo buscar: ${e.message || 'Error desconocido'}`);
    } finally {
      setCargando(false);
    }
  };

  const getVideoId = (item: YouTubeVideo): string => {
    if (typeof item.id === 'string') return item.id;
    return item.id?.videoId || '';
  };

  const getThumbnail = (item: YouTubeVideo): string => {
    return item.snippet?.thumbnails?.high?.url ||
           item.snippet?.thumbnails?.default?.url ||
           'https://via.placeholder.com/150';
  };

  const playVideo = (item: YouTubeVideo) => {
    const videoId = getVideoId(item);
    console.log(`https://www.youtube.com/watch?v=${videoId}`);
    setActiveTrack(item);
    setVideoStatus('playing');
  };

  const handleDownload = async (item: YouTubeVideo) => {
    const videoId = getVideoId(item);
    console.log('[SearchScreen] handleDownload INICIO, videoId:', videoId);
    console.log('[SearchScreen] downloaderReady:', downloaderReady);

    if (!downloaderReady) {
      console.log('[SearchScreen] Descargador NO listo');
      Alert.alert('Error', 'El descargador no está listo. Reinicia la app.');
      return;
    }

    setDescargandoId(videoId);
    setProgreso(0);

    try {
      console.log('[SearchScreen] Llamando downloadAudio...');
      const result = await downloadAudio(videoId);
      console.log('[SearchScreen] Descarga EXITOSA:', JSON.stringify(result));
      setDescargandoId(null);
      setProgreso(0);
      Alert.alert('Éxito', 'Audio guardado en Downloads/RosqMusic');
    } catch (e: any) {
      console.error('[SearchScreen] Descarga FALLÓ:', e.message || JSON.stringify(e));
      Alert.alert('Error', `No se pudo descargar: ${e.message || 'Error desconocido'}`);
      setDescargandoId(null);
      setProgreso(0);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <LinearGradient colors={['#FDD835', '#121212', '#000000']} locations={[0, 0.4, 0.7]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

          <View style={styles.header}>
            <Text style={styles.subTag}>Power Streamer</Text>
            <Text style={styles.logoText}>ROSQ<Text style={{ color: '#000' }}>MUSIC</Text></Text>
          </View>

          {activeTrack && (
            <View style={styles.playerSection}>
              <View style={styles.playerWrapper}>
                <View style={styles.hiddenVideo}>
                  <YoutubePlayer
                    height={200}
                    play={videoStatus === 'playing'}
                    videoId={getVideoId(activeTrack)}
                    onChangeState={(state: string) => setVideoStatus(state)}
                  />
                </View>
                <View style={styles.videoMask}>
                  <LinearGradient colors={['#18181b', '#000']} style={styles.maskContent}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <View style={styles.artContainer}>
                        <Image
                          source={{ uri: getThumbnail(activeTrack) }}
                          style={styles.artImage}
                        />
                        {videoStatus !== 'playing' && <ActivityIndicator color="#FDD835" style={StyleSheet.absoluteFill} />}
                      </View>
                    </Animated.View>
                    <Text numberOfLines={1} style={styles.trackTitle}>
                      {activeTrack.snippet?.title || "Cargando..."}
                    </Text>
                    <Text style={styles.statusText}>{videoStatus === 'playing' ? 'En Vivo' : 'Cargando'}</Text>
                  </LinearGradient>
                </View>
                <TouchableOpacity onPress={() => setActiveTrack(null)} style={styles.closeBtn}>
                  <X color="#fff" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ paddingHorizontal: 24 }}>
            <View style={styles.searchBar}>
              <Search color="#FDD835" size={20} strokeWidth={3} />
              <TextInput
                placeholder="Buscar música..."
                placeholderTextColor="#666"
                style={styles.input}
                value={busqueda}
                onChangeText={setBusqueda}
                onSubmitEditing={buscarMusica}
              />
            </View>

            {cargando && <ActivityIndicator color="#FDD835" style={{ marginBottom: 20 }} />}

            {resultados.map((item) => {
              const vid = getVideoId(item);
              const isDownloading = descargandoId === vid;

              return (
                <View key={vid} style={styles.trackItem}>
                  <TouchableOpacity
                    onPress={() => playVideo(item)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Image
                      source={{ uri: getThumbnail(item) }}
                      style={styles.thumb}
                    />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text numberOfLines={1} style={styles.titleText}>{item.snippet?.title}</Text>
                      <Text style={styles.channelText}>{item.snippet?.channelTitle}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDownload(item)}
                    style={[styles.actionBtn, isDownloading && styles.downloadingBtn]}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Text style={styles.progressText}>{Math.round(progreso * 100)}%</Text>
                    ) : (
                      <Download color="#000" size={18} />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>

      {descargandoId && (
        <View style={styles.floatingProgress}>
          <View style={[styles.progressBar, { width: `${progreso * 100}%` }]} />
          <Text style={styles.floatingProgressText}>Descargando... {Math.round(progreso * 100)}%</Text>
        </View>
      )}

      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },
  subTag: { color: '#000', fontWeight: '900', fontSize: 10, letterSpacing: 4, marginBottom: 4 },
  logoText: { color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: -2 },
  playerSection: { paddingHorizontal: 24, marginBottom: 32, alignItems: 'center' },
  playerWrapper: { width: '100%', height: 320, borderRadius: 40, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  hiddenVideo: { height: 200, width: '100%', backgroundColor: '#000' },
  videoMask: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', zIndex: 10 },
  maskContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 20 },
  artContainer: { width: 160, height: 160, borderRadius: 80, overflow: 'hidden', borderWidth: 3, borderColor: '#FDD835' },
  artImage: { width: '100%', height: '100%', backgroundColor: '#222' },
  trackTitle: { color: '#fff', fontWeight: '900', textAlign: 'center', marginTop: 24, paddingHorizontal: 16, fontSize: 18 },
  statusText: { color: '#FDD835', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.8)', padding: 8, borderRadius: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 30, marginBottom: 32 },
  input: { flex: 1, marginLeft: 16, color: '#fff', fontWeight: 'bold', fontSize: 16 },
  trackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  thumb: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#222' },
  titleText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  channelText: { color: '#71717a', fontSize: 11, fontWeight: 'bold' },
  actionBtn: { width: 45, height: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 25, backgroundColor: '#FDD835' },
  downloadingBtn: { backgroundColor: '#27272a' },
  progressText: { color: '#FDD835', fontSize: 10, fontWeight: 'bold' },
  floatingProgress: { position: 'absolute', bottom: 90, left: 20, right: 20, backgroundColor: '#111', height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#FDD835', justifyContent: 'center' },
  progressBar: { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: '#FDD835' },
  floatingProgressText: { color: '#fff', alignSelf: 'center', fontWeight: 'bold', zIndex: 1, fontSize: 12 },
});

export default SearchScreen;
