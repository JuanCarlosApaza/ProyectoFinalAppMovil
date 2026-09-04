# RosqMusic - Contexto Técnico y Reglas para Agentes

## Architecture & Tech Stack
- **Framework:** Expo SDK 54 / React Native 0.81.5 (Target: Android)
- **Language:** TypeScript 5.9.2 (Strict Mode - PROHIBIDO usar `any`)
- **Audio Engine:** `expo-av` / `expo-audio` + Native Kotlin Module (`YouTubeDownloaderModule.kt`)
- **State Management:** React Context (`AudioContext.tsx`) / Zustand
- **UI & Styling:** NativeWind (TailwindCSS) + `react-native-paper`
- **Lists & Performance:** `@shopify/flash-list` (NO usar `FlatList` tradicional para listas de canciones)
- **Animations:** `react-native-reanimated` (Usar `useSharedValue` para rotación de vinilo y sliders)

## External Integrations
- **YouTube:** YouTube Data API v3 + Module Nativo Kotlin (`youtubedl-android`).

## Agent Development Rules
1. **Headless Pattern:** Separa siempre la lógica de servicios y APIs en `src/services/` y Hooks. Los componentes en `src/components/` deben ser puramente visuales.
2. **UI & Theme:** Mantiene el tema oscuro estricto con el color de acento dorado (`#FDD835`).
3. **Performance:** Cualquier animación en `VinylDisc.tsx` o progreso de canciones debe correr en el hilo nativo mediante Reanimated.
4. **Android Native Sync:** Al modificar funciones de descarga, mantén sincronizado el contrato entre `src/services/downloader.ts` y `YouTubeDownloaderModule.kt`.