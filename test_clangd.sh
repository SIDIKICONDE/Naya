#!/bin/bash

echo "🧪 Test de la configuration clangd..."

# Test de syntaxe sur les fichiers C++
echo "📝 Vérification de la syntaxe C++..."
clangd --check=shared/NativeModuleEQ.cpp 2>&1 | head -20

echo ""
echo "📝 Vérification de la syntaxe des headers..."
clangd --check=shared/NativeModuleEQ.h 2>&1 | head -20

echo ""
echo "✅ Configuration clangd terminée !"
echo ""
echo "📋 Pour utiliser clangd dans VS Code :"
echo "1. Installez l'extension 'clangd' (llvm-vs-code-extensions.vscode-clangd)"
echo "2. Redémarrez VS Code"
echo "3. Ouvrez un fichier .cpp ou .h"
echo "4. Vous devriez voir l'autocomplétion et la détection d'erreurs"
echo ""
echo "🔧 Configuration créée :"
echo "   - .clangd (configuration principale)"
echo "   - compile_commands.json (compilation database)"
echo "   - .vscode/settings.json (configuration VS Code)"
echo "   - .vscode/extensions.json (extensions recommandées)" 