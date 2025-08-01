cmake_minimum_required(VERSION 3.13)

# Define the library name here.
project(appmodules)

# This file includes all the necessary to let you build your React Native application
include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

# Define where the additional source code lives. We need to crawl back the jni, main, src, app, android folders

# === ÉGALISEUR AUDIO PROFESSIONNEL ===

# Module principal AudioEqualizer
target_sources(${CMAKE_PROJECT_NAME} PRIVATE ../../../../../src/native/AudioEqualizer.cpp)

# Modules Audio de base
target_sources(${CMAKE_PROJECT_NAME} PRIVATE 
    ../../../../../src/native/audio/AudioProcessor.cpp
    ../../../../../src/native/audio/EQEngine.cpp
)

# Modules DSP (Traitement signal numérique)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE 
    ../../../../../src/native/dsp/FFTProcessor.cpp
    ../../../../../src/native/dsp/Filters.cpp
)

# Modules Effects (Effets professionnels)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE 
    ../../../../../src/native/effects/NoiseReduction.cpp
    ../../../../../src/native/effects/EffectSuppression.cpp
    ../../../../../src/native/effects/Compressor.cpp
    ../../../../../src/native/effects/Reverb.cpp
    ../../../../../src/native/effects/Echo.cpp
    ../../../../../src/native/effects/Normalizer.cpp
    ../../../../../src/native/effects/AudioEnhancer.cpp
)

# Modules Analysis (Analyse audio)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE 
    ../../../../../src/native/analysis/SpectrumAnalyzer.cpp
    ../../../../../src/native/analysis/VoiceDetector.cpp
)

# Modules Presets (Configurations prédéfinies)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE 
    ../../../../../src/native/presets/PresetManager.cpp
    ../../../../../src/native/presets/DefaultPresets.cpp
)

# Modules Video (Traitement vidéo/audio)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE 
    ../../../../../src/native/video/VideoAudioExtractor.cpp
    ../../../../../src/native/video/VideoProcessor.cpp
)

# Modules Utils (Utilitaires)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE 
    ../../../../../src/native/utils/AudioFormats.cpp
    ../../../../../src/native/utils/FileManager.cpp
)

# Define where CMake can find the additional header files. We need to crawl back the jni, main, src, app, android folders
target_include_directories(${CMAKE_PROJECT_NAME} PUBLIC 
    ../../../../../src/native
    ../../../../../src/native/audio
    ../../../../../src/native/dsp
    ../../../../../src/native/effects
    ../../../../../src/native/analysis
    ../../../../../src/native/presets
    ../../../../../src/native/video
    ../../../../../src/native/utils
)
target_include_directories(${CMAKE_PROJECT_NAME} PUBLIC ../../../../../src/native)
# === DÉPENDANCES AUDIO ANDROID ===

# Pour l'instant, utilisons les bibliothèques Android natives
# Les bibliothèques externes (FFmpeg, FFTW) nécessitent une compilation spécialisée pour Android

# Bibliothèques système Android pour audio
target_link_libraries(${CMAKE_PROJECT_NAME} 
    OpenSLES    # OpenSL ES pour l'audio Android natif
    mediandk    # Media NDK pour traitement audio/vidéo
    log         # Logging Android
    android     # APIs Android
)

# TODO: Ajouter FFmpeg compilé spécialement pour Android
# Les bibliothèques Homebrew ne fonctionnent que sur macOS, pas sur Android
# Nous devrons soit :
# 1. Utiliser FFmpeg Kit (recommandé)
# 2. Compiler FFmpeg nous-mêmes pour Android
# 3. Utiliser des alternatives natives Android