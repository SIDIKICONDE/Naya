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
