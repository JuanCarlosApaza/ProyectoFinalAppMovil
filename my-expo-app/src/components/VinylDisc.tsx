import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  StyleSheet,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// 1. Definimos la imagen por defecto
const defaultImage = require('../../assets/g.jpg');

const VinylDisc: React.FC = () => {
  // El estado acepta tanto el número del require como el string de la URI
  const [albumCover, setAlbumCover] = useState<any>(defaultImage);
  const rotation = useRef(new Animated.Value(0)).current;

  // 2. Función para formatear la fuente de la imagen correctamente
  const getImageSource = () => {
    if (typeof albumCover === 'string') {
      return { uri: albumCover };
    }
    return albumCover; // Retorna el require (número) directamente
  };

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const pickImage = async (): Promise<void> => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar la carátula.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setAlbumCover(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la imagen seleccionada.');
    }
  };

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // --- CONFIGURACIÓN DE DIMENSIONES ---
  const ALBUM_SIZE = width * 0.62;
  const VINYL_SIZE = ALBUM_SIZE * 0.94;
  const OFFSET_RIGHT = ALBUM_SIZE * 0.45;

  return (
    <View style={styles.container}>
      <View style={styles.centerStage}>
        <View style={{ width: ALBUM_SIZE + OFFSET_RIGHT, height: ALBUM_SIZE, justifyContent: 'center' }}>
          
          {/* 1. DISCO DE VINILO (Capa inferior) */}
          <Animated.View
            style={[
              styles.vinylContainer,
              {
                width: VINYL_SIZE,
                height: VINYL_SIZE,
                left: OFFSET_RIGHT,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <View style={styles.vinyl}>
              {/* Surcos del disco */}
              {[...Array(8)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.vinylRing, 
                    { 
                      width: VINYL_SIZE * (0.92 - i * 0.1), 
                      height: VINYL_SIZE * (0.92 - i * 0.1), 
                      borderRadius: 1000 
                    }
                  ]} 
                />
              ))}
              
              {/* Centro del vinilo con la imagen */}
              <View style={[styles.vinylCenter, { width: VINYL_SIZE * 0.35, height: VINYL_SIZE * 0.35, borderRadius: 1000 }]}>
                <Image 
                  source={getImageSource()} 
                  style={styles.vinylCenterImage} 
                />
                <View style={styles.vinylHole} />
              </View>

              {/* Reflejo de luz (Efecto Glint) */}
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.05)', 'transparent']}
                style={[StyleSheet.absoluteFillObject, { borderRadius: 1000 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>
          </Animated.View>

          {/* 2. CARÁTULA DEL ÁLBUM (Capa superior) */}
          <TouchableOpacity 
            onPress={pickImage} 
            activeOpacity={0.9} 
            style={[styles.albumTouch, { width: ALBUM_SIZE, height: ALBUM_SIZE }]}
          >
            <View style={styles.albumWrapper}>
              <Image 
                source={getImageSource()} 
                style={styles.albumImage} 
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'transparent', 'rgba(0,0,0,0.5)']}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumTouch: {
    zIndex: 10,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  albumWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  albumImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  vinylContainer: {
    position: 'absolute',
    zIndex: 5,
  },
  vinyl: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    backgroundColor: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111',
  },
  vinylRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(50, 50, 50, 0.4)',
  },
  vinylCenter: {
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#000',
    zIndex: 15,
  },
  vinylCenterImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  vinylHole: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 20,
  },
});

export default VinylDisc;