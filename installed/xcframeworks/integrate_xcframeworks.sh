#!/bin/bash

echo "🔗 Intégration des XCFrameworks FFmpeg dans le projet iOS"

# Copier vers le projet iOS
IOS_FRAMEWORKS_DIR="../../ios/Frameworks"
mkdir -p "$IOS_FRAMEWORKS_DIR"

for xcframework in *.xcframework; do
    if [[ -d "$xcframework" ]]; then
        echo "  Copie de $xcframework..."
        cp -R "$xcframework" "$IOS_FRAMEWORKS_DIR/"
    fi
done

echo "✅ XCFrameworks copiés dans ios/Frameworks/"
echo ""
echo "📝 Instructions Xcode pour XCFrameworks:"
echo "1. Ouvrir ios/Naya.xcodeproj"
echo "2. Aller dans General > Frameworks, Libraries, and Embedded Content"
echo "3. Ajouter chaque .xcframework"
echo "4. Sélectionner 'Embed & Sign' pour chaque XCFramework"
echo "5. XCFrameworks supportent automatiquement device + simulator!"
