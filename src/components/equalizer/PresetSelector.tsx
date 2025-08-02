/**
 * PresetSelector.tsx
 * Composant pour sélectionner et appliquer des presets d'égaliseur
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { PresetItem, DEFAULT_PRESETS } from './types';
import { useAudioTheme } from '../../theme/hooks/useAudioTheme';

interface PresetSelectorProps {
  currentPreset?: string;
  onPresetSelected: (preset: PresetItem) => void;
  onSavePreset?: () => void;
  onResetToFlat: () => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  currentPreset,
  onPresetSelected,
  onSavePreset,
  onResetToFlat,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [presets] = useState<PresetItem[]>(DEFAULT_PRESETS);
  const audioTheme = useAudioTheme();
  const themedStyles = createStyles(audioTheme);

  const handlePresetSelect = (preset: PresetItem) => {
    onPresetSelected(preset);
    setModalVisible(false);
  };

  const handleSavePreset = () => {
    Alert.alert(
      'Sauvegarder le preset',
      'Voulez-vous sauvegarder la configuration actuelle comme nouveau preset ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Sauvegarder', 
          onPress: () => {
            onSavePreset?.();
            Alert.alert('Succès', 'Preset sauvegardé !');
          }
        },
      ]
    );
  };

  const getCurveColor = (gain: number) => {
    if (gain > 0) return audioTheme.colors.rmsNormal;
    if (gain < 0) return audioTheme.colors.rmsAlert;
    return audioTheme.colors.moduleBackground;
  };

  const renderPresetItem = ({ item }: { item: PresetItem }) => (
    <TouchableOpacity
      style={[
        themedStyles.presetItem,
        currentPreset === item.id && themedStyles.presetItemSelected
      ]}
      onPress={() => handlePresetSelect(item)}
    >
      <View style={themedStyles.presetInfo}>
        <Text style={[
          themedStyles.presetName,
          currentPreset === item.id && themedStyles.presetNameSelected
        ]}>
          {item.name}
        </Text>
        <Text style={[
          themedStyles.presetDescription,
          currentPreset === item.id && themedStyles.presetDescriptionSelected
        ]}>
          {item.description}
        </Text>
      </View>
      
      {/* Aperçu visuel de la courbe */}
      <View style={themedStyles.presetCurve}>
        {item.bands.map((gain, index) => (
          <View
            key={index}
            style={[
              themedStyles.curveBand,
              {
                height: Math.max(2, Math.abs(gain) * 2 + 2),
                backgroundColor: getCurveColor(gain),
                marginTop: gain < 0 ? 20 - Math.abs(gain) * 2 : 20 - gain * 2,
              }
            ]}
          />
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>Presets</Text>
      
      <View style={themedStyles.buttonsRow}>
        {/* Bouton de sélection de preset */}
        <TouchableOpacity
          style={themedStyles.presetButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={themedStyles.presetButtonText}>
            {currentPreset ? 
              presets.find(p => p.id === currentPreset)?.name || 'Personnalisé' 
              : 'Sélectionner'
            }
          </Text>
        </TouchableOpacity>

        {/* Bouton Reset */}
        <TouchableOpacity
          style={themedStyles.resetButton}
          onPress={onResetToFlat}
        >
          <Text style={themedStyles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        {/* Bouton Sauvegarder */}
        {onSavePreset && (
          <TouchableOpacity
            style={themedStyles.saveButton}
            onPress={handleSavePreset}
          >
            <Text style={themedStyles.saveButtonText}>Sauver</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de sélection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalContent}>
            <View style={themedStyles.modalHeader}>
              <Text style={themedStyles.modalTitle}>Sélectionner un Preset</Text>
              <TouchableOpacity
                style={themedStyles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={themedStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={presets}
              renderItem={renderPresetItem}
              keyExtractor={(item) => item.id}
              style={themedStyles.presetsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (audioTheme: ReturnType<typeof useAudioTheme>) => StyleSheet.create({
  container: {
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.md,
    padding: audioTheme.spacing.md,
    marginHorizontal: audioTheme.spacing.md,
    marginVertical: audioTheme.spacing.sm,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: audioTheme.typography.moduleTitle.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
    color: audioTheme.colors.text,
    marginBottom: audioTheme.spacing.md,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: audioTheme.spacing.sm,
  },
  presetButton: {
    flex: 1,
    backgroundColor: audioTheme.colors.rmsNormal,
    paddingVertical: audioTheme.spacing.sm,
    paddingHorizontal: audioTheme.spacing.md,
    borderRadius: audioTheme.spacing.sm,
    alignItems: 'center',
  },
  presetButtonText: {
    color: '#FFFFFF',
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
  },
  resetButton: {
    backgroundColor: audioTheme.colors.rmsAlert,
    paddingVertical: audioTheme.spacing.sm,
    paddingHorizontal: audioTheme.spacing.md,
    borderRadius: audioTheme.spacing.sm,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
  },
  saveButton: {
    backgroundColor: audioTheme.colors.rmsNormal,
    paddingVertical: audioTheme.spacing.sm,
    paddingHorizontal: audioTheme.spacing.md,
    borderRadius: audioTheme.spacing.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.lg,
    padding: audioTheme.spacing.lg,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: audioTheme.spacing.lg,
  },
  modalTitle: {
    fontSize: audioTheme.typography.moduleTitle.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
    color: audioTheme.colors.text,
  },
  closeButton: {
    padding: audioTheme.spacing.xs,
  },
  closeButtonText: {
    fontSize: audioTheme.typography.moduleTitle.fontSize,
    color: audioTheme.colors.text,
    opacity: 0.7,
  },
  presetsList: {
    maxHeight: 400,
  },
  presetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: audioTheme.spacing.md,
    paddingHorizontal: audioTheme.spacing.sm,
    marginVertical: audioTheme.spacing.xs,
    borderRadius: audioTheme.spacing.sm,
    backgroundColor: audioTheme.colors.moduleBackground,
  },
  presetItemSelected: {
    backgroundColor: audioTheme.colors.moduleBackground,
    borderWidth: 2,
    borderColor: audioTheme.colors.rmsNormal,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: audioTheme.typography.moduleTitle.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
    color: audioTheme.colors.text,
  },
  presetNameSelected: {
    color: audioTheme.colors.rmsNormal,
  },
  presetDescription: {
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    color: audioTheme.colors.text,
    opacity: 0.7,
    marginTop: audioTheme.spacing.xs,
  },
  presetDescriptionSelected: {
    color: audioTheme.colors.rmsNormal,
    opacity: 0.9,
  },
  presetCurve: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: 80,
    height: 40,
    marginLeft: audioTheme.spacing.sm,
  },
  curveBand: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 1,
  },
});