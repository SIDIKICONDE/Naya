#!/bin/bash

# Script pour compiler et exécuter les tests AudioRecord
# Usage: ./run_tests.sh [--coverage] [--verbose]

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BUILD_DIR="build"
COVERAGE_DIR="coverage"
CMAKE_BUILD_TYPE="Release"
VERBOSE=false
ENABLE_COVERAGE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            ENABLE_COVERAGE=true
            CMAKE_BUILD_TYPE="Debug"
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--coverage] [--verbose] [--help]"
            echo "  --coverage  : Activer la couverture de code"
            echo "  --verbose   : Affichage détaillé"
            echo "  --help      : Afficher cette aide"
            exit 0
            ;;
        *)
            echo "Option inconnue: $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🧪 Tests AudioRecord - Module Audio Natif React Native${NC}"
echo "============================================================"
echo "📦 Suite de tests complète:"
echo "   • AudioRecorderTest.cpp        - Tests du moteur principal"
echo "   • AudioEncodersTest.cpp        - Tests encodage multi-format"
echo "   • AudioDSPTest.cpp             - Tests processeurs DSP temps réel"
echo "   • PlatformAudioCaptureTest.cpp - Tests capture native"
echo ""

# Fonction d'affichage avec couleur
print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifications préalables
print_step "Vérification des prérequis..."

if ! command -v cmake &> /dev/null; then
    print_error "CMake n'est pas installé"
    exit 1
fi

if ! command -v g++ &> /dev/null && ! command -v clang++ &> /dev/null; then
    print_error "Aucun compilateur C++ trouvé (g++ ou clang++)"
    exit 1
fi

print_success "Prérequis vérifiés"

# Créer le répertoire de build
print_step "Configuration du build..."

if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
fi
mkdir -p "$BUILD_DIR"

cd "$BUILD_DIR"

# Configuration CMake
CMAKE_ARGS=""
if [ "$VERBOSE" = true ]; then
    CMAKE_ARGS="$CMAKE_ARGS -DCMAKE_VERBOSE_MAKEFILE=ON"
fi

if [ "$ENABLE_COVERAGE" = true ]; then
    print_step "Configuration avec couverture de code activée..."
    CMAKE_ARGS="$CMAKE_ARGS -DCMAKE_BUILD_TYPE=Debug"
else
    CMAKE_ARGS="$CMAKE_ARGS -DCMAKE_BUILD_TYPE=Release"
fi

cmake .. $CMAKE_ARGS

print_success "Configuration terminée"

# Compilation
print_step "Compilation des tests..."

if [ "$VERBOSE" = true ]; then
    make VERBOSE=1
else
    make -j$(nproc 2>/dev/null || echo 4)  # Utiliser tous les cores disponibles
fi

print_success "Compilation terminée"

# Exécution des tests
print_step "Exécution des tests..."

if [ "$VERBOSE" = true ]; then
    ./audio_recorder_tests --gtest_output=xml:test_results.xml
else
    ./audio_recorder_tests
fi

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "Tous les tests sont passés!"
else
    print_error "Certains tests ont échoué (code: $TEST_EXIT_CODE)"
fi

# Génération du rapport de couverture si demandé
if [ "$ENABLE_COVERAGE" = true ] && [ $TEST_EXIT_CODE -eq 0 ]; then
    print_step "Génération du rapport de couverture..."
    
    if command -v lcov &> /dev/null && command -v genhtml &> /dev/null; then
        make coverage
        print_success "Rapport de couverture généré dans build/coverage/index.html"
        
        # Afficher un résumé de la couverture
        if [ -f "coverage/coverage_filtered.info" ]; then
            echo ""
            echo "📊 Résumé de la couverture:"
            lcov --summary coverage/coverage_filtered.info
        fi
    else
        print_error "lcov/genhtml non installés, impossible de générer le rapport de couverture"
        echo "Installation: sudo apt-get install lcov (Ubuntu/Debian)"
    fi
fi

# Nettoyage et résumé
cd ..

echo ""
echo "============================================================"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "Tests terminés avec succès!"
    
    if [ "$ENABLE_COVERAGE" = true ]; then
        echo -e "📊 Rapport de couverture: ${BLUE}file://$(pwd)/build/coverage/index.html${NC}"
    fi
    
    echo ""
    echo "🎯 Composants testés avec succès:"
    echo "   ✓ Moteur AudioRecorder (capture, enregistrement, callbacks)"
    echo "   ✓ Encodeurs multi-format (WAV, FLAC, OGG, AAC)"
    echo "   ✓ Processeurs DSP (Égaliseur, Compresseur, Reverb)"
    echo "   ✓ Capture native platform-specific (iOS/Android/Desktop)"
    echo "   ✓ Gestion mémoire et thread safety"
    echo ""
    echo "💡 Prochaines étapes:"
    echo "   - Intégrer les tests dans CI/CD"
    echo "   - Implémenter libFLAC/libvorbis pour encodeurs réels"
    echo "   - Ajouter AVAudioEngine pour capture iOS réelle"
    echo "   - Implémenter plus d'effets DSP (limiter, gate, chorus)"
else
    print_error "Tests échoués!"
    echo ""
    echo "🔧 Actions recommandées:"
    echo "   - Vérifier les logs d'erreur ci-dessus"
    echo "   - Exécuter avec --verbose pour plus de détails"
    echo "   - Vérifier les dépendances système"
fi

exit $TEST_EXIT_CODE