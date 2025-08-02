/**
 * Actions du gestionnaire de presets
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import type { ActionsProps } from '../types';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';

export const Actions: React.FC<ActionsProps> = ({ onSave, onImport }) => {
  const audioTheme = useAudioTheme();
  const handleImport = () => {
    Alert.alert('Import', 'Fonctionnalité à venir');
  };

  const styles = createStyles(audioTheme);

  return (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonIcon}>💾</Text>
        <Text style={styles.saveButtonText}>Sauvegarder</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.importButton} onPress={handleImport}>
        <Text style={styles.importButtonIcon}>📥</Text>
        <Text style={styles.importButtonText}>Importer</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (audioTheme: any) => StyleSheet.create({
  actions: {
    flexDirection: 'row',
    padding: audioTheme.spacing.md,
    gap: audioTheme.spacing.sm,
    backgroundColor: audioTheme.colors.moduleBackground,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: audioTheme.colors.success,
    paddingVertical: audioTheme.spacing.sm,
    paddingHorizontal: audioTheme.spacing.md,
    borderRadius: audioTheme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: audioTheme.spacing.xs,
    shadowColor: audioTheme.colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonIcon: {
    fontSize: 14,
  },
  saveButtonText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
    letterSpacing: 0.3,
  },
  importButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: audioTheme.colors.primary,
    paddingVertical: audioTheme.spacing.sm,
    paddingHorizontal: audioTheme.spacing.md,
    borderRadius: audioTheme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: audioTheme.spacing.xs,
    shadowColor: audioTheme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  importButtonIcon: {
    fontSize: 14,
  },
  importButtonText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
    letterSpacing: 0.3,
  },
});