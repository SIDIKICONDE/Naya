/**
 * Section des presets du compresseur
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, ScrollView } from 'react-native';
import { COMPRESSOR_PRESETS } from '../constants';
import { useAudioTheme, useModuleColors } from '../../../../../theme/hooks/useAudioTheme';
import type { CompressorPreset } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CompressorPresetsProps {
  onApplyPreset: (preset: CompressorPreset) => void;
  visible: boolean;
  onClose: () => void;
}

export const CompressorPresets: React.FC<CompressorPresetsProps> = ({ 
  onApplyPreset, 
  visible, 
  onClose 
}) => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('compressor');
  
  // Styles thématiques
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: audioTheme.colors.knobBackground,
      borderRadius: 12,
      margin: audioTheme.spacing.md,
      maxHeight: screenHeight * 0.8,
      width: screenWidth - 40,
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: audioTheme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: audioTheme.colors.sliderTrack,
    },
    modalTitle: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
    },
    closeButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: audioTheme.colors.buttonInactive,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    closeButtonText: {
      color: audioTheme.colors.spectrumPrimary,
      fontSize: 12,
      fontWeight: 'bold' as const,
    },
    scrollContainer: {
      maxHeight: screenHeight * 0.6,
    },
    masonryContainer: {
      flexDirection: 'row',
      padding: audioTheme.spacing.md,
      paddingTop: audioTheme.spacing.sm,
    },
    masonryColumn: {
      flex: 1,
      paddingHorizontal: audioTheme.spacing.sm,
    },
    presetButton: {
      backgroundColor: audioTheme.colors.buttonInactive,
      borderRadius: 10,
      padding: audioTheme.spacing.sm,
      marginBottom: audioTheme.spacing.sm,
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
      borderLeftWidth: 4,
      borderLeftColor: moduleColors.primary,
      shadowColor: moduleColors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    presetButtonText: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
      marginBottom: 4,
      textAlign: 'left',
    },
    presetDescription: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.spectrumSecondary,
      lineHeight: 14,
      marginBottom: 3,
      fontStyle: 'italic',
    },
    presetParams: {
      marginTop: 3,
      paddingTop: 3,
      borderTopWidth: 1,
      borderTopColor: audioTheme.colors.sliderTrack,
    },
    paramText: {
      ...audioTheme.typography.valueDisplay,
      color: audioTheme.colors.buttonInactive,
      fontSize: 10,
      textAlign: 'left',
      marginBottom: 0,
    },
  });

  const handlePresetSelect = (preset: CompressorPreset) => {
    onApplyPreset(preset);
    onClose(); // Fermer la modal après sélection
  };

  // Fonction pour créer les colonnes masonry
  const createMasonryLayout = () => {
    const columnCount = 2;
    const columns: CompressorPreset[][] = Array.from({ length: columnCount }, () => []);
    
    // Distribuer les presets dans les colonnes de manière équilibrée
    COMPRESSOR_PRESETS.forEach((preset, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(preset);
    });
    
    return columns;
  };

  const masonryColumns = createMasonryLayout();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header de la modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎛️ Presets Professionnels</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Layout masonry des presets */}
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.masonryContainer}>
              {masonryColumns.map((column, columnIndex) => (
                <View key={columnIndex} style={styles.masonryColumn}>
                  {column.map((preset) => (
                    <TouchableOpacity
                      key={preset.name}
                      style={styles.presetButton}
                      onPress={() => handlePresetSelect(preset)}
                    >
                      <Text style={styles.presetButtonText}>{preset.name}</Text>
                      <Text style={styles.presetDescription}>{preset.description}</Text>
                      
                      {/* Paramètres techniques du preset */}
                      <View style={styles.presetParams}>
                        <Text style={styles.paramText}>Seuil: {preset.threshold}dB</Text>
                        <Text style={styles.paramText}>Ratio: {preset.ratio}:1</Text>
                        <Text style={styles.paramText}>Attaque: {preset.attack}ms</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};