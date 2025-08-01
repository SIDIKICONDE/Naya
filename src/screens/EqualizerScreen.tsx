/**
 * EqualizerScreen.tsx
 * Écran principal de l'égaliseur audio professionnel
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';

import {
  EqualizerPanel,
  AudioFileSelector,
  PresetSelector,
  DEFAULT_BANDS,
  DEFAULT_PRESETS,
  type EqualizerBandType,
  type AudioFileInfo,
  type PresetItem,
} from '../components/equalizer';

// Import du TurboModule (sera disponible après compilation)
// import AudioEqualizer from '../specs/AudioEqualizer';

export const EqualizerScreen: React.FC = () => {
  // État principal
  const [bands, setBands] = useState<EqualizerBandType[]>(DEFAULT_BANDS);
  const [equalizerEnabled, setEqualizerEnabled] = useState(true);
  const [currentFile, setCurrentFile] = useState<AudioFileInfo | undefined>();
  const [currentPreset, setCurrentPreset] = useState<string>('flat');
  const [loading, setLoading] = useState(false);

  // Gestion des changements de bandes
  const handleBandChange = useCallback(async (bandIndex: number, gain: number) => {
    try {
      // Mise à jour locale immédiate pour la réactivité
      setBands(prevBands => 
        prevBands.map((band, index) => 
          index === bandIndex ? { ...band, gain } : band
        )
      );

      // TODO: Appel au TurboModule
      // const result = await AudioEqualizer.setBandGain(bandIndex, gain);
      // if (!result.success) {
      //   console.warn('Erreur setBandGain:', result.message);
      // }

      console.log(`Bande ${bandIndex} (${bands[bandIndex].frequency}Hz): ${gain}dB`);

    } catch (error) {
      console.error('Erreur lors du changement de bande:', error);
      Alert.alert('Erreur', 'Impossible de modifier la bande de fréquence');
    }
  }, [bands]);

  // Activation/désactivation de l'égaliseur
  const handleToggleEqualizer = useCallback(async (enabled: boolean) => {
    try {
      setEqualizerEnabled(enabled);

      // TODO: Appel au TurboModule
      // const result = await AudioEqualizer.setEffectEnabled('equalizer', enabled);
      // if (!result.success) {
      //   console.warn('Erreur toggle equalizer:', result.message);
      // }

      console.log('Égaliseur', enabled ? 'activé' : 'désactivé');

    } catch (error) {
      console.error('Erreur lors du toggle:', error);
      Alert.alert('Erreur', 'Impossible de modifier l\'état de l\'égaliseur');
    }
  }, []);

  // Chargement de fichier audio
  const handleFileSelected = useCallback(async (filePath: string) => {
    try {
      setLoading(true);
      console.log('Chargement du fichier:', filePath);

      // TODO: Appel au TurboModule
      // const fileInfo = await AudioEqualizer.loadAudioFile(filePath);
      // if (fileInfo && fileInfo.name) {
      //   setCurrentFile(fileInfo);
      //   console.log('Fichier chargé:', fileInfo);
      // } else {
      //   throw new Error('Fichier invalide');
      // }

      // Simulation pour le développement UI
      const mockFileInfo: AudioFileInfo = {
        path: filePath,
        name: filePath.split('/').pop() || 'audio.mp3',
        duration: 180, // 3 minutes
        sampleRate: 44100,
        channels: 2,
        size: 5242880, // 5MB
      };
      
      setCurrentFile(mockFileInfo);
      console.log('Fichier simulé chargé:', mockFileInfo);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger le fichier audio');
    } finally {
      setLoading(false);
    }
  }, []);

  // Application d'un preset
  const handlePresetSelected = useCallback(async (preset: PresetItem) => {
    try {
      console.log('Application du preset:', preset.name);

      // Mise à jour des bandes avec les valeurs du preset
      const newBands = bands.map((band, index) => ({
        ...band,
        gain: preset.bands[index] || 0,
      }));

      setBands(newBands);
      setCurrentPreset(preset.id);

      // TODO: Appel au TurboModule pour chaque bande
      // for (let i = 0; i < preset.bands.length; i++) {
      //   await AudioEqualizer.setBandGain(i, preset.bands[i]);
      // }

      console.log('Preset appliqué:', preset.bands);

    } catch (error) {
      console.error('Erreur lors de l\'application du preset:', error);
      Alert.alert('Erreur', 'Impossible d\'appliquer le preset');
    }
  }, [bands]);

  // Reset à plat
  const handleResetToFlat = useCallback(async () => {
    try {
      console.log('Reset de l\'égaliseur');

      // TODO: Appel au TurboModule
      // const result = await AudioEqualizer.resetEqualizer();
      // if (!result.success) {
      //   console.warn('Erreur reset:', result.message);
      // }

      // Mise à jour locale
      setBands(DEFAULT_BANDS);
      setCurrentPreset('flat');

      console.log('Égaliseur remis à plat');

    } catch (error) {
      console.error('Erreur lors du reset:', error);
      Alert.alert('Erreur', 'Impossible de remettre à zéro l\'égaliseur');
    }
  }, []);

  // Sauvegarde de preset (placeholder)
  const handleSavePreset = useCallback(() => {
    console.log('Sauvegarde du preset personnalisé:', bands.map(b => b.gain));
    // TODO: Implémenter la sauvegarde persistante
  }, [bands]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Sélecteur de fichier audio */}
        <AudioFileSelector
          currentFile={currentFile}
          onFileSelected={handleFileSelected}
          loading={loading}
        />

        {/* Sélecteur de presets */}
        <PresetSelector
          currentPreset={currentPreset}
          onPresetSelected={handlePresetSelected}
          onSavePreset={handleSavePreset}
          onResetToFlat={handleResetToFlat}
        />

        {/* Panneau principal de l'égaliseur */}
        <EqualizerPanel
          bands={bands}
          enabled={equalizerEnabled}
          onBandChange={handleBandChange}
          onToggleEnabled={handleToggleEqualizer}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollView: {
    flex: 1,
  },
});