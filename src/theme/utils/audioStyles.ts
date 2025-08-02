/**
 * Utilitaires pour créer des styles audio thématiques
 * Générateurs de styles basés sur le thème actuel
 */

import { StyleSheet } from 'react-native';
import type { AudioColors } from '../types/ThemeTypes';

/**
 * Génère les styles de base pour un module audio
 */
export const createModuleStyles = (colors: AudioColors, moduleColor: string) => {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.knobBackground,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: moduleColor + '30', // 30% d'opacité
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: moduleColor + '20',
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: moduleColor,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    controls: {
      gap: 12,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    activeButton: {
      backgroundColor: moduleColor,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      shadowColor: moduleColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    inactiveButton: {
      backgroundColor: colors.buttonInactive,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    buttonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
    },
  });
};

/**
 * Génère les styles pour un slider audio
 */
export const createSliderStyles = (colors: AudioColors, accentColor: string) => {
  return StyleSheet.create({
    container: {
      marginVertical: 8,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.buttonInactive,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    track: {
      height: 4,
      backgroundColor: colors.sliderTrack,
      borderRadius: 2,
      position: 'relative',
    },
    fill: {
      height: '100%',
      backgroundColor: accentColor,
      borderRadius: 2,
    },
    thumb: {
      position: 'absolute',
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: accentColor,
      top: -7,
      marginLeft: -9,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    valueContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    value: {
      fontSize: 12,
      fontWeight: '500',
      color: accentColor,
    },
    unit: {
      fontSize: 10,
      fontWeight: '400',
      color: colors.buttonInactive,
    },
  });
};

/**
 * Génère les styles pour un visualiseur audio
 */
export const createVisualizerStyles = (colors: AudioColors) => {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.knobBackground,
      borderRadius: 8,
      padding: 12,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.spectrumPrimary,
    },
    canvas: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    levelBar: {
      height: 4,
      backgroundColor: colors.sliderTrack,
      borderRadius: 2,
      overflow: 'hidden',
    },
    levelFill: {
      height: '100%',
      borderRadius: 2,
    },
    grid: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    gridLine: {
      position: 'absolute',
      backgroundColor: colors.sliderTrack + '40',
    },
  });
};

/**
 * Génère les styles pour les boutons de contrôle audio
 */
export const createControlButtonStyles = (colors: AudioColors) => {
  return StyleSheet.create({
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.play,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.play,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    recordButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.record,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.record,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    muteButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.mute,
      justifyContent: 'center',
      alignItems: 'center',
    },
    soloButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.solo,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bypassButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.bypass,
      justifyContent: 'center',
      alignItems: 'center',
    },
    inactiveButton: {
      backgroundColor: colors.buttonInactive,
    },
    buttonIcon: {
      fontSize: 18,
      color: '#fff',
      fontWeight: 'bold',
    },
    smallButtonIcon: {
      fontSize: 14,
      color: '#fff',
      fontWeight: 'bold',
    },
  });
};

/**
 * Génère les styles pour les level meters
 */
export const createLevelMeterStyles = (colors: AudioColors) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 4,
      alignItems: 'flex-end',
      height: 120,
    },
    channel: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    meterContainer: {
      flex: 1,
      width: 8,
      backgroundColor: colors.sliderTrack,
      borderRadius: 4,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    meterFill: {
      width: '100%',
      borderRadius: 4,
    },
    peakIndicator: {
      width: '100%',
      height: 2,
      backgroundColor: colors.levelPeak,
      position: 'absolute',
      top: 0,
    },
    clipIndicator: {
      width: '100%',
      height: 4,
      backgroundColor: colors.levelClip,
      position: 'absolute',
      top: 0,
    },
    label: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.buttonInactive,
    },
    value: {
      fontSize: 8,
      fontWeight: '500',
      color: colors.spectrumPrimary,
    },
  });
};

/**
 * Génère un dégradé de couleurs pour les visualiseurs
 */
export const createSpectrumGradient = (colors: AudioColors, steps: number = 64) => {
  const gradient = [];
  const startColor = hexToRgb(colors.spectrumGradientStart);
  const endColor = hexToRgb(colors.spectrumGradientEnd);
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
    gradient.push(`rgb(${r}, ${g}, ${b})`);
  }
  
  return gradient;
};

/**
 * Convertit une couleur hex en RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Génère une couleur avec opacité
 */
export const withOpacity = (color: string, opacity: number): string => {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return color + alpha;
};

/**
 * Mélange deux couleurs
 */
export const blendColors = (color1: string, color2: string, ratio: number): string => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
  
  return `rgb(${r}, ${g}, ${b})`;
};