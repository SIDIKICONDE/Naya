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

  const renderPresetItem = ({ item }: { item: PresetItem }) => (
    <TouchableOpacity
      style={[
        styles.presetItem,
        currentPreset === item.id && styles.presetItemSelected
      ]}
      onPress={() => handlePresetSelect(item)}
    >
      <View style={styles.presetInfo}>
        <Text style={[
          styles.presetName,
          currentPreset === item.id && styles.presetNameSelected
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.presetDescription,
          currentPreset === item.id && styles.presetDescriptionSelected
        ]}>
          {item.description}
        </Text>
      </View>
      
      {/* Aperçu visuel de la courbe */}
      <View style={styles.presetCurve}>
        {item.bands.map((gain, index) => (
          <View
            key={index}
            style={[
              styles.curveBand,
              {
                height: Math.max(2, Math.abs(gain) * 2 + 2),
                backgroundColor: gain > 0 ? '#4CAF50' : gain < 0 ? '#FF5722' : '#E0E0E0',
                marginTop: gain < 0 ? 20 - Math.abs(gain) * 2 : 20 - gain * 2,
              }
            ]}
          />
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presets</Text>
      
      <View style={styles.buttonsRow}>
        {/* Bouton de sélection de preset */}
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.presetButtonText}>
            {currentPreset ? 
              presets.find(p => p.id === currentPreset)?.name || 'Personnalisé' 
              : 'Sélectionner'
            }
          </Text>
        </TouchableOpacity>

        {/* Bouton Reset */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onResetToFlat}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        {/* Bouton Sauvegarder */}
        {onSavePreset && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePreset}
          >
            <Text style={styles.saveButtonText}>Sauver</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner un Preset</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={presets}
              renderItem={renderPresetItem}
              keyExtractor={(item) => item.id}
              style={styles.presetsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  presetsList: {
    maxHeight: 400,
  },
  presetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  presetItemSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  presetNameSelected: {
    color: '#2196F3',
  },
  presetDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  presetDescriptionSelected: {
    color: '#1976D2',
  },
  presetCurve: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: 80,
    height: 40,
    marginLeft: 12,
  },
  curveBand: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 1,
  },
});