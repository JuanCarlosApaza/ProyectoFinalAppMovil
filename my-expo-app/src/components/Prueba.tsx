import Navbar from '@/navigation/Navbar';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  Alert, 
  Keyboard, 
  StyleSheet 
} from 'react-native';
import { WebView } from 'react-native-webview';

const YOUTUBE_API_KEY = process.env.EXPO_YOUTUBE_API_KEY; 

const Pruebas = () => {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);

  const searchYoutube = async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=15&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.error) {
        Alert.alert("Error API", json.error.message);
        setLoading(false);
        return;
      }
      setVideos((json.items || []).filter(item => item.id && item.id.videoId));
    } catch (error) {
      Alert.alert("Error", "Problema de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>YouTube Music Fix</Text>

      <View style={styles.playerBox}>
        {activeVideoId ? (
          <WebView
            key={activeVideoId}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            // USAMOS LA URL DE YOUTUBE MOBILE EN VEZ DE EMBED PARA SALTAR EL ERROR 153
            source={{ 
              uri: `https://m.youtube.com/watch?v=${activeVideoId}`,
              headers: { 'Referer': 'https://m.youtube.com' }
            }}
            style={styles.webview}
            // Script para ocultar elementos molestos de la web de youtube
            injectedJavaScript={`
              document.querySelector('.header-micro').style.display='none';
              document.querySelector('#player-control-overlay').style.display='none';
            `}
          />
        ) : (
          <View style={styles.emptyPlayer}>
            <Text style={{ color: '#64748b' }}>Selecciona música para reproducir</Text>
          </View>
        )}
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.inputField}
          placeholder="Busca artista o canción..."
          placeholderTextColor="#64748b"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchYoutube}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={searchYoutube}>
          {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>IR</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.videoId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.videoItem} 
            onPress={() => setActiveVideoId(item.id.videoId)}
          >
            <Image 
              source={{ uri: item.snippet.thumbnails.default.url }} 
              style={styles.imgThumbnail} 
            />
            <View style={styles.textData}>
              <Text style={styles.videoTitle} numberOfLines={2}>{item.snippet.title}</Text>
              <Text style={styles.channelSubtitle}>{item.snippet.channelTitle}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Navbar/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 15, paddingTop: 50 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  playerBox: { height: 230, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  webview: { flex: 1 },
  emptyPlayer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchSection: { flexDirection: 'row', marginBottom: 20 },
  inputField: { flex: 1, backgroundColor: '#1e293b', color: 'white', padding: 12, borderRadius: 8, marginRight: 10 },
  searchBtn: { backgroundColor: '#fbbf24', paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center' },
  buttonText: { fontWeight: 'bold', color: '#0f172a' },
  videoItem: { flexDirection: 'row', backgroundColor: '#1e293b', padding: 10, borderRadius: 10, marginBottom: 10 },
  imgThumbnail: { width: 90, height: 60, borderRadius: 5 },
  textData: { flex: 1, marginLeft: 12 },
  videoTitle: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  channelSubtitle: { color: '#94a3b8', fontSize: 12 }
});

export default Pruebas;