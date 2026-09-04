# 🎵 RosqMusic

---

## Español

### Descripción

**RosqMusic** es un reproductor de música móvil construido con **React Native / Expo** para Android. Combina reproducción de audio local con streaming y descarga de YouTube, extracción de metadatos con inteligencia artificial, letras de canciones con traducción automática, y gestión personalizada de álbumes. Todo con una interfaz oscura y elegante acentuada en amarillo/dorado.

### Características principales

- **Reproductor de música local** — Escanea y reproduce archivos de audio del dispositivo (MP3, WAV, M4A, AAC)
- **Streaming de YouTube** — Busca y reproduce videos de YouTube directamente en la app
- **Descarga de audio** — Descarga audio de YouTube al almacenamiento local mediante módulo nativo Android
- **Letras con IA** — Obtiene letras de Genius y las traduce automáticamente (inglés ↔ español) usando Groq AI
- **Extracción de metadatos** — Identifica artista y nombre de canción a partir del nombre del archivo usando IA
- **Gestión de álbumes** — Crea, edita y elimina álbumes personalizados con portadas gradientes
- **Mini reproductor** — Barra flotante de reproducción persistente sobre la navegación
- **Vinilo animado** — Disco de vinilo giratorio con portada del álbum personalizable
- **Modo oscuro** — Interfaz completamente oscura con acentos dorados (#FDD835)

### Tecnologías utilizadas

| Categoría | Tecnología |
|-----------|------------|
| Framework | React Native 0.81.5, Expo SDK 54 |
| Lenguaje | TypeScript 5.9.2 (modo estricto) |
| UI/Estilos | NativeWind (TailwindCSS), react-native-paper |
| Navegación | @react-navigation/native + stack |
| Audio | expo-av (reproducción + background), expo-audio |
| Base de datos | expo-sqlite (álbumes y canciones) |
| APIs externas | YouTube Data API v3, Genius API, Groq API (LLaMA 3.3 70B) |
| Nativo Android | Kotlin (módulo youtubedl-android para descargas) |
| Animaciones | react-native-reanimated, react-native-gesture-handler |
| Listas | @shopify/flash-list |

### Requisitos previos

- **Node.js** 18 o superior
- **npm** o **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** con SDK de Android configurado
- **Dispositivo Android** o emulador
- **API Keys** (ver sección de configuración más abajo)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd my-expo-app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ver sección API Keys)
cp .env.example .env
# Editar .env con tus API keys

# 4. Generar proyecto nativo
npx expo prebuild

# 5. Ejecutar en Android
npx expo run:android
```

### Configuración de API Keys

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
EXPO_PUBLIC_YOUTUBE_API_KEY=tu_youtube_api_key
EXPO_PUBLIC_GENIUS_API_KEY=tu_genius_api_key
EXPO_PUBLIC_GROQ_API_KEY=tu_groq_api_key
```

#### YouTube Data API v3

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la **YouTube Data API v3**
4. Ve a **Credenciales** → **Crear credenciales** → **Clave de API**
5. Copia la clave y agrégala como `EXPO_PUBLIC_YOUTUBE_API_KEY`

#### Genius API

1. Ve a [https://genius.com/api-clients](https://genius.com/api-clients)
2. Crea una cuenta o inicia sesión
3. Crea una nueva API Client
4. Copia el **Access Token** y agrégalo como `EXPO_PUBLIC_GENIUS_API_KEY`

#### Groq API

1. Ve a [https://console.groq.com](https://console.groq.com)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** → **Create API Key**
4. Copia la clave y agrégala como `EXPO_PUBLIC_GROQ_API_KEY`
5. El modelo utilizado es **LLaMA 3.3 70B** (configurado en `src/constants/index.ts`)

### Estructura del proyecto

```
my-expo-app/
├── App.tsx                          # Punto de entrada de la aplicación
├── app.json                         # Configuración de Expo
├── package.json                     # Dependencias y scripts
├── .env                             # API keys (no commitear)
├── babel.config.js                  # Configuración Babel
├── metro.config.js                  # Configuración Metro + NativeWind
├── tailwind.config.js               # Configuración TailwindCSS
├── tsconfig.json                    # Configuración TypeScript
│
├── android/                         # Proyecto nativo Android (prebuild)
├── assets/                          # Iconos, imágenes, animaciones de carga
├── plugins/                         # Plugins Expo
│   ├── withYouTubeDownloader.js     # Plugin para inyectar descargador nativo
│   └── native/
│       ├── YouTubeDownloaderModule.kt   # Módulo Kotlin nativo
│       └── YouTubeDownloaderPackage.kt  # Registro del paquete nativo
│
└── src/
    ├── components/
    │   ├── ArtistExtractor.tsx      # Extracción IA de artista/canción
    │   ├── Loading.tsx              # Pantalla de carga animada
    │   ├── Lyrics.tsx               # Letras + traducción IA
    │   ├── MiniPlayer.tsx           # Mini reproductor flotante
    │   ├── SongItem.tsx             # Elemento de lista de canciones
    │   ├── TabButton.tsx            # Botón de tab de navegación
    │   └── VinylDisc.tsx            # Vinilo animado con portada
    ├── constants/
    │   └── index.ts                 # Colores, gradientes, constantes
    ├── context/
    │   └── AudioContext.tsx         # Estado global de reproducción
    ├── navigation/
    │   └── BottomTabBar.tsx         # Barra de navegación inferior
    ├── screens/
    │   ├── AlbumsScreen.tsx         # Gestión de álbumes
    │   ├── LibraryScreen.tsx        # Biblioteca de música local
    │   ├── PlayerScreen.tsx         # Reproductor completo
    │   └── SearchScreen.tsx         # Búsqueda y streaming de YouTube
    ├── services/
    │   ├── database.ts              # SQLite: álbumes, canciones
    │   ├── downloader.ts            # Puente al módulo nativo de descarga
    │   ├── genius.ts                # API de Genius: búsqueda de letras
    │   ├── groq.ts                  # API Groq: metadatos + traducción
    │   └── youtube.ts               # YouTube Data API v3
    ├── types/
    │   └── index.ts                 # Interfaces y tipos TypeScript
    └── utils/
        └── index.ts                 # Funciones utilitarias
```

### Uso

#### Pantalla de Biblioteca
- Escanea automáticamente los archivos de audio del dispositivo
- Barra de búsqueda para filtrar canciones
- Toca una canción para reproducirla

#### Pantalla de Reproductor
- Controles de reproducción: play/pause, siguiente, anterior
- Barra de seek para avanzar/retroceder
- Modo shuffle y repetición (off / todos / uno)
- Botón de letras para ver la letra de la canción
- Botón de álbum para agregar a un álbum personalizado
- Vinilo animado con portada del álbum (personalizable desde la galería)

#### Pantalla de Búsqueda
- Busca videos de YouTube
- Reproduce directamente con el reproductor embebido
- Descarga el audio al dispositivo con un toque

#### Pantalla de Álbumes
- Crea álbumes personalizados con nombre y color gradiente
- Agrega o elimina canciones de cada álbum
- Vista de cuadrícula y vista de detalle

### Funcionalidad nativa (Android)

El módulo nativo `YouTubeDownloaderModule.kt` utiliza la librería `youtubedl-android` para:

1. Descargar videos de YouTube
2. Extraer el audio del archivo MP4 usando `MediaExtractor` y `MediaMuxer`
3. Guardar el archivo de audio en la carpeta pública de Descargas

Este módulo se inyecta automáticamente en el proyecto nativo mediante el plugin Expo `withYouTubeDownloader.js`.

### Solución de problemas

| Problema | Solución |
|----------|----------|
| Error al ejecutar `npx expo prebuild` | Asegúrate de tener Android Studio instalado y el SDK configurado |
| No se detectan canciones locales | Verifica que los permisos de almacenamiento estén concedidos |
| Las letras no se cargan | Verifica tu API key de Genius en el archivo `.env` |
| La traducción IA falla | Verifica tu API key de Groq y revisa los límites de uso |
| La descarga de YouTube falla | Asegúrate de tener espacio suficiente en el dispositivo |
| Error de compilación Kotlin | Ejecuta `npx expo prebuild --clean` y vuelve a compilar |

### Licencia

Este proyecto está bajo licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## English

### Description

**RosqMusic** is a mobile music player built with **React Native / Expo** for Android. It combines local audio playback with YouTube streaming and downloading, AI-powered metadata extraction, song lyrics with automatic translation, and custom album management. All wrapped in a dark-themed, elegant interface accented in yellow/gold.

### Key Features

- **Local music player** — Scans and plays audio files from your device (MP3, WAV, M4A, AAC)
- **YouTube streaming** — Search and play YouTube videos directly in the app
- **Audio downloading** — Download audio from YouTube to local storage via a native Android module
- **AI-powered lyrics** — Fetches lyrics from Genius and auto-translates them (English ↔ Spanish) using Groq AI
- **Metadata extraction** — Identifies artist and song name from filenames using AI
- **Album management** — Create, edit, and delete custom albums with gradient cover art
- **Mini player** — Persistent floating playback bar above navigation
- **Animated vinyl** — Spinning vinyl disc with customizable album cover
- **Dark mode** — Fully dark interface with golden accents (#FDD835)

### Technologies

| Category | Technology |
|----------|------------|
| Framework | React Native 0.81.5, Expo SDK 54 |
| Language | TypeScript 5.9.2 (strict mode) |
| UI/Styling | NativeWind (TailwindCSS), react-native-paper |
| Navigation | @react-navigation/native + stack |
| Audio | expo-av (playback + background), expo-audio |
| Database | expo-sqlite (albums and songs) |
| External APIs | YouTube Data API v3, Genius API, Groq API (LLaMA 3.3 70B) |
| Native Android | Kotlin (youtubedl-android module for downloads) |
| Animations | react-native-reanimated, react-native-gesture-handler |
| Lists | @shopify/flash-list |

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** with Android SDK configured
- **Android device** or emulator
- **API Keys** (see setup section below)

### Installation

```bash
# 1. Clone the repository
git clone <REPOSITORY_URL>
cd my-expo-app

# 2. Install dependencies
npm install

# 3. Configure environment variables (see API Keys section)
cp .env.example .env
# Edit .env with your API keys

# 4. Generate native project
npx expo prebuild

# 5. Run on Android
npx expo run:android
```

### API Keys Setup

Create a `.env` file in the project root with the following variables:

```env
EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
EXPO_PUBLIC_GENIUS_API_KEY=your_genius_api_key
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

#### YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing one
3. Enable the **YouTube Data API v3**
4. Go to **Credentials** → **Create credentials** → **API key**
5. Copy the key and add it as `EXPO_PUBLIC_YOUTUBE_API_KEY`

#### Genius API

1. Go to [https://genius.com/api-clients](https://genius.com/api-clients)
2. Create an account or sign in
3. Create a new API Client
4. Copy the **Access Token** and add it as `EXPO_PUBLIC_GENIUS_API_KEY`

#### Groq API

1. Go to [https://console.groq.com](https://console.groq.com)
2. Create an account or sign in
3. Go to **API Keys** → **Create API Key**
4. Copy the key and add it as `EXPO_PUBLIC_GROQ_API_KEY`
5. The model used is **LLaMA 3.3 70B** (configured in `src/constants/index.ts`)

### Project Structure

```
my-expo-app/
├── App.tsx                          # Application entry point
├── app.json                         # Expo configuration
├── package.json                     # Dependencies and scripts
├── .env                             # API keys (do not commit)
├── babel.config.js                  # Babel configuration
├── metro.config.js                  # Metro + NativeWind configuration
├── tailwind.config.js               # TailwindCSS configuration
├── tsconfig.json                    # TypeScript configuration
│
├── android/                         # Native Android project (prebuild)
├── assets/                          # Icons, images, loading animations
├── plugins/                         # Expo plugins
│   ├── withYouTubeDownloader.js     # Plugin to inject native downloader
│   └── native/
│       ├── YouTubeDownloaderModule.kt   # Native Kotlin module
│       └── YouTubeDownloaderPackage.kt  # Native package registration
│
└── src/
    ├── components/
    │   ├── ArtistExtractor.tsx      # AI-powered artist/song extraction
    │   ├── Loading.tsx              # Animated loading screen
    │   ├── Lyrics.tsx               # Lyrics + AI translation
    │   ├── MiniPlayer.tsx           # Floating mini player
    │   ├── SongItem.tsx             # Song list item
    │   ├── TabButton.tsx            # Navigation tab button
    │   └── VinylDisc.tsx            # Animated vinyl with cover art
    ├── constants/
    │   └── index.ts                 # Colors, gradients, constants
    ├── context/
    │   └── AudioContext.tsx         # Global audio playback state
    ├── navigation/
    │   └── BottomTabBar.tsx         # Bottom navigation bar
    ├── screens/
    │   ├── AlbumsScreen.tsx         # Album management
    │   ├── LibraryScreen.tsx        # Local music library
    │   ├── PlayerScreen.tsx         # Full player screen
    │   └── SearchScreen.tsx         # YouTube search and streaming
    ├── services/
    │   ├── database.ts              # SQLite: albums, songs
    │   ├── downloader.ts            # Bridge to native download module
    │   ├── genius.ts                # Genius API: lyrics search
    │   ├── groq.ts                  # Groq API: metadata + translation
    │   └── youtube.ts               # YouTube Data API v3
    ├── types/
    │   └── index.ts                 # TypeScript interfaces and types
    └── utils/
        └── index.ts                 # Utility functions
```

### Usage

#### Library Screen
- Automatically scans the device for audio files
- Search bar to filter songs
- Tap a song to play it

#### Player Screen
- Playback controls: play/pause, next, previous
- Seek bar to fast-forward/rewind
- Shuffle mode and repeat (off / all / one)
- Lyrics button to view the song's lyrics
- Album button to add to a custom album
- Animated vinyl with album cover (customizable from gallery)

#### Search Screen
- Search YouTube videos
- Play directly with the embedded player
- Download audio to device with one tap

#### Albums Screen
- Create custom albums with name and gradient color
- Add or remove songs from each album
- Grid view and detail view

### Native Functionality (Android)

The native `YouTubeDownloaderModule.kt` uses the `youtubedl-android` library to:

1. Download YouTube videos
2. Extract audio from MP4 using `MediaExtractor` and `MediaMuxer`
3. Save the audio file to the public Downloads folder

This module is automatically injected into the native project via the Expo plugin `withYouTubeDownloader.js`.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Error running `npx expo prebuild` | Make sure Android Studio is installed and SDK is configured |
| Local songs not detected | Verify that storage permissions have been granted |
| Lyrics not loading | Check your Genius API key in the `.env` file |
| AI translation failing | Check your Groq API key and review usage limits |
| YouTube download failing | Make sure you have enough storage space on the device |
| Kotlin build error | Run `npx expo prebuild --clean` and rebuild |

### License

This project is licensed under the MIT License. See the `LICENSE` file for details.
