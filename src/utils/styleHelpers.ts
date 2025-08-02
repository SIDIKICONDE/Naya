/**
 * Helpers pour créer des styles avec le thème
 * Simplifie l'utilisation du système de thème dans les composants
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Theme } from '../config/themes';

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export const createThemedStyles = <T extends NamedStyles<T>>(
  stylesFactory: (theme: Theme) => T
) => {
  return (theme: Theme) => StyleSheet.create(stylesFactory(theme));
};

// Helper pour les ombres conditionnelles selon le thème
export const getThemedShadow = (theme: Theme, shadowSize: 'small' | 'medium' | 'large') => {
  return theme.shadows[shadowSize];
};

// Helper pour les couleurs d'état
export const getStatusColor = (theme: Theme, status: 'error' | 'warning' | 'success' | 'info') => {
  return theme.colors[status];
};

// Helper pour les couleurs audio
export const getAudioLevelColor = (theme: Theme, level: 'low' | 'medium' | 'high' | 'peak') => {
  return theme.colors.audioLevel[level];
};