#!/bin/bash

# Script de test pour vérifier l'installation FFmpeg
# Usage: ./test_ffmpeg_installation.sh

echo "=== Test d'installation FFmpeg pour Naya ==="
echo

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Test 1: Vérifier les bibliothèques Android
echo "1. Vérification des bibliothèques FFmpeg Android..."
if [ -d "android/ffmpeg-libs/ffmpeg-7.1-android-lite" ]; then
    print_result 0 "Dossier FFmpeg Android trouvé"
    
    # Vérifier les architectures
    for arch in arm64-v8a armeabi-v7a x86 x86_64; do
        if [ -d "android/ffmpeg-libs/ffmpeg-7.1-android-lite/lib/$arch" ]; then
            print_result 0 "Architecture $arch disponible"
        else
            print_result 1 "Architecture $arch manquante"
        fi
    done
    
    # Vérifier les bibliothèques principales
    arch="arm64-v8a"  # Test sur une architecture
    lib_path="android/ffmpeg-libs/ffmpeg-7.1-android-lite/lib/$arch"
    for lib in libffmpeg.so libavcodec.so libavformat.so libavutil.so; do
        if [ -f "$lib_path/$lib" ]; then
            print_result 0 "Bibliothèque $lib trouvée"
        else
            print_result 1 "Bibliothèque $lib manquante"
        fi
    done
else
    print_result 1 "Dossier FFmpeg Android non trouvé"
    echo -e "${YELLOW}Exécutez d'abord le téléchargement des bibliothèques Android${NC}"
fi

echo

# Test 2: Vérifier les bibliothèques iOS
echo "2. Vérification des bibliothèques FFmpeg iOS..."
if [ -d "FFmpeg-iOS" ]; then
    print_result 0 "Dossier FFmpeg iOS trouvé"
    
    # Vérifier les headers
    if [ -d "FFmpeg-iOS/include" ]; then
        print_result 0 "Headers FFmpeg iOS disponibles"
        
        # Vérifier les headers principaux
        for header in libavcodec/avcodec.h libavformat/avformat.h libavutil/avutil.h; do
            if [ -f "FFmpeg-iOS/include/$header" ]; then
                print_result 0 "Header $header trouvé"
            else
                print_result 1 "Header $header manquant"
            fi
        done
    else
        print_result 1 "Headers FFmpeg iOS manquants"
    fi
    
    # Vérifier les bibliothèques statiques
    if [ -d "FFmpeg-iOS/lib" ]; then
        print_result 0 "Bibliothèques FFmpeg iOS disponibles"
        
        for lib in libavcodec.a libavformat.a libavutil.a libswscale.a; do
            if [ -f "FFmpeg-iOS/lib/$lib" ]; then
                print_result 0 "Bibliothèque $lib trouvée"
            else
                print_result 1 "Bibliothèque $lib manquante"
            fi
        done
    else
        print_result 1 "Bibliothèques FFmpeg iOS manquantes"
    fi
else
    print_result 1 "Dossier FFmpeg iOS non trouvé"
fi

echo

# Test 3: Vérifier la configuration CMake Android
echo "3. Vérification de la configuration CMake Android..."
if [ -f "android/app/src/main/jni/CMakeLists.txt" ]; then
    if grep -q "FFMPEG_ROOT_PATH" "android/app/src/main/jni/CMakeLists.txt"; then
        print_result 0 "Configuration FFmpeg trouvée dans CMakeLists.txt"
    else
        print_result 1 "Configuration FFmpeg manquante dans CMakeLists.txt"
    fi
    
    if grep -q "libffmpeg.so" "android/app/src/main/jni/CMakeLists.txt"; then
        print_result 0 "Liaison FFmpeg configurée"
    else
        print_result 1 "Liaison FFmpeg non configurée"
    fi
else
    print_result 1 "CMakeLists.txt non trouvé"
fi

echo

# Test 4: Vérifier la configuration iOS Podfile
echo "4. Vérification de la configuration iOS Podfile..."
if [ -f "ios/Podfile" ]; then
    if grep -q "FFmpeg-iOS" "ios/Podfile"; then
        print_result 0 "Configuration FFmpeg trouvée dans Podfile"
    else
        print_result 1 "Configuration FFmpeg manquante dans Podfile"
    fi
    
    if grep -q "lavformat\|lavcodec\|lavutil" "ios/Podfile"; then
        print_result 0 "Liaison FFmpeg configurée dans Podfile"
    else
        print_result 1 "Liaison FFmpeg non configurée dans Podfile"
    fi
else
    print_result 1 "Podfile non trouvé"
fi

echo

# Test 5: Vérifier les modules de test
echo "5. Vérification des modules de test..."
if [ -f "src/native/FFmpegTestModule.h" ]; then
    print_result 0 "Header de test FFmpeg trouvé"
else
    print_result 1 "Header de test FFmpeg manquant"
fi

if [ -f "src/native/FFmpegTestModule.cpp" ]; then
    print_result 0 "Implementation de test FFmpeg trouvée"
else
    print_result 1 "Implementation de test FFmpeg manquante"
fi

echo

# Résumé
echo "=== Résumé de l'installation ==="
echo -e "${YELLOW}Pour tester complètement l'installation:${NC}"
echo "1. Compilez le projet Android: yarn android"
echo "2. Compilez le projet iOS: yarn ios"
echo "3. Vérifiez les logs de compilation pour les erreurs FFmpeg"
echo

echo -e "${YELLOW}Prochaines étapes recommandées:${NC}"
echo "- Créer des TurboModules pour exposer FFmpeg à JavaScript"
echo "- Implémenter des fonctions audio/vidéo de base"
echo "- Ajouter des tests d'intégration"
echo

echo "Test terminé."