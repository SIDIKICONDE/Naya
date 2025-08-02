# 📖 Documentation Technique - Module Natif Naya

## 🔧 Technologies

- **React Native** 0.80+
- **Turbo Modules**
- **C++20**
- **TypeScript**
- **JSI**
- **Xcode** 16.2+
- **CMake**
- **CocoaPods**
- **Gradle**
- **Hermes Engine**

## 📂 Structure

```
Naya/
├── src/native/                          ← Code C++ partagé (SOURCE UNIQUE)
│   ├── NativeModuleEQ.h
│   └── NativeModuleEQ.cpp
├── specs/                               ← Interfaces TypeScript
│   └── NativeModuleEQ.ts
├── ios/
│   ├── NativeModuleEQProvider.h/mm     ← Provider iOS
│   ├── Naya-Bridging-Header.h
│   └── Naya.xcodeproj/
├── android/app/src/main/jni/           ← Configuration Android
│   ├── CMakeLists.txt
│   └── OnLoad.cpp
├── build/generated/                     ← Fichiers générés par Codegen
├── App.tsx                              ← Interface de test
└── doc/DOCUMENTATION_TECHNIQUE.md       ← Cette documentation
```

#### 📋 Configuration des Références

**iOS (Xcode)**

```xml
<!-- ios/Naya.xcodeproj/project.pbxproj -->
<path>../src/native</path>  ← Référence vers la source unique
```

**Android (CMake)**

```cmake
# android/app/src/main/jni/CMakeLists.txt
target_sources(${CMAKE_PROJECT_NAME} PRIVATE
    ../../../../../src/native/NativeModuleEQ.cpp)  ← Source unique
```

#### 🎯 Avantages de cette Architecture

1. **Pas de duplication** - Une seule source de vérité
2. **Maintenance simplifiée** - Modifications dans un seul endroit
3. **Cohérence garantie** - Même code sur iOS et Android
4. **Éviter les conflits** - Pas de versions différentes
5. **Build unifié** - Même compilation pour toutes les plateformes

#### ⚠️ Règles Importantes

**✅ À FAIRE :**

- Créer tous les nouveaux fichiers dans `src/native/` ou ses sous-dossiers
- Ajouter autant de fichiers C++ que voulu dans `src/native/`
- Modifier les fichiers existants dans `src/native/`
- Organiser le code en sous-dossiers par fonctionnalité
- Utiliser les références de projet pour pointer vers `src/native/`

**📂 Extension avec plusieurs fichiers :**

Structure complète pour l'extension :

```
specs/                                  ← ✅ Interfaces TypeScript
├── NativeModuleEQ.ts                   ← Module principal
├── NativeAudioProcessor.ts             ← ✅ Nouveau module
├── NativeImageProcessor.ts             ← ✅ Nouveau module
└── NativeMathUtils.ts                  ← ✅ Nouveau module

src/native/                             ← ✅ Implémentations C++
├── NativeModuleEQ.h                    ← Module principal
├── NativeModuleEQ.cpp                  ← Module principal
├── AudioProcessor.h                    ← ✅ Nouveau module
├── AudioProcessor.cpp                  ← ✅ Nouveau module
├── ImageProcessor.h                    ← ✅ Nouveau module
├── ImageProcessor.cpp                  ← ✅ Nouveau module
├── utils/                              ← ✅ Nouveau dossier
│   ├── StringUtils.h
│   └── StringUtils.cpp
└── math/                               ← ✅ Nouveau dossier
    ├── Calculator.h
    └── Calculator.cpp
```

**🔧 Rôle du dossier `specs/` :**

- **Définit les interfaces TypeScript** pour chaque module natif
- **Génère automatiquement** le code C++ avec Codegen
- **Chaque fichier `.ts`** correspond à un module Turbo natif
- **Permet l'extension** avec plusieurs modules spécialisés

**📝 Exemple de nouveau module :**

`specs/NativeAudioProcessor.ts` :

```typescript
import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  readonly processAudio: (audioPath: string) => string;
  readonly extractMetadata: (filePath: string) => object;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeAudioProcessor');
```

**🔄 Processus complet pour ajouter un nouveau module :**

1. **Créer l'interface TypeScript** dans `specs/`
2. **Implémenter en C++** dans `src/native/`
3. **Ajouter les bibliothèques externes** (si nécessaire)
4. **Régénérer le code** : `npx @react-native-community/cli codegen`
5. **Configurer les builds** (Xcode + CMake)
6. **Réinstaller les dépendances** : `cd ios && pod install`
7. **Tester** : `yarn ios`

**📚 Intégration de Bibliothèques Externes :**

**Bibliothèques Audio/Vidéo populaires :**

- **FFmpeg** - Traitement audio/vidéo complet
- **FFTW** - Transformée de Fourier rapide
- **Kiss FFT** - FFT légère
- **OpenCV** - Vision par ordinateur
- **Eigen** - Mathématiques/algèbre linéaire

**Configuration iOS (CocoaPods) :**

`ios/Podfile` :

```ruby
target 'Naya' do
  # Bibliothèques existantes...

  # Bibliothèques externes
  pod 'FFmpeg-iOS', '~> 4.4'
  pod 'OpenCV', '~> 4.0'

  # Ou sources locales
  pod 'FFTW', :path => '../src/libraries/fftw'
end
```

**Configuration Android (CMake) :**

`android/app/src/main/jni/CMakeLists.txt` :

```cmake
# Ajouter les bibliothèques externes
find_library(log-lib log)

# FFmpeg
set(FFMPEG_DIR ${CMAKE_SOURCE_DIR}/../../../../../src/libraries/ffmpeg)
add_library(ffmpeg SHARED IMPORTED)
set_target_properties(ffmpeg PROPERTIES IMPORTED_LOCATION
    ${FFMPEG_DIR}/lib/${ANDROID_ABI}/libffmpeg.so)

# FFTW
find_package(PkgConfig REQUIRED)
pkg_check_modules(FFTW REQUIRED fftw3)

# Lier les bibliothèques
target_link_libraries(${CMAKE_PROJECT_NAME}
    ${log-lib}
    ffmpeg
    ${FFTW_LIBRARIES}
)

# Inclure les headers
target_include_directories(${CMAKE_PROJECT_NAME} PUBLIC
    ../../../../../src/native
    ${FFMPEG_DIR}/include
    ${FFTW_INCLUDE_DIRS}
)
```

**Structure avec bibliothèques :**

```
src/
├── native/
│   ├── NativeModuleEQ.cpp
│   └── AudioProcessor.cpp           ← Utilise FFmpeg
├── libraries/                       ← ✅ Bibliothèques externes
│   ├── ffmpeg/
│   │   ├── include/
│   │   └── lib/
│   ├── fftw/
│   │   ├── include/
│   │   └── lib/
│   └── opencv/
└── specs/
```



**🔧 Configuration pour nouveaux fichiers :**

iOS (Xcode) - Ajouter dans project.pbxproj :

```xml
<path>../src/native/AudioProcessor.cpp</path>
<path>../src/native/ImageProcessor.cpp</path>
<path>../src/native/utils/StringUtils.cpp</path>
<path>../src/native/math/Calculator.cpp</path>
```

Android (CMake) - Ajouter dans CMakeLists.txt :

```cmake
target_sources(${CMAKE_PROJECT_NAME} PRIVATE
    ../../../../../src/native/NativeModuleEQ.cpp
    ../../../../../src/native/AudioProcessor.cpp      ← ✅ Nouveau
    ../../../../../src/native/ImageProcessor.cpp      ← ✅ Nouveau
    ../../../../../src/native/utils/StringUtils.cpp   ← ✅ Nouveau
    ../../../../../src/native/math/Calculator.cpp     ← ✅ Nouveau
)

target_include_directories(${CMAKE_PROJECT_NAME} PUBLIC
    ../../../../../src/native
    ../../../../../src/native/utils                   ← ✅ Nouveau
    ../../../../../src/native/math                    ← ✅ Nouveau
)
```

## 🔄 Build

### iOS

```bash
cd ios && pod install
yarn ios
```

### Android

```bash
npx yarn android
```

### Production iOS

```bash
cd ios && xcodebuild -workspace Naya.xcworkspace \
  -scheme Naya -configuration Release \
