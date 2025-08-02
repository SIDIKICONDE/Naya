#!/bin/bash
# Script pour nettoyer les signatures des frameworks FFmpeg
echo "🧹 Nettoyage des signatures des frameworks..."

for framework in *.framework; do
    if [[ -d "$framework" ]]; then
        echo "  Nettoyage de $framework"
        find "$framework" -name "*.dylib" -exec codesign --remove-signature {} \; 2>/dev/null || true
        find "$framework" -name "*" -type f -exec codesign --remove-signature {} \; 2>/dev/null || true
    fi
done

echo "✅ Signatures nettoyées"
