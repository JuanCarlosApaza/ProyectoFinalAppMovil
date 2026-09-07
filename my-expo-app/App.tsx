import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import LibraryScreen from '@/screens/LibraryScreen';
import PlayerScreen from '@/screens/PlayerScreen';
import SearchScreen from '@/screens/SearchScreen';
import AlbumsScreen from '@/screens/AlbumsScreen';
import { AudioProvider } from '@/context/AudioContext';
import LoadingScreen from '@/components/Loading';
import { COLORS } from '@/constants';
import { slideUpTransition } from '@/navigation/transitions';
import './global.css';

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: COLORS.background, card: COLORS.background },
};

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <SafeAreaProvider>
      <AudioProvider>
        {isLoading ? (
          <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
        ) : (
          <>
            <StatusBar style="light" backgroundColor={COLORS.background} />
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
              <View style={{ flex: 1 }}>
                <NavigationContainer theme={navTheme}>
                  <Stack.Navigator
                    initialRouteName="Library"
                    screenOptions={{ headerShown: false }}
                  >
                    <Stack.Screen name="Library" component={LibraryScreen} />
                    <Stack.Screen 
                      name="Player" 
                      component={PlayerScreen}
                      options={{
                        cardStyleInterpolator: slideUpTransition,
                        cardStyle: { backgroundColor: 'transparent' },
                      }}
                    />
                    <Stack.Screen name="Search" component={SearchScreen} />
                    <Stack.Screen name="Albums" component={AlbumsScreen} />
                  </Stack.Navigator>
                </NavigationContainer>
              </View>
            </SafeAreaView>
          </>
        )}
      </AudioProvider>
    </SafeAreaProvider>
  );
}
