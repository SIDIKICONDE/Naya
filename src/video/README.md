# 🎬 Lecteur Vidéo Natif Naya

## 📋 Vue d'ensemble

Le lecteur vidéo natif de Naya est un **TurboModule C++** utilisant **FFmpeg** pour offrir des performances optimales et des fonctionnalités avancées de traitement vidéo.

## 🏗️ Architecture

```
📁 Naya/
├── specs/
│   └── NativeVideoPlayer.ts          ← Interface TypeScript
├── src/native/
│   ├── NativeVideoPlayer.h           ← Header C++
│   └── NativeVideoPlayer.cpp         ← Implémentation FFmpeg
├── ios/
│   ├── NativeVideoPlayerProvider.h   ← Provider iOS
│   └── NativeVideoPlayerProvider.mm  ← Implémentation iOS
└── android/app/src/main/jni/
    ├── CMakeLists.txt                ← Configuration Android
    └── OnLoad.cpp                    ← Enregistrement module
```

## ✨ Fonctionnalités

### 🎮 Contrôles de base
- ▶️ **Lecture/Pause/Stop** - Contrôle complet de la lecture
- ⏯️ **Seek** - Navigation précise dans la vidéo
- 🔊 **Volume/Mute** - Gestion audio complète
- ⚡ **Vitesse de lecture** - 0.25x à 4.0x

### 🖼️ Affichage
- 🖥️ **Mode plein écran** - Support natif
- 📐 **Modes d'affichage** - Fit, Fill, Stretch, Center, Crop
- 🎨 **Filtres vidéo** - Luminosité, Contraste, Saturation, Flou

### 📊 Formats supportés
- **Conteneurs** : MP4, AVI, MOV, MKV, WEBM, FLV, WMV, M4V
- **Codecs vidéo** : H.264, H.265, VP8, VP9, AV1, XViD, DivX
- **Codecs audio** : AAC, MP3, AC3, DTS, FLAC, OGG, Opus

### 🚀 Fonctionnalités avancées
- ⚡ **Accélération matérielle** - GPU acceleration
- 📷 **Capture de frames** - Export en base64
- ✂️ **Export de segments** - Découpe vidéo
- 📝 **Sous-titres** - Support SRT, VTT, ASS, SSA
- 📈 **Statistiques temps réel** - FPS, mémoire, CPU

## 🛠️ Utilisation

### Interface de base

```typescript
import NativeVideoPlayer from 'specs/NativeVideoPlayer';

// Créer un lecteur
const success = await NativeVideoPlayer.createPlayer('player1');

// Configurer
const config = {
  autoplay: false,
  volume: 0.8,
  hardwareAcceleration: true
};
await NativeVideoPlayer.initializePlayer('player1', config);

// Charger une vidéo
const source = {
  url: 'https://example.com/video.mp4',
  type: 'mp4',
  quality: 'auto'
};
await NativeVideoPlayer.loadSource('player1', source);

// Contrôler
await NativeVideoPlayer.play('player1');
await NativeVideoPlayer.pause('player1');
await NativeVideoPlayer.seek('player1', 30.0);
```

### Gestionnaire simplifié

```typescript
import { NativeVideoPlayerManager } from 'src/video/NativeVideoPlayerManager';

const player = new NativeVideoPlayerManager('myPlayer');

// Initialiser
await player.initialize({
  volume: 0.8,
  hardwareAcceleration: true
});

// Charger et lire
await player.loadVideo('https://example.com/video.mp4');
await player.play();

// Appliquer des filtres
await player.applyBrightnessFilter(1.2);
await player.applySaturationFilter(1.5);

// Événements
player.setEventHandlers({
  onStateChange: (state) => console.log('État:', state.state),
  onProgress: (time, duration) => console.log(`${time}/${duration}s`),
  onError: (error) => console.error('Erreur:', error)
});

// Nettoyage
await player.destroy();
```

## 📱 Exemples

### Lecteur basique
```typescript
import NativeVideoPlayerExample from 'src/video/examples/NativeVideoPlayerExample';

// Utilisation dans un composant React Native
<NativeVideoPlayerExample 
  initialVideoUrl="https://sample-videos.com/zip/10/mp4/480/SampleVideo_480x270_1mb.mp4"
/>
```

## 🔧 Configuration

### iOS (CocoaPods)
```ruby
# ios/Podfile
pod 'FFmpeg-iOS', '~> 4.4'  # Optionnel pour FFmpeg pré-compilé
```

### Android (CMake)
```cmake
# android/app/src/main/jni/CMakeLists.txt
# FFmpeg libraries configuration
find_library(log-lib log)
target_link_libraries(${CMAKE_PROJECT_NAME}
    ${log-lib}
    avformat avcodec avutil swscale swresample avfilter
)
```

### Package.json
```json
{
  "codegenConfig": {
    "name": "Naya",
    "type": "modules",
    "jsSrcsDir": "specs",
    "ios": {
      "modulesProvider": {
        "NativeVideoPlayer": "NativeVideoPlayerProvider"
      }
    }
  }
}
```

## 📈 Performance

### Optimisations C++
- **Threads dédiés** - Décodage et rendu séparés
- **Files de frames** - Mise en tampon intelligente
- **Gestion mémoire** - RAII et smart pointers
- **Pool de frames** - Réutilisation optimisée

### Statistiques temps réel
```typescript
const stats = player.getStats();
console.log({
  fps: stats.currentFps,
  framesDropped: stats.droppedFrames,
  memoryUsage: player.formatFileSize(stats.memoryUsage),
  cpuUsage: `${stats.cpuUsage.toFixed(1)}%`
});
```

## 🛡️ Gestion d'erreurs

### Types d'erreurs
- **NETWORK_ERROR** - Problème de connexion
- **DECODE_ERROR** - Erreur de décodage
- **FORMAT_ERROR** - Format non supporté
- **TIMEOUT_ERROR** - Délai d'attente dépassé

### Gestion robuste
```typescript
try {
  await player.loadVideo(url);
} catch (error) {
  const state = player.getState();
  if (state?.hasError) {
    console.error('Erreur vidéo:', state.errorMessage);
  }
}
```

## 🔄 Build et déploiement

### Régénération après modifications
```bash
# Toujours nécessaire après changement des specs
cd ios && pod install
```

### Compilation
```bash
# iOS
npx react-native run-ios

# Android  
npx react-native run-android
```

## 🎯 Roadmap

### Version actuelle (v1.0)
- ✅ Lecture vidéo de base
- ✅ Filtres vidéo simples
- ✅ Support multi-formats
- ✅ Accélération matérielle

### Prochaines versions
- 🔲 Streaming adaptatif (HLS/DASH)
- 🔲 Filtres avancés (noise reduction, stabilisation)
- 🔲 Support 360° VR
- 🔲 Effets de transition
- 🔲 Enregistrement vidéo

## 🤝 Contribution

### Ajout de nouveaux filtres
1. Modifier `VideoFilter` dans `NativeVideoPlayer.h`
2. Implémenter dans `updateFilters()` 
3. Ajouter l'interface TypeScript
4. Régénérer avec `pod install`

### Tests
```bash
# Tests unitaires C++
# (À implémenter)

# Tests d'intégration React Native
npm test
```

## 📚 Références

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [React Native TurboModules](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules)
- [JSI API Reference](https://reactnative.dev/docs/the-new-architecture/cxx-cxxturbomodules)

---

**Note** : Ce module nécessite React Native 0.80+ avec la Nouvelle Architecture activée.