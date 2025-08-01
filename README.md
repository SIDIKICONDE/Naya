# 🚀 Naya - Module Natif React Native

Un module natif React Native cross-platform avec 8 fonctionnalités avancées, utilisant les Turbo Modules et le code partagé C++.

## ✨ Fonctionnalités

### 📝 **Traitement de texte**

- 🔄 **Inverser** - Inverse l'ordre des caractères
- 📊 **Compter** - Compte le nombre de caractères
- ⬆️ **MAJUSCULES** - Convertit en majuscules
- ⬇️ **minuscules** - Convertit en minuscules
- 🚫 **Espaces** - Supprime tous les espaces
- 🔄 **Palindrome** - Vérifie si c'est un palindrome

### 🔢 **Fonctions mathématiques**

- 🎲 **Aléatoire** - Génère un nombre aléatoire entre 1 et 100
- 🧮 **Factorielle** - Calcule la factorielle d'un nombre (0-20)

## 🏗️ Architecture

### **Code partagé** 🔄

```
src/native/
├── NativeModuleEQ.h     ← Header partagé
└── NativeModuleEQ.cpp   ← Implémentation partagée
```

### **Configuration cross-platform** ⚙️

- **iOS** : `ios/Naya.xcodeproj` → `../src/native`
- **Android** : `android/app/src/main/jni/CMakeLists.txt` → `../../../../../src/native`

## 🚀 Installation

### Prérequis

- React Native 0.80+
- Xcode (pour iOS)
- Android Studio (pour Android)
- Node.js 18+

### Installation

```bash
# Cloner le projet
git clone https://github.com/SIDIKICONDE/Naya.git
cd Naya

# Installer les dépendances
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## 📱 Utilisation

```typescript
import NativeModuleEQ from './specs/NativeModuleEQ';

// Inverser une chaîne
const reversed = await NativeModuleEQ.reverseString('Hello');
console.log(reversed); // "olleH"

// Compter les caractères
const count = await NativeModuleEQ.countCharacters('Bonjour');
console.log(count); // 7

// Vérifier un palindrome
const isPal = await NativeModuleEQ.isPalindrome('radar');
console.log(isPal); // true

// Générer un nombre aléatoire
const random = await NativeModuleEQ.getRandomNumber(1, 100);
console.log(random); // 42

// Calculer une factorielle
const factorial = await NativeModuleEQ.calculateFactorial(5);
console.log(factorial); // 120
```

## 🎯 Avantages

### **Performance native** ⚡

- Code C++ optimisé
- Turbo Modules pour les performances maximales
- JSI (JavaScript Interface) pour la communication directe

### **Cross-platform** 📱

- **iOS** : Simulateur iPhone 16
- **Android** : Émulateur Pixel 7
- Code partagé sans duplication

### **Architecture moderne** 🏛️

- Turbo Modules (New Architecture)
- Code partagé entre plateformes
- Interface TypeScript type-safe

## 🔧 Configuration

### **iOS**

- Xcode project configuré
- CocoaPods pour les dépendances
- Header search paths configurés

### **Android**

- CMake pour la compilation C++
- JNI pour l'intégration native
- Gradle configuré

## 📊 Structure du projet

```
Naya/
├── src/
│   └── native/                    ← Code C++ partagé
│       ├── NativeModuleEQ.h
│       └── NativeModuleEQ.cpp
├── ios/
│   ├── Naya.xcodeproj/           ← Configuration iOS
│   └── NativeModuleEQProvider.*  ← Provider iOS
├── android/
│   └── app/src/main/jni/         ← Configuration Android
│       ├── CMakeLists.txt
│       └── OnLoad.cpp
├── specs/
│   └── NativeModuleEQ.ts         ← Interface TypeScript
└── App.tsx                       ← Interface de test
```

## 🎨 Interface de test

L'application inclut une interface moderne pour tester toutes les fonctionnalités :

- Zone de saisie texte
- Zone de saisie nombre
- Boutons pour chaque fonctionnalité
- Affichage des résultats en temps réel
- Design responsive et moderne

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- React Native Team pour les Turbo Modules
- La communauté React Native
- Tous les contributeurs

---

**Développé avec ❤️ par SIDIKICONDE**

⭐ **N'oubliez pas de donner une étoile si ce projet vous a aidé !**
