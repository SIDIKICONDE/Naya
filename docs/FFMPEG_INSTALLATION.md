# Installation FFmpeg pour React Native Naya

## 📋 Vue d'ensemble

FFmpeg est maintenant complètement installé et configuré pour votre projet React Native Naya sur iOS et Android. Cette documentation décrit l'installation réalisée et les prochaines étapes.

## ✅ Installation terminée

### Android
- **Bibliothèques FFmpeg 7.1** téléchargées et configurées
- **Architectures supportées** : arm64-v8a, armeabi-v7a, x86, x86_64
- **CMakeLists.txt** configuré pour la liaison automatique
- **Bibliothèques disponibles** : libffmpeg.so, libavcodec.so, libavformat.so, libavutil.so, libavfilter.so, libswscale.so, libswresample.so

### iOS
- **Bibliothèques statiques FFmpeg** déjà présentes dans `FFmpeg-iOS/`
- **Podfile** configuré avec les chemins et liaisons appropriés
- **Headers** disponibles dans `FFmpeg-iOS/include/`
- **Bibliothèques disponibles** : libavcodec.a, libavformat.a, libavutil.a, libswscale.a, libswresample.a, libavfilter.a, libavdevice.a

## 📁 Structure des fichiers

```
Naya/
├── android/
│   ├── ffmpeg-libs/
│   │   └── ffmpeg-7.1-android-lite/
│   │       ├── include/          # Headers FFmpeg
│   │       └── lib/              # Bibliothèques par architecture
│   │           ├── arm64-v8a/
│   │           ├── armeabi-v7a/
│   │           ├── x86/
│   │           └── x86_64/
│   └── app/src/main/jni/
│       └── CMakeLists.txt        # Configuration CMake mise à jour
├── ios/
│   └── Podfile                   # Configuration iOS mise à jour
├── FFmpeg-iOS/
│   ├── include/                  # Headers FFmpeg iOS
│   └── lib/                      # Bibliothèques statiques iOS
├── src/native/
│   ├── FFmpegTestModule.h        # Module de test
│   └── FFmpegTestModule.cpp      # Implémentation test
└── test_ffmpeg_installation.sh   # Script de vérification
```

## 🔧 Configuration technique

### Android CMakeLists.txt

```cmake
# Configuration FFmpeg
set(FFMPEG_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../../../ffmpeg-libs/ffmpeg-7.1-android-lite)
set(FFMPEG_INCLUDE_DIR ${FFMPEG_ROOT_PATH}/include)
set(FFMPEG_LIB_DIR ${FFMPEG_ROOT_PATH}/lib/${ANDROID_ABI})

# Include FFmpeg headers
include_directories(${FFMPEG_INCLUDE_DIR})

# Bibliothèques FFmpeg importées et liées automatiquement
```

### iOS Podfile

```ruby
# Configuration FFmpeg pour iOS
config.build_settings['HEADER_SEARCH_PATHS'] << ' "$(SRCROOT)/../FFmpeg-iOS/include"'
config.build_settings['LIBRARY_SEARCH_PATHS'] << ' "$(SRCROOT)/../FFmpeg-iOS/lib"'
config.build_settings['OTHER_LDFLAGS'] << ' -lavformat -lavcodec -lavutil -lswscale -lswresample -lavfilter -lavdevice'
```

## 🧪 Test de l'installation

Un script de test complet a été créé pour vérifier l'installation :

```bash
./test_ffmpeg_installation.sh
```

### Résultats des tests
- ✅ Bibliothèques Android FFmpeg installées et configurées
- ✅ Toutes les architectures Android disponibles (arm64-v8a, armeabi-v7a, x86, x86_64)
- ✅ Headers et bibliothèques iOS disponibles
- ✅ Configuration CMake Android complète
- ✅ Configuration Podfile iOS complète
- ✅ Modules de test C++ créés

## 📚 Bibliothèques FFmpeg disponibles

### Fonctionnalités incluses dans la version "lite"
- **Codecs audio** : AAC, MP3, Opus, Vorbis, PCM
- **Codecs vidéo** : H.264, H.265, VP8, VP9, MPEG-4
- **Formats conteneurs** : MP4, MOV, AVI, MKV, WebM, FLV
- **Protocoles** : HTTP, HTTPS, FTP, FILE
- **Filtres** : Basiques pour audio et vidéo

### Modules C++ disponibles
- `FFmpegTestModule` : Module de test pour vérifier les fonctionnalités FFmpeg
  - `getFFmpegVersion()` : Obtenir les versions des bibliothèques
  - `initializeFFmpeg()` : Initialiser les composants FFmpeg
  - `getSupportedFormats()` : Lister les formats supportés
  - `testAudioEncoding()` : Test d'encodage audio

## 🚀 Prochaines étapes

### 1. Compilation et test

```bash
# Test Android
yarn android

# Test iOS  
yarn ios
```

### 2. Création de TurboModules
Créer des TurboModules React Native pour exposer les fonctionnalités FFmpeg à JavaScript :

- **AudioEncoderModule** : Encodage audio
- **VideoProcessorModule** : Traitement vidéo
- **MediaInfoModule** : Informations sur les fichiers média
- **StreamingModule** : Streaming audio/vidéo

### 3. Intégration avec votre système audio
Intégrer FFmpeg avec votre architecture audio existante dans `src/audio/`.

### 4. Tests d'intégration
Créer des tests pour vérifier :
- L'encodage/décodage audio
- La conversion de formats
- Le traitement en temps réel
- Les performances sur différents appareils

## 🔧 Dépannage

### Android
Si vous rencontrez des erreurs de compilation :
1. Vérifiez que le NDK est installé
2. Nettoyez et recompilez : `cd android && ./gradlew clean`
3. Vérifiez les chemins dans `CMakeLists.txt`

### iOS
Si vous rencontrez des erreurs de liaison :
1. Exécutez `cd ios && pod install --repo-update`
2. Nettoyez le build : Product → Clean Build Folder dans Xcode
3. Vérifiez les chemins dans le Podfile

### Test des fonctionnalités
Utilisez le module de test pour vérifier que FFmpeg fonctionne :

```cpp
#include "src/native/FFmpegTestModule.h"

// Dans votre code C++
std::string version = naya::FFmpegTestModule::getFFmpegVersion();
bool initialized = naya::FFmpegTestModule::initializeFFmpeg();
```

## 📖 Documentation supplémentaire

- [FFmpeg Documentation officielle](https://ffmpeg.org/documentation.html)
- [Guide TurboModules React Native](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules)
- [Architecture Naya Native System](doc/Naya%20Native%20System%20–%20TurboModules%20C++%20Guide.md)

## 📝 Notes importantes

- **Licence** : FFmpeg est sous licence LGPL v2.1 (version lite)
- **Performance** : Les bibliothèques sont optimisées pour la taille (version lite)
- **Compatibilité** : Compatible avec React Native 0.72+ et la nouvelle architecture
- **Maintenance** : Vérifiez régulièrement les mises à jour FFmpeg

## 🎯 Recommandations

1. **Modularité** : Créez des modules spécialisés par fonctionnalité (audio, vidéo, streaming)
2. **Performance** : Utilisez des threads séparés pour les opérations FFmpeg intensives
3. **Gestion d'erreur** : Implémentez une gestion d'erreur robuste pour les opérations FFmpeg
4. **Tests** : Créez des tests automatisés pour chaque fonctionnalité FFmpeg

---

**Installation FFmpeg terminée avec succès !** 🎉

Votre projet Naya est maintenant prêt à utiliser FFmpeg pour le traitement audio et vidéo avancé.