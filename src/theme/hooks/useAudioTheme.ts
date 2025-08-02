/**
 * Hook spécialisé pour les thèmes audio
 * Simplifie l'accès aux couleurs et styles audio
 */

import { useTheme } from '../providers/ThemeProvider';
import type { AudioColors, FontWeight } from '../types/ThemeTypes';

export interface AudioThemeConfig {
  colors: AudioColors;
  isDark: boolean;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
      typography: {
      moduleTitle: {
        fontSize: number;
        fontWeight: FontWeight;
        color: string;
      };
      parameterLabel: {
        fontSize: number;
        fontWeight: FontWeight;
        color: string;
      };
      valueDisplay: {
        fontSize: number;
        fontWeight: FontWeight;
        color: string;
      };
    };
}

/**
 * Hook pour accéder facilement aux thèmes audio
 */
export const useAudioTheme = (): AudioThemeConfig => {
  const { theme } = useTheme();
  
  return {
    colors: theme.colors.audio,
    isDark: theme.colorScheme === 'dark',
    spacing: theme.spacing,
    typography: {
      moduleTitle: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: theme.colors.textPrimary,
      },
      parameterLabel: {
        fontSize: 12,
        fontWeight: '600' as const,
        color: theme.colors.textSecondary,
      },
      valueDisplay: {
        fontSize: 14,
        fontWeight: '500' as const,
        color: theme.colors.audio.knobActive,
      },
    },
  };
};

/**
 * Hook pour obtenir les couleurs d'un module audio spécifique
 */
export const useModuleColors = (moduleType: string) => {
  const { colors } = useAudioTheme();
  
  const getModuleColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'equalizer':
      case 'parametric_eq':
      case 'graphic_eq':
      case 'multiband_eq':
        return colors.equalizerColor;
      case 'compressor':
      case 'multiband_compressor':
      case 'de_esser':
        return colors.compressorColor;
      case 'reverb':
        return colors.reverbColor;
      case 'delay':
        return colors.delayColor;
      case 'chorus':
      case 'flanger':
      case 'phaser':
        return colors.chorusColor;
      case 'distortion':
      case 'pitch_shifter':
      case 'harmonizer':
        return colors.distortionColor;
      case 'limiter':
        return colors.limiterColor;
      case 'gate':
        return colors.gateColor;
      default:
        return colors.knobActive;
    }
  };

  return {
    primary: getModuleColor(moduleType),
    background: colors.knobBackground,
    active: colors.buttonActive,
    inactive: colors.buttonInactive,
    slider: colors.sliderThumb,
    track: colors.sliderTrack,
  };
};

/**
 * Hook pour les couleurs de visualisation audio
 */
export const useVisualizerColors = () => {
  const { colors } = useAudioTheme();
  
  return {
    // Couleurs RMS
    rmsNormal: colors.rmsNormal,
    rmsWarning: colors.rmsWarning,
    rmsCaution: colors.rmsCaution,
    rmsAlert: colors.rmsAlert,

    // Couleurs du spectre
    spectrumNormal: colors.spectrumNormal,
    spectrumWarning: colors.spectrumWarning,
    spectrumCaution: colors.spectrumCaution,
    spectrumAlert: colors.spectrumAlert,
    spectrumBackground: colors.spectrumBackground,

    // Couleurs de l'oscilloscope
    waveformLeft: colors.waveformLeft,
    waveformRight: colors.waveformRight,
    triggerLine: colors.triggerLine,
    gridLine: colors.gridLine,
    gridLineMajor: colors.gridLineMajor,

    // Couleurs du visualiseur 3D
    visualizer3DNormal: colors.visualizer3DNormal,
    visualizer3DWarning: colors.visualizer3DWarning,
    visualizer3DCaution: colors.visualizer3DCaution,
    visualizer3DAlert: colors.visualizer3DAlert,
    visualizer3DActive: colors.visualizer3DActive,

    // Couleurs du panneau
    panelActive: colors.panelActive,
  };
};

/**
 * Hook pour les couleurs de contrôle audio
 */
export const useControlColors = () => {
  const { colors } = useAudioTheme();
  
  return {
    bypass: colors.bypass,
    solo: colors.solo,
    mute: colors.mute,
    record: colors.record,
    play: colors.play,
    active: colors.buttonActive,
    inactive: colors.buttonInactive,
  };
};