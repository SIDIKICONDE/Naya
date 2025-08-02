/**
 * Hook personnalisé pour la gestion des presets
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { audioInterface } from '../../../../audio/AudioInterface';
import type { PresetItem, PresetCategory } from '../types';

export const usePresets = () => {
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('All');
  const [loading, setLoading] = useState(false);

  const loadPresets = useCallback(async () => {
    setLoading(true);
    try {
      const presetList = audioInterface.listPresets();
      setPresets(presetList as PresetItem[]);
    } catch (error) {
      console.error('Erreur chargement presets:', error);
      Alert.alert('Erreur', 'Impossible de charger les presets');
    } finally {
      setLoading(false);
    }
  }, []);

  const savePreset = useCallback(async (name: string, category: string) => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour le preset');
      return false;
    }

    try {
      const presetId = audioInterface.savePreset(name, category);
      Alert.alert('Succès', 'Preset sauvegardé avec succès');
      await loadPresets();
      return true;
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le preset');
      return false;
    }
  }, [loadPresets]);

  const deletePreset = useCallback(async (presetId: string, presetName: string) => {
    return new Promise<void>((resolve, reject) => {
      Alert.alert(
        'Confirmer la suppression',
        `Voulez-vous vraiment supprimer le preset "${presetName}" ?`,
        [
          { 
            text: 'Annuler', 
            style: 'cancel',
            onPress: () => reject(new Error('Cancelled'))
          },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                (audioInterface as any).deletePreset(presetId);
                await loadPresets();
                resolve();
              } catch (error) {
                Alert.alert('Erreur', 'Impossible de supprimer le preset');
                reject(error);
              }
            },
          },
        ]
      );
    });
  }, [loadPresets]);

  const filteredPresets = selectedCategory === 'All' 
    ? presets 
    : presets.filter(p => p.category === selectedCategory);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  return {
    presets: filteredPresets,
    selectedCategory,
    setSelectedCategory,
    loading,
    savePreset,
    deletePreset,
    refreshPresets: loadPresets,
  };
};