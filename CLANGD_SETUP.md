# Configuration clangd pour le projet Naya

## 🎯 Vue d'ensemble

Cette configuration permet d'utiliser clangd (Language Server Protocol pour C/C++) avec votre projet React Native contenant du code C++ natif.

## 📁 Fichiers de configuration

### `.clangd`

Configuration principale de clangd avec :

- Chemins d'inclusion pour React Native
- Définitions de compilation
- Paramètres de diagnostic

### `compile_commands.json`

Base de données de compilation pour clangd avec les commandes de compilation pour chaque fichier source.

### `.vscode/settings.json`

Configuration VS Code pour :

- Intégration clangd
- Formateurs automatiques
- Paramètres spécifiques au langage

### `.vscode/extensions.json`

Extensions recommandées pour le développement C++.

## 🚀 Installation

1. **Installer l'extension clangd dans VS Code :**
   - Ouvrir VS Code
   - Aller dans Extensions (Ctrl+Shift+X)
   - Rechercher "clangd"
   - Installer "clangd" par LLVM

2. **Redémarrer VS Code**

3. **Vérifier l'installation :**
   ```bash
   ./test_clangd.sh
   ```

## 🔧 Fonctionnalités disponibles

- ✅ **Autocomplétion intelligente**
- ✅ **Navigation dans le code**
- ✅ **Détection d'erreurs en temps réel**
- ✅ **Refactoring automatique**
- ✅ **Formatage automatique**
- ✅ **Analyse statique**

## 📝 Utilisation

### Dans VS Code :

1. Ouvrir un fichier `.cpp` ou `.h`
2. L'autocomplétion apparaît automatiquement
3. Les erreurs sont soulignées en rouge
4. Ctrl+Click pour naviguer vers les définitions

### Commandes utiles :

- `Ctrl+Shift+P` → "clangd: Restart" (redémarrer le serveur)
- `Ctrl+Shift+P` → "clangd: Show AST" (afficher l'arbre syntaxique)

## ⚠️ Notes importantes

### Fichiers générés automatiquement

Les fichiers `*JSI.h` sont générés automatiquement par React Native Codegen. Ils apparaissent après :

- `npm run android` (pour Android)
- `npm run ios` (pour iOS)

### Erreurs courantes

- **"file not found"** : Normal pour les fichiers générés automatiquement
- **"IncludeCleaner"** : Peut être ignoré, n'affecte pas le fonctionnement

## 🛠️ Dépannage

### clangd ne démarre pas :

1. Vérifier que clangd est installé : `which clangd`
2. Redémarrer VS Code
3. Vérifier les logs dans Output → clangd

### Autocomplétion ne fonctionne pas :

1. Vérifier que l'extension est activée
2. Redémarrer le serveur clangd
3. Vérifier les chemins d'inclusion dans `.clangd`

## 📚 Ressources

- [Documentation clangd](https://clangd.llvm.org/)
- [React Native Codegen](https://github.com/facebook/react-native/tree/main/packages/react-native-codegen)
- [VS Code clangd extension](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)
