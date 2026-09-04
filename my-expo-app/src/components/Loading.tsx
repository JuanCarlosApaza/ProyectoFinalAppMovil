import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Dimensions, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const dogImages = [
  require('../../assets/carga.png'),
  require('../../assets/cargac.png'),
  require('../../assets/cargac.png'),
  require('../../assets/cargad.png'),
  require('../../assets/cargad.png'),
  require('../../assets/cargad.png'),
  require('../../assets/cargat.png'),
  require('../../assets/cargat.png'),
  require('../../assets/carga.png')
];

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState('Preparando tu experiencia musical...');
  const [currentDogFrame, setCurrentDogFrame] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const dogBounce = useRef(new Animated.Value(0)).current;
  const notesAnim = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const phraseOpacity = useRef(new Animated.Value(1)).current;
  const lastPhraseIndex = useRef(0);

  const phrases = [
    { min: 0, max: 35, text: 'Preparando tu experiencia musical...' },
    { min: 35, max: 70, text: 'Cargando tus melodías favoritas...' },
    { min: 70, max: 100, text: '¡Disfruta tu música!' }
  ];

  // EFECTO 1: Controlar la finalización cuando el progreso llegue a 100
  useEffect(() => {
    if (progress >= 100) {
      // Damos un respiro de 500ms para que se vea la barra llena antes de saltar
      const timeout = setTimeout(() => {
        onLoadingComplete?.();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  // EFECTO 2: Animaciones e Intervalos
  useEffect(() => {
    const duration = 5000;
    const intervalTime = 200;
    const increment = (intervalTime / duration) * 100;

    // Intervalo para los frames del perro
    const dogInterval = setInterval(() => {
      setCurrentDogFrame(prev => (prev + 1) % dogImages.length);
    }, 180);

    // Intervalo para el progreso
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, intervalTime);

    // Animación de la barra (visual)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: false
    }).start();

    // Rebote del perro
    Animated.loop(
      Animated.sequence([
        Animated.timing(dogBounce, { toValue: -15, duration: 500, useNativeDriver: true }),
        Animated.timing(dogBounce, { toValue: 0, duration: 500, useNativeDriver: true })
      ])
    ).start();

    // Notas musicales
    notesAnim.forEach((note, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 400),
          Animated.timing(note, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(note, { toValue: 0, duration: 0, useNativeDriver: true })
        ])
      ).start();
    });

    return () => {
      clearInterval(dogInterval);
      clearInterval(progressTimer);
    };
  }, []);

  // EFECTO 3: Cambio de frases (Separado para evitar errores de renderizado)
  useEffect(() => {
    const phraseIndex = phrases.findIndex(p => progress >= p.min && progress < p.max);
    
    if (phraseIndex !== -1 && phraseIndex !== lastPhraseIndex.current) {
      lastPhraseIndex.current = phraseIndex;
      
      Animated.sequence([
        Animated.timing(phraseOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(phraseOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      setCurrentPhrase(phrases[phraseIndex].text);
    }
  }, [progress]);

  // Interpolaciones
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const noteAnimations = notesAnim.map((note, i) => ({
    translateY: note.interpolate({
      inputRange: [0, 1],
      outputRange: [0, [-100, -120, -90][i]]
    }),
    opacity: note.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0]
    })
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#FFD600' }}>
      <StatusBar hidden />
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, alignItems: 'center', justifyContent: 'space-between' }}>
        
        <Animated.Text style={{ textAlign: 'center', fontWeight: '800', color: '#1a1a2e', opacity: phraseOpacity, fontSize: Math.min(width * 0.08, 32) }}>
          {currentPhrase}
        </Animated.Text>

        <View style={{ flex: 2, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {noteAnimations.map((anim, i) => (
            <Animated.Text key={i} style={[{ position: 'absolute', fontSize: 40, color: '#FFF', transform: [{ translateY: anim.translateY }], opacity: anim.opacity }]}>
              {['♪', '♫', '♪'][i]}
            </Animated.Text>
          ))}

          <Animated.View style={{ width: 280, height: 280, transform: [{ translateY: dogBounce }] }}>
            <Image source={dogImages[currentDogFrame]} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          </Animated.View>
        </View>

        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>{Math.round(progress)}%</Text>
          <View style={{ width: '90%', height: 25, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 3, borderColor: '#333', overflow: 'hidden' }}>
            <Animated.View style={{ height: '100%', backgroundColor: '#333', width: progressWidth }} />
          </View>
        </View>
      </View>
    </View>
  );
}