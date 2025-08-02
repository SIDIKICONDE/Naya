/**
 * État vide pour la liste des presets
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EMPTY_STATE } from '../constants';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';

export const EmptyState: React.FC = () => {
  const audioTheme = useAudioTheme();
  const styles = createStyles(audioTheme);

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{EMPTY_STATE.icon}</Text>
      <Text style={styles.emptyText}>{EMPTY_STATE.message}</Text>
    </View>
  );
};

const createStyles = (audioTheme: any) => StyleSheet.create({
  emptyState: {
    padding: audioTheme.spacing.xl,
    alignItems: 'center',
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.sm,
    margin: audioTheme.spacing.md,
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: audioTheme.spacing.sm,
    opacity: 0.7,
  },
  emptyText: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});