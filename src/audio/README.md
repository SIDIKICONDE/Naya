# Architecture Audio Modulaire

## 📁 Structure des fichiers

```
src/audio/
├── index.ts                      # Point d'entrée principal
├── AudioInterface.ts             # Interface principale (re-exports)
├── AudioInterface.refactored.ts  # Implémentation principale
├── AudioModuleWrapper.ts         # Wrapper pour modules natifs
├── types.ts                      # Types et interfaces
├── enums.ts                      # Énumérations
├── moduleParameters.ts           # Définitions des paramètres
└── README.md                     # Cette documentation
```

## 🎛️ Modules disponibles

### **Égalisation**
- `PARAMETRIC_EQ` - Égaliseur paramétrique 8 bandes
- `GRAPHIC_EQ` - Égaliseur graphique 
- `MULTIBAND_EQ` - Égaliseur multibande

### **Dynamique** 
- `COMPRESSOR` - Compresseur professionnel (45+ paramètres)
- `LIMITER` - Limiteur
- `GATE` - Gate/Expander
- `MULTIBAND_COMPRESSOR` - Compresseur multibande
- `DE_ESSER` - De-esser

### **Effets**
- `REVERB` - Réverbération
- `DELAY` - Delay/Echo
- `CHORUS` - Chorus
- `FLANGER` - Flanger
- `PHASER` - Phaser
- `DISTORTION` - Distorsion
- `PITCH_SHIFTER` - Changement de hauteur
- `HARMONIZER` - Harmoniseur

### **Analyse**
- `OSCILLOSCOPE` - Oscilloscope
- `LEVEL_METER` - Indicateur de niveau
- `NOISE_REDUCER` - Réducteur de bruit (33+ paramètres)
- `STEREO_ENHANCER` - Élargisseur stéréo

## 🚀 Utilisation

### Import simple
```typescript
import { audioInterface, ModuleType } from './audio';
```

### Créer un module
```typescript
// Créer un compresseur
const compressorId = audioInterface.createModule(ModuleType.COMPRESSOR);

// Créer un EQ
const eqId = audioInterface.createModule(ModuleType.PARAMETRIC_EQ);
```

### Configurer les paramètres
```typescript
const module = audioInterface.getModule(compressorId);
if (module) {
  module.setParameter('threshold', -18);
  module.setParameter('ratio', 6);
  module.setParameter('attack', 5);
  module.setParameter('release', 150);
}
```

### Connecter des modules
```typescript
audioInterface.connectModules(eqId, compressorId);
```

## 🎯 Paramètres du Compresseur

Le compresseur dispose de **45+ paramètres professionnels** :

### Contrôles principaux
- `threshold` - Seuil de déclenchement (-60 à 0 dB)
- `ratio` - Ratio de compression (1:1 à 100:1)
- `attack` - Temps d'attaque (0.01 à 500 ms)
- `release` - Temps de relâchement (1 à 5000 ms)
- `knee` - Courbe du knee (0 à 20 dB)
- `makeupGain` - Gain de compensation (-24 à +48 dB)

### Détection avancée
- `detectionMode` - Peak/RMS/Feedback/Feedforward
- `lookahead` - Anticipation (0 à 50 ms)
- `stereoLink` - Liaison stéréo
- `rmsWindow` - Fenêtre RMS

### Sidechain
- `sidechainEnabled` - Activation sidechain
- `sidechainHPF/LPF` - Filtres sidechain
- `sidechainListen` - Écoute sidechain
- `sidechainGain` - Gain sidechain

### Caractère et couleur
- `saturation` - Saturation (0-100%)
- `saturationType` - Type (Tube/Tape/Transistor/Digital)
- `warmth` - Chaleur
- `punch` - Punch

### Modes vintage
- `vintageMode` - 1176/LA2A/Fairchild/SSL
- `oversampling` - Suréchantillonnage
- `antiAliasing` - Anti-aliasing

## 🎚️ Paramètres du Noise Reducer

Le réducteur de bruit dispose de **33+ paramètres** :

### Détection automatique
- `autoDetection` - Détection automatique
- `autoThreshold` - Seuil automatique
- `adaptiveMode` - Mode adaptatif
- `learningTime` - Temps d'apprentissage
- `sensitivity` - Sensibilité

### Algorithmes IA
- `algorithm` - Spectral/Wiener/Neural/Hybrid/AI
- `qualityMode` - Rapide/Équilibré/Haute Qualité

### Préservation intelligente
- `musicPreservation` - Préservation musique
- `speechPreservation` - Préservation voix
- `transientPreservation` - Préservation transitoires

## 📊 Monitoring en temps réel

Tous les modules fournissent des métriques en temps réel :
- Niveaux d'entrée/sortie
- Réduction de gain appliquée
- Enveloppe de compression
- Détection de bruit
- Rapport signal/bruit

## 🔧 Configuration

L'interface utilise automatiquement le système mock pour le développement :

```typescript
// Initialiser l'interface audio
await audioInterface.initialize({
  sampleRate: 48000,
  bufferSize: 512,
  channels: 2
});
```

## 🎯 Points clés

- **Architecture modulaire** - Chaque composant dans son fichier
- **Type safety** - TypeScript complet
- **Paramètres professionnels** - Conformes aux standards pro
- **Mock intégré** - Fonctionne sans backend natif
- **Extensible** - Facile d'ajouter de nouveaux modules