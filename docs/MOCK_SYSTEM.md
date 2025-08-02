# 🎛️ Système de Mock Audio - Guide d'utilisation

## 📋 Vue d'ensemble

Le système de mock permet de développer et tester l'interface audio sans avoir besoin du module natif C++. Il simule toutes les fonctionnalités avec des données réalistes.

## 🔧 Configuration

### Activation/Désactivation des mocks

```typescript
// src/config/audio.config.ts
export const AUDIO_CONFIG = {
  USE_MOCK: true,  // true = mock, false = module natif
  // ...
};
```

### Configuration automatique
- **Développement** (`__DEV__ = true`) : Mocks activés par défaut
- **Production** (`__DEV__ = false`) : Module natif utilisé

## 🎭 Fonctionnalités simulées

### ✅ Modules audio
- ✅ Égaliseur paramétrique avec 8 bandes
- ✅ Compresseur avec tous les paramètres
- ✅ Réverbération avec simulation réaliste
- ✅ Tous les autres types de modules

### ✅ Métriques en temps réel
- ✅ **Niveaux audio** : Peak, RMS, LUFS, True Peak
- ✅ **Analyse stéréo** : Corrélation, phase, largeur
- ✅ **Performance** : CPU, mémoire, latence
- ✅ **Dynamique** : Facteur de crête, plage dynamique

### ✅ Données musicales réalistes
- 🥁 **Simulation de batterie** : Kick, snare avec patterns rythmiques
- 🎸 **Instruments** : Basse, mélodie avec modulation
- 📊 **Spectre audio** : Distribution fréquentielle réaliste
- 🎵 **Patterns musicaux** : 120 BPM, mesure 4/4

## 🚀 Utilisation

### Démarrage automatique
```typescript
// L'interface utilise automatiquement les mocks
import { audioInterface } from './audio/AudioInterface';

await audioInterface.initialize();
await audioInterface.startProcessing(); // ← Démarre la simulation
```

### Contrôle manuel des données
```typescript
import { mockDataGenerator } from './native/MockDataGenerator';

// Démarrer la génération de données
mockDataGenerator.start();

// Obtenir des métriques audio simulées
const levelData = mockDataGenerator.generateLevelData();

// Obtenir un spectre audio simulé
const spectrumData = mockDataGenerator.generateSpectrumData(2048);

// Arrêter la génération
mockDataGenerator.stop();
```

## 📊 Types de données générées

### Niveaux audio (dBFS)
```typescript
interface MockLevelData {
  peak: { left: number; right: number };     // -60 à 0 dBFS
  rms: { left: number; right: number };      // -60 à -6 dBFS  
  lufs: {                                    // Loudness standards
    momentary: number;    // -60 à 0 LUFS
    shortTerm: number;    // -60 à 0 LUFS  
    integrated: number;   // -60 à 0 LUFS
    range: number;        // 0 à 20 LU
  };
  truePeak: { left: number; right: number }; // Peak + overshoot
  correlation: number;    // -1 à +1 (stéréo)
  phase: number;         // -180° à +180°
  crestFactor: number;   // 0 à 20 dB
  dynamicRange: number;  // 0 à 30 dB
}
```

### Analyse spectrale
```typescript
interface MockSpectrumData {
  frequencies: Float32Array;  // 20 Hz à 24 kHz
  magnitudes: Float32Array;   // -80 à 0 dBFS
  timestamp: number;          // Horodatage
}
```

## 🎼 Simulation musicale

### Patterns rythmiques
- **Kick** : Temps 1 et 3 (4/4)
- **Snare** : Temps 2 et 4 
- **Basse** : Continue avec variations
- **Mélodie** : Phrases de 8 mesures avec pauses

### Caractéristiques fréquentielles
- **20-200 Hz** : Kick (40-80 Hz) + Basse (80-200 Hz)
- **200-2000 Hz** : Snare + Voix/Instruments
- **2-20 kHz** : Cymbales + Harmoniques

### Dynamique audio
- **Kick** : -5 dB peak, decay rapide
- **Snare** : -8 dB peak, attaque vive
- **Basse** : -15 dB moyen, modulation lente
- **Mélodie** : -18 dB moyen, vibrato 6 Hz

## 🔄 Transition vers la production

### 1. Désactiver les mocks
```typescript
// src/config/audio.config.ts
export const AUDIO_CONFIG = {
  USE_MOCK: false,  // ← Utiliser le module natif
};
```

### 2. Activer le module natif
```typescript
// src/audio/AudioInterface.ts
import AudioEngineNative from '../../specs/NativeAudioEngine'; // ← Décommenter

const AudioEngineNative = AUDIO_CONFIG.USE_MOCK 
  ? AudioEngineNativeMock 
  : AudioEngineNative; // ← Utiliser le vrai module
```

### 3. Tester la transition
- Vérifier que toutes les méthodes existent
- Tester les formats de données
- Valider les performances

## 🐛 Debug et logging

### Activer les logs détaillés
```typescript
// src/config/audio.config.ts
export const AUDIO_CONFIG = {
  LOG_AUDIO_EVENTS: true,  // ← Logs détaillés
};
```

### Console de debug
```
[AudioEngineMock] Initialisation - 48000Hz, 512 samples, 2 canaux
[AudioInterface] Initialisation avec MOCK
[MockDataGenerator] Démarrage de la génération de données simulées
[AudioEngineMock] Module PARAMETRIC_EQ créé avec l'ID: mock_module_1
```

## ⚡ Performance

### Optimisations des mocks
- Génération de données à 60 FPS max
- Utilisation de `requestAnimationFrame`
- Patterns audio pré-calculés
- Mémoire limitée pour l'historique

### Surveillance
```typescript
// Vérifier l'utilisation CPU du mock
const metrics = audioInterface.getPerformanceMetrics();
console.log(`CPU Mock: ${metrics.cpuUsage}%`); // Doit être < 5%
```

## 📝 Exemples d'utilisation

### Test d'égaliseur
```typescript
const eqId = audioInterface.createModule(ModuleType.PARAMETRIC_EQ);
const eq = audioInterface.getModule(eqId);

// Boost dans les aigus
eq?.setParameter('band4_frequency', 8000);
eq?.setParameter('band4_gain', 6);
eq?.setParameter('band4_q', 1.2);

// Les visualiseurs montreront l'effet immédiatement
```

### Test de compresseur  
```typescript
const compId = audioInterface.createModule(ModuleType.COMPRESSOR);
const comp = audioInterface.getModule(compId);

// Compression agressive
comp?.setParameter('threshold', -18);
comp?.setParameter('ratio', 8);
comp?.setParameter('attack', 1);

// Voir l'effet sur la dynamique en temps réel
```

---

Le système de mock offre une expérience de développement complète et réaliste ! 🎉