import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './global.css';


import Musica from '@/components/Musica';
import Lista from '@/screens/Lista';
import Reproductor from '@/screens/ReproductoMusica';
import { AudioProvider } from '@/context/AudioContext';
import Pruebas from '@/components/Prueba';

const { DarkTheme } = adaptNavigationTheme({ reactNavigationDark: NavigationDarkTheme });
const CUSTOM_BACKGROUND = '#020617';

const paperTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...DarkTheme.colors, background: CUSTOM_BACKGROUND },
};

const navTheme = {
  ...NavigationDarkTheme,
  colors: { ...NavigationDarkTheme.colors, ...DarkTheme.colors, background: CUSTOM_BACKGROUND, card: CUSTOM_BACKGROUND },
};

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <PaperProvider theme={paperTheme}>
          <StatusBar style="light" backgroundColor={CUSTOM_BACKGROUND} />
          <SafeAreaView style={{ flex: 1, backgroundColor: CUSTOM_BACKGROUND }}>
            <View style={{ flex: 1 }}>
              <NavigationContainer theme={navTheme}>
                <Stack.Navigator
                  initialRouteName="Segundo"
                  screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: CUSTOM_BACKGROUND },
                  }}>
                  <Stack.Screen name="Inicio" component={Musica} />
                  <Stack.Screen name="Segundo" component={Lista} />
                  <Stack.Screen name="Reproductor" component={Reproductor} />
                  <Stack.Screen name="Buscar" component={Pruebas} />

                </Stack.Navigator>
              </NavigationContainer>
            </View>
          </SafeAreaView>
        </PaperProvider>
      </AudioProvider>
    </SafeAreaProvider>
  );
}