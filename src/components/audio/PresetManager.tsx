/**
 * Gestionnaire de presets audio refactorisé
 * Architecture modulaire avec composants séparés
 */

import React, { useState } from 'react';
import { View, StyleSheet, Modal, FlatList } from 'react-native';
import { useAudioTheme } from '../../theme/hooks/useAudioTheme';
import { 
  Header, 
  Actions, 
  Categories, 
  PresetCard, 
  SaveModal, 
  EmptyState 
} from './PresetManager/components';
import { usePresets } from './PresetManager/hooks/usePresets';
import { PRESET_CATEGORIES, MODAL_CONFIG } from './PresetManager/constants';
import type { PresetManagerProps } from './PresetManager/types';
import { SoundManager } from './mobile';

export const PresetManager: React.FC<PresetManagerProps> = ({
  onClose,
  onLoadPreset,
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const {
    presets,
    selectedCategory,
    setSelectedCategory,
    loading,
    savePreset,
    deletePreset,
  } = usePresets();
  
  const audioTheme = useAudioTheme();

  const handleLoadPreset = (presetId: string) => {
    onLoadPreset(presetId);
    onClose();
  };

  const handleSavePreset = async (name: string, category: string) => {
    const success = await savePreset(name, category);
    if (success) {
      setShowSaveModal(false);
    }
  };

  const handleDeletePreset = async (presetId: string, presetName: string) => {
    try {
      await deletePreset(presetId, presetName);
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const themedStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: MODAL_CONFIG.padding,
    },
    container: {
      width: '95%',
      maxWidth: MODAL_CONFIG.maxWidth,
      maxHeight: `${MODAL_CONFIG.maxHeight * 100}%`,
      backgroundColor: audioTheme.colors.knobBackground,
      borderRadius: MODAL_CONFIG.borderRadius,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    audioControlsSection: {
      backgroundColor: audioTheme.colors.sliderTrack,
      marginHorizontal: audioTheme.spacing.md,
      marginVertical: audioTheme.spacing.sm,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: audioTheme.colors.buttonInactive,
    },
  });

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={themedStyles.modalOverlay}>
        <View style={themedStyles.container}>
          <Header 
            title="🎛️ Gestionnaire de Presets" 
            onClose={onClose} 
          />

          <Actions 
            onSave={() => setShowSaveModal(true)}
            onImport={() => {/* Fonctionnalité à venir */}}
          />

          <Categories 
            categories={PRESET_CATEGORIES}
            selectedCategory={selectedCategory}
            onCategorySelect={(category) => setSelectedCategory(category)}
          />

          {/* Contrôles audio intégrés */}
          <View style={themedStyles.audioControlsSection}>
            <SoundManager 
              compact={true}
              showVolumeControl={true}
              enableHapticFeedback={true}
            />
          </View>

          <FlatList
            data={presets}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.presetList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PresetCard
                preset={item}
                onLoad={() => handleLoadPreset(item.id)}
                onDelete={() => handleDeletePreset(item.id, item.name)}
              />
            )}
            ListEmptyComponent={<EmptyState />}
          />

          <SaveModal
            visible={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSavePreset}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: MODAL_CONFIG.padding,
  },
  container: {
    width: '95%',
    maxWidth: MODAL_CONFIG.maxWidth,
    maxHeight: `${MODAL_CONFIG.maxHeight * 100}%`,
    backgroundColor: '#141414',
    borderRadius: MODAL_CONFIG.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  presetList: {
    padding: 12,
    gap: 6,
  },
  audioControlsSection: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
});