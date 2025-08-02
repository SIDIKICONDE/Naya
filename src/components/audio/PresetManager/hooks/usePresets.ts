/**
 * Hook personnalisé pour la gestion des presets
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { audioInterface } from '../../../../audio/AudioInterface';
import { useTranslation } from '../../../../i18n';
import type { PresetItem, PresetCategory } from '../types';

export const usePresets = () => {
  const { t } = useTranslation();
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
      Alert.alert('Erreur', t('audio:presetManager.errors.loadPresets'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const savePreset = useCallback(async (name: string, category: string) => {
    if (!name.trim()) {
      Alert.alert('Erreur', t('audio:presetManager.errors.emptyName'));
      return false;
    }

    try {
      const presetId = audioInterface.savePreset(name, category);
      Alert.alert('Succès', t('audio:presetManager.success.presetSaved'));
      await loadPresets();
      return true;
    } catch (error) {
      Alert.alert('Erreur', t('audio:presetManager.errors.savePreset'));
      return false;
    }
  }, [loadPresets, t]);

  const deletePreset = useCallback(async (presetId: string, presetName: string) => {
    return new Promise<void>((resolve, reject) => {
      Alert.alert(
        t('audio:presetManager.confirmations.deleteTitle'),
        t('audio:presetManager.confirmations.deleteMessage', { name: presetName }),
        [
          { 
            text: t('audio:presetManager.confirmations.deleteCancel'), 
            style: 'cancel',
            onPress: () => reject(new Error('Cancelled'))
          },
          {
            text: t('audio:presetManager.confirmations.deleteConfirm'),
            style: 'destructive',
            onPress: async () => {
              try {
                (audioInterface as any).deletePreset(presetId);
                await loadPresets();
                resolve();
              } catch (error) {
                Alert.alert('Erreur', t('audio:presetManager.errors.deletePreset'));
                reject(error);
              }
            },
          },
        ]
      );
    });
  }, [loadPresets, t]);

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