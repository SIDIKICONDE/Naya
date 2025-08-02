#!/bin/bash

# Script pour compiler FFmpeg pour simulateur iOS (x86_64)
# Puis créer des XCFrameworks universels (device + simulator)

set -e

echo "🔧 Build FFmpeg pour simulateur iOS (x86_64)"

# Configuration
FFMPEG_VERSION="7.1.1"
IOS_MIN_VERSION="15.0"
XCODE_DEVELOPER_DIR=$(xcode-select -p)

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Aller dans le répertoire FFmpeg
cd ffmpeg_src

log_info "Configuration pour simulateur iOS x86_64..."

# Configuration de l'environnement simulateur
export SDK="iphonesimulator"
export CROSS_TOP="${XCODE_DEVELOPER_DIR}/Platforms/iPhoneSimulator.platform/Developer"
export CROSS_SDK="iPhoneSimulator.sdk"
export SDK_PATH="${CROSS_TOP}/SDKs/${CROSS_SDK}"

# Vérifier que le SDK existe
if [[ ! -d "$SDK_PATH" ]]; then
    echo "❌ SDK simulateur non trouvé: $SDK_PATH"
    exit 1
fi

# Flags de compilation pour simulateur
export CFLAGS="-arch x86_64 -mios-simulator-version-min=${IOS_MIN_VERSION} -isysroot ${SDK_PATH}"
export CXXFLAGS="$CFLAGS"
export LDFLAGS="-arch x86_64 -isysroot ${SDK_PATH}"

# Nettoyer
make clean &>/dev/null || true

log_info "Configuration FFmpeg pour simulateur..."

# Configuration FFmpeg optimisée pour simulateur
./configure \
  --prefix=../installed/x86_64 \
  --disable-static \
  --enable-shared \
  --enable-cross-compile \
  --target-os=darwin \
  --arch=x86_64 \
  --sysroot="$SDK_PATH" \
  --extra-cflags="-arch x86_64 -mios-simulator-version-min=${IOS_MIN_VERSION}" \
  --extra-ldflags="-arch x86_64 -mios-simulator-version-min=${IOS_MIN_VERSION}" \
  --cc=clang \
  --cxx=clang++ \
  --install-name-dir=@rpath \
  --disable-audiotoolbox \
  --disable-doc \
  --disable-programs \
  --disable-videotoolbox \
  --enable-network \
  --enable-avcodec \
  --enable-avformat \
  --enable-avutil \
  --enable-swresample \
  --enable-swscale \
  --disable-avdevice \
  --disable-avfilter

log_info "Compilation en cours pour simulateur..."
make -j$(sysctl -n hw.ncpu)

log_info "Installation pour simulateur..."
make install

log_info "✅ Build simulateur terminé!"

# Créer les frameworks simulateur
log_info "Création des frameworks simulateur..."

mkdir -p "../installed/framework-sim"

libs=("libavcodec" "libavformat" "libavutil" "libswresample" "libswscale")

for lib in "${libs[@]}"; do
    echo "  Création framework simulateur pour $lib..."
    
    framework_dir="../installed/framework-sim/${lib}.framework"
    mkdir -p "$framework_dir"
    
    # Copier la bibliothèque
    cp "../installed/x86_64/lib/${lib}.dylib" "$framework_dir/${lib}"
    
    # Créer Info.plist
    cat > "$framework_dir/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>${lib}</string>
    <key>CFBundleIdentifier</key>
    <string>org.ffmpeg.${lib}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${lib}</string>
    <key>CFBundlePackageType</key>
    <string>FMWK</string>
    <key>CFBundleShortVersionString</key>
    <string>${FFMPEG_VERSION}</string>
    <key>CFBundleVersion</key>
    <string>${FFMPEG_VERSION}</string>
    <key>MinimumOSVersion</key>
    <string>${IOS_MIN_VERSION}</string>
</dict>
</plist>
EOF
    
    # Mettre à jour l'install name
    install_name_tool -id "@rpath/${lib}.framework/${lib}" "$framework_dir/${lib}"
    
    # Copier les headers
    mkdir -p "$framework_dir/Headers"
    if [[ -d "../installed/x86_64/include/${lib}" ]]; then
        cp -r "../installed/x86_64/include/${lib}/"* "$framework_dir/Headers/"
    fi
done

log_info "✅ Frameworks simulateur créés!"

# Créer les XCFrameworks universels (device + simulator)
log_info "Création des XCFrameworks universels..."

mkdir -p "../installed/xcframeworks-universal"

for lib in "${libs[@]}"; do
    echo "  Création XCFramework universel pour $lib..."
    
    xcframework_path="../installed/xcframeworks-universal/${lib}.xcframework"
    rm -rf "$xcframework_path"
    
    # Créer XCFramework avec device + simulator
    xcodebuild -create-xcframework \
        -framework "../installed/framework/${lib}.framework" \
        -framework "../installed/framework-sim/${lib}.framework" \
        -output "$xcframework_path"
done

log_info "🎉 XCFrameworks universels créés!"

# Script d'intégration final
cat > "../installed/xcframeworks-universal/integrate_universal.sh" << 'EOF'
#!/bin/bash

echo "🔗 Intégration des XCFrameworks universels FFmpeg"

# Remplacer les anciens frameworks
IOS_FRAMEWORKS_DIR="../../ios/Frameworks"

# Supprimer les anciens .xcframework
rm -rf "$IOS_FRAMEWORKS_DIR"/*.xcframework

# Copier les nouveaux XCFrameworks universels
for xcframework in *.xcframework; do
    if [[ -d "$xcframework" ]]; then
        echo "  Copie de $xcframework (device + simulator)..."
        cp -R "$xcframework" "$IOS_FRAMEWORKS_DIR/"
    fi
done

echo "✅ XCFrameworks universels installés!"
echo ""
echo "🎯 Chaque XCFramework supporte maintenant:"
echo "   • ARM64 (appareils iOS physiques)"
echo "   • x86_64 (simulateur iOS)"
echo ""
echo "📱 Testez sur device ET simulateur sans problème!"
EOF

chmod +x "../installed/xcframeworks-universal/integrate_universal.sh"

echo ""
echo "📊 Résumé final:"
echo "  • Frameworks ARM64 (device): ../installed/framework/"
echo "  • Frameworks x86_64 (simulator): ../installed/framework-sim/"
echo "  • XCFrameworks universels: ../installed/xcframeworks-universal/"
echo ""
echo "💡 Pour intégrer les XCFrameworks universels:"
echo "   cd ../installed/xcframeworks-universal"
echo "   ./integrate_universal.sh"