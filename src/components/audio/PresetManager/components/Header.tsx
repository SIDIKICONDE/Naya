/**
 * Header du gestionnaire de presets
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { HeaderProps } from '../types';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';

export const Header: React.FC<HeaderProps> = ({ title, onClose }) => {
  const audioTheme = useAudioTheme();
  const styles = createStyles(audioTheme);

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (audioTheme: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: audioTheme.spacing.lg,
    backgroundColor: audioTheme.colors.moduleBackground,
    borderBottomWidth: 1,
    borderBottomColor: audioTheme.colors.buttonInactive,
  },
  title: {
    ...audioTheme.typography.h2,
    color: audioTheme.colors.text,
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: audioTheme.colors.knobBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
  },
  closeButtonText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
  },
});