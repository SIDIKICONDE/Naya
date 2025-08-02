# 🎙️ Module d'Enregistrement Audio - Guide d'utilisation

## 📋 Vue d'ensemble

Le module `NativeAudioRecorder` est un TurboModule React Native permettant d'enregistrer de l'audio avec une performance native optimale. Il est implémenté en C++ pur et fonctionne sur iOS et Android.

## 🚀 Utilisation de base

### Import du module

```typescript
import NativeAudioRecorder from '../specs/NativeAudioRecorder';
```

### Configuration initiale

```typescript
import NativeAudioRecorder from '../specs/NativeAudioRecorder';
import { AudioPresets } from '../constants/AudioPresets';

// Utiliser un preset prédéfini (RECOMMANDÉ)
const initialized = NativeAudioRecorder.initialize(AudioPresets.StudioMax);

// OU configuration manuelle
const customConfig = {
  sampleRate: 192000,    // Jusqu'à 384kHz supporté
  channels: 2,           // 1-8 canaux supportés
  bitDepth: 32,          // 16, 24, ou 32 bits
  bufferSize: 8192       // Taille du buffer en échantillons
};

const initialized = NativeAudioRecorder.initialize(customConfig);
if (!initialized) {
  console.error('Échec de l\'initialisation');
}
```

### Presets disponibles

```typescript
// Pour différents cas d'usage
NativeAudioRecorder.initialize(AudioPresets.Voice);        // 16kHz/16bit mono
NativeAudioRecorder.initialize(AudioPresets.CD);           // 44.1kHz/16bit stéréo
NativeAudioRecorder.initialize(AudioPresets.Studio);       // 48kHz/24bit stéréo
NativeAudioRecorder.initialize(AudioPresets.HiRes);        // 96kHz/24bit stéréo
NativeAudioRecorder.initialize(AudioPresets.StudioMax);    // 192kHz/32bit stéréo
NativeAudioRecorder.initialize(AudioPresets.DXD);          // 352.8kHz/32bit stéréo
NativeAudioRecorder.initialize(AudioPresets.Surround51);   // 48kHz/24bit 5.1
NativeAudioRecorder.initialize(AudioPresets.Surround71HiRes); // 96kHz/32bit 7.1
```

### Démarrer un enregistrement

```typescript
// Spécifier le chemin de sortie
const outputPath = `${RNFS.DocumentDirectoryPath}/recording_${Date.now()}.wav`;

// Démarrer l'enregistrement
const started = NativeAudioRecorder.startRecording(outputPath);
if (started) {
  console.log('Enregistrement démarré');
}
```

### Contrôler l'enregistrement

```typescript
// Mettre en pause
NativeAudioRecorder.pauseRecording();

// Reprendre
NativeAudioRecorder.resumeRecording();

// Arrêter et récupérer le fichier
const filePath = NativeAudioRecorder.stopRecording();
console.log('Fichier enregistré:', filePath);
```

### Obtenir les statistiques en temps réel

```typescript
// Vérifier l'état
const isRecording = NativeAudioRecorder.isRecording();

// Obtenir les statistiques
const stats = NativeAudioRecorder.getRecordingStats();
console.log('Durée:', stats.duration, 'secondes');
console.log('Taille:', stats.size, 'octets');
console.log('Niveau du buffer:', stats.bufferLevel * 100, '%');

// Niveau audio instantané (0.0 à 1.0)
const level = NativeAudioRecorder.getAudioLevel();
```

## 📊 Exemple complet avec React

```tsx
import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import NativeAudioRecorder from '../specs/NativeAudioRecorder';
import RNFS from 'react-native-fs';

const AudioRecorderComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    // Initialiser au montage
    NativeAudioRecorder.initialize({
      sampleRate: 44100,
      channels: 2,
      bitDepth: 16,
      bufferSize: 4096
    });

    // Cleanup au démontage
    return () => {
      NativeAudioRecorder.cleanup();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        // Mettre à jour les statistiques
        const stats = NativeAudioRecorder.getRecordingStats();
        setRecordingTime(stats.duration);
        
        // Mettre à jour le niveau audio
        const level = NativeAudioRecorder.getAudioLevel();
        setAudioLevel(level);
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartStop = async () => {
    if (!isRecording) {
      // Démarrer
      const path = `${RNFS.DocumentDirectoryPath}/recording_${Date.now()}.wav`;
      const started = NativeAudioRecorder.startRecording(path);
      
      if (started) {
        setIsRecording(true);
      }
    } else {
      // Arrêter
      const filePath = NativeAudioRecorder.stopRecording();
      setIsRecording(false);
      
      console.log('Enregistrement sauvegardé:', filePath);
      
      // Réinitialiser les valeurs
      setRecordingTime(0);
      setAudioLevel(0);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button 
        title={isRecording ? "Arrêter" : "Enregistrer"}
        onPress={handleStartStop}
        color={isRecording ? "red" : "green"}
      />
      
      <Text>Temps: {recordingTime.toFixed(1)}s</Text>
      
      <View style={{
        height: 20,
        backgroundColor: '#eee',
        marginTop: 10
      }}>
        <View style={{
          height: '100%',
          width: `${audioLevel * 100}%`,
          backgroundColor: isRecording ? 'green' : 'gray'
        }} />
      </View>
    </View>
  );
};

export default AudioRecorderComponent;
```

## 🔧 Gestion avancée des buffers

### Récupérer les données audio brutes

```typescript
// Obtenir un buffer audio (peut être null si vide)
const buffer = NativeAudioRecorder.getAudioBuffer();

if (buffer) {
  console.log('Données audio:', buffer.data); // Array de nombres
  console.log('Timestamp:', new Date(buffer.timestamp));
  console.log('Durée:', buffer.duration, 'ms');
  
  // Traiter les données (ex: visualisation)
  processAudioData(buffer.data);
}
```

### Vider les buffers

```typescript
// Vider tous les buffers en attente
NativeAudioRecorder.clearBuffers();
```

## 📁 Formats supportés

```typescript
// Obtenir la liste des formats supportés
const formats = NativeAudioRecorder.getSupportedFormats();
console.log('Formats:', formats); // ["wav", "pcm"]
```

## ⚡ Performance et bonnes pratiques

### 1. Configuration optimale

```typescript
// SIMPLE : Utiliser les presets
import { AudioPresets } from '../constants/AudioPresets';

// Pour de la voix/podcasts
NativeAudioRecorder.initialize(AudioPresets.Voice);

// Pour de la musique amateur
NativeAudioRecorder.initialize(AudioPresets.Studio);

// Pour de l'enregistrement professionnel
NativeAudioRecorder.initialize(AudioPresets.StudioMax);

// Pour du mastering ultra haute qualité
NativeAudioRecorder.initialize(AudioPresets.DXD);

// AVANCÉ : Configuration manuelle
const ultraHiResConfig = {
  sampleRate: 384000,  // 384kHz - qualité extrême
  channels: 2,         // Stéréo
  bitDepth: 32,        // 32-bit float
  bufferSize: 16384    // Buffer large pour stabilité
};
```

### Comparaison des qualités

| Preset | Sample Rate | Bit Depth | Usage | Taille fichier/min |
|--------|-------------|-----------|-------|-------------------|
| Voice | 16 kHz | 16-bit | Voix, podcasts | ~2 MB |
| CD | 44.1 kHz | 16-bit | Musique standard | ~5 MB |
| Studio | 48 kHz | 24-bit | Production musicale | ~9 MB |
| HiRes | 96 kHz | 24-bit | Audiophile | ~17 MB |
| StudioMax | 192 kHz | 32-bit | Studio professionnel | ~46 MB |
| DXD | 352.8 kHz | 32-bit | Mastering | ~85 MB |

### 2. Gestion de la mémoire

```typescript
// Toujours nettoyer après utilisation
useEffect(() => {
  return () => {
    NativeAudioRecorder.cleanup();
  };
}, []);
```

### 3. Gestion des erreurs

```typescript
try {
  const started = NativeAudioRecorder.startRecording(path);
  if (!started) {
    Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
  }
} catch (error) {
  console.error('Erreur d\'enregistrement:', error);
}
```

## 🔍 Dépannage

### L'enregistrement ne démarre pas
- Vérifier les permissions audio
- S'assurer que le chemin de sortie est valide
- Vérifier qu'aucun autre enregistrement n'est en cours

### Qualité audio médiocre
- Augmenter le `sampleRate`
- Utiliser `bitDepth: 24` pour plus de précision
- Ajuster la taille du buffer selon les besoins

### Problèmes de performance
- Réduire le `sampleRate` si nécessaire
- Utiliser un seul canal (mono) si suffisant
- Augmenter la taille du buffer

## 🎯 Cas d'usage

### 1. Enregistrement vocal simple
```typescript
// Configuration minimale pour la voix
NativeAudioRecorder.initialize({
  sampleRate: 16000,
  channels: 1,
  bitDepth: 16,
  bufferSize: 2048
});
```

### 2. Enregistrement musical haute qualité
```typescript
// Configuration haute fidélité
NativeAudioRecorder.initialize({
  sampleRate: 48000,
  channels: 2,
  bitDepth: 24,
  bufferSize: 8192
});
```

### 3. Monitoring en temps réel
```typescript
// Visualisation du niveau audio
const monitorAudio = () => {
  const interval = setInterval(() => {
    const level = NativeAudioRecorder.getAudioLevel();
    updateVUMeter(level);
  }, 50); // 20 FPS
  
  return () => clearInterval(interval);
};
```

---

Ce module offre une solution performante et flexible pour l'enregistrement audio dans React Native, avec un contrôle précis sur la qualité et le format de sortie.