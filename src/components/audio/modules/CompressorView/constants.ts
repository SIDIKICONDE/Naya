/**
 * Constantes et configurations pour le CompressorView
 * Architecture modulaire avec support thématique complet
 */

import type { CompressorPreset } from './types';
import type { AudioColors } from '../../../../theme/types/ThemeTypes';

// Paramètres par défaut
export const DEFAULT_PARAMS = {
  threshold: -12,
  ratio: 4,
  attack: 10,
  release: 100,
  knee: 2,
  makeupGain: 0,
} as const;

// Plages de valeurs pour les contrôles
export const PARAM_RANGES = {
  threshold: { min: -60, max: 0, step: 0.1 },
  ratio: { min: 1, max: 20, step: 0.1 },
  attack: { min: 0.1, max: 100, step: 0.1 },
  release: { min: 10, max: 2000, step: 5 },
  knee: { min: 0, max: 10, step: 0.1 },
  makeupGain: { min: -20, max: 20, step: 0.1 },
} as const;

// Types pour les couleurs de contrôle
export type ControlColors = {
  threshold: string;
  ratio: string;
  ratioHigh: string;
  attack: string;
  attackFast: string;
  release: string;
  releaseSlow: string;
  knee: string;
  makeupGain: string;
  gainReduction: string;
  gainReductionHigh: string;
  active: string;
  inactive: string;
};

// Fonction pour obtenir les couleurs thématiques
export const getThemedControlColors = (audioColors: AudioColors): ControlColors => ({
  threshold: audioColors.compressorColor,
  ratio: audioColors.compressorColor,
  ratioHigh: audioColors.levelHigh,
  attack: audioColors.gateColor,
  attackFast: audioColors.levelLow,
  release: audioColors.gateColor,
  releaseSlow: audioColors.levelMid,
  knee: audioColors.chorusColor,
  makeupGain: audioColors.equalizerColor,
  gainReduction: audioColors.compressorColor,
  gainReductionHigh: audioColors.levelHigh,
  active: audioColors.compressorColor,
  inactive: audioColors.buttonInactive,
} as const);

// Couleurs par défaut (fallback)
export const CONTROL_COLORS = {
  threshold: '#FF9800',
  ratio: '#FF9800',
  ratioHigh: '#FF4444',
  attack: '#4CAF50',
  attackFast: '#00E676',
  release: '#4CAF50',
  releaseSlow: '#FFC107',
  knee: '#9C27B0',
  makeupGain: '#2196F3',
  gainReduction: '#FF9800',
  gainReductionHigh: '#FF4444',
  active: '#FF9800',
  inactive: '#333',
} as const;

// Presets de base (paramètres techniques seulement)
export const COMPRESSOR_PRESET_PARAMS = [
  {
    id: 'vocal',
    threshold: -18,
    ratio: 3.5,
    attack: 3,
    release: 60,
    knee: 2,
  },
  {
    id: 'drums',
    threshold: -12,
    ratio: 6,
    attack: 0.5,
    release: 40,
    knee: 1,
  },
  {
    id: 'master',
    threshold: -8,
    ratio: 2.5,
    attack: 15,
    release: 250,
    knee: 3,
  },
  {
    id: 'bass',
    threshold: -16,
    ratio: 4,
    attack: 8,
    release: 120,
    knee: 2.5,
  },
  {
    id: 'piano',
    threshold: -20,
    ratio: 2,
    attack: 12,
    release: 150,
    knee: 4,
  },
  {
    id: 'aggressive',
    threshold: -10,
    ratio: 8,
    attack: 0.3,
    release: 25,
    knee: 0.5,
  },
  {
    id: 'brass',
    threshold: -14,
    ratio: 3,
    attack: 5,
    release: 80,
    knee: 2,
  },
  {
    id: 'snare',
    threshold: -8,
    ratio: 5,
    attack: 0.2,
    release: 15,
    knee: 0.8,
  },
  {
    id: 'broadcast',
    threshold: -20,
    ratio: 2.8,
    attack: 2,
    release: 80,
    knee: 3,
  },
] as const;

// Fonction pour créer les presets avec traductions
export const createLocalizedPresets = (t: (key: string) => string): CompressorPreset[] => {
  return COMPRESSOR_PRESET_PARAMS.map((params) => ({
    ...params,
    name: t(`audio:modules.compressor.presets.categories.${params.id}.name`),
    description: t(`audio:modules.compressor.presets.categories.${params.id}.description`),
  }));
};

// Presets professionnels (fallback pour compatibilité)
export const COMPRESSOR_PRESETS: CompressorPreset[] = [
  {
    name: '🎤 Vocal Lead',
    threshold: -18,
    ratio: 3.5,
    attack: 3,
    release: 60,
    knee: 2,
    description: 'Voix principale claire',
  },
  {
    name: '🥁 Drums Punch',
    threshold: -12,
    ratio: 6,
    attack: 0.5,
    release: 40,
    knee: 1,
    description: 'Percussion dynamique',
  },
  {
    name: '🎵 Master Bus',
    threshold: -8,
    ratio: 2.5,
    attack: 15,
    release: 250,
    knee: 3,
    description: 'Mix général cohérent',
  },
  {
    name: '🎸 Bass Control',
    threshold: -16,
    ratio: 4,
    attack: 8,
    release: 120,
    knee: 2.5,
    description: 'Basse contrôlée',
  },
  {
    name: '🎹 Piano Smooth',
    threshold: -20,
    ratio: 2,
    attack: 12,
    release: 150,
    knee: 4,
    description: 'Piano doux et régulier',
  },
  {
    name: '🔥 Aggressive',
    threshold: -10,
    ratio: 8,
    attack: 0.3,
    release: 25,
    knee: 0.5,
    description: 'Son agressif et punchant',
  },
  {
    name: '🎺 Brass Section',
    threshold: -14,
    ratio: 3,
    attack: 5,
    release: 80,
    knee: 2,
    description: 'Cuivres brillants et homogènes',
  },
  {
    name: '🥁 Snare Snap',
    threshold: -8,
    ratio: 5,
    attack: 0.2,
    release: 15,
    knee: 0.8,
    description: 'Caisse claire percutante',
  },
  {
    name: '🎤 Broadcast Voice',
    threshold: -20,
    ratio: 2.8,
    attack: 2,
    release: 80,
    knee: 3,
    description: 'Voix radio professionnelle',
  },
];

// Configuration d'animation
export const ANIMATION_CONFIG = {
  gainReductionUpdate: 50, // ms
  animationDuration: 50, // ms
  maxGainReduction: 20, // dB
} as const;

// Utilitaires de validation des paramètres
export const validateParameter = (param: keyof typeof PARAM_RANGES, value: number): number => {
  const range = PARAM_RANGES[param];
  return Math.max(range.min, Math.min(range.max, value));
};

// Utilitaire pour formater les valeurs d'affichage
export const formatParameterValue = (param: keyof typeof PARAM_RANGES, value: number): string => {
  switch (param) {
    case 'threshold':
    case 'makeupGain':
      return `${value.toFixed(1)} dB`;
    case 'ratio':
      return value >= 20 ? '∞:1' : `${value.toFixed(1)}:1`;
    case 'attack':
      return value < 1 ? `${(value * 1000).toFixed(0)} µs` : `${value.toFixed(1)} ms`;
    case 'release':
      return value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${value.toFixed(0)} ms`;
    case 'knee':
      return `${value.toFixed(1)} dB`;
    default:
      return value.toString();
  }
};

// Utilitaire pour obtenir la couleur d'un paramètre
export const getParameterColor = (param: keyof typeof PARAM_RANGES, colors: ControlColors): string => {
  switch (param) {
    case 'threshold':
      return colors.threshold;
    case 'ratio':
      return colors.ratio;
    case 'attack':
      return colors.attack;
    case 'release':
      return colors.release;
    case 'knee':
      return colors.knee;
    case 'makeupGain':
      return colors.makeupGain;
    default:
      return colors.threshold;
  }
};

// Types pour la configuration du graphique
export type GraphConfig = {
  width: number;
  height: number;
  gridLines: number[];
  strokeWidth: number;
  gridColor: string;
  lineColor: string;
  curveColor: string;
  thresholdColor: string;
};

// Fonction pour obtenir la configuration du graphique avec couleurs thématiques
export const getThemedGraphConfig = (audioColors: AudioColors): GraphConfig => ({
  width: 160,
  height: 160,
  gridLines: [-60, -40, -20, 0],
  strokeWidth: 2,
  gridColor: audioColors.sliderTrack,
  lineColor: audioColors.buttonInactive,
  curveColor: audioColors.compressorColor,
  thresholdColor: audioColors.compressorColor,
} as const);

// Fonction pour obtenir la configuration du graphique compact avec couleurs thématiques
export const getThemedCompactGraphConfig = (audioColors: AudioColors): GraphConfig => ({
  width: 100,
  height: 100,
  gridLines: [-40, -20, 0],
  strokeWidth: 1.5,
  gridColor: audioColors.sliderTrack,
  lineColor: audioColors.buttonInactive,
  curveColor: audioColors.compressorColor,
  thresholdColor: audioColors.compressorColor,
} as const);

// Configuration du graphique (fallback)
export const GRAPH_CONFIG = {
  width: 160,
  height: 160,
  gridLines: [-60, -40, -20, 0],
  strokeWidth: 2,
  gridColor: '#333',
  lineColor: '#444',
  curveColor: '#FF9800',
  thresholdColor: '#FF9800',
} as const;

// Configuration du graphique en mode compact (fallback)
export const COMPACT_GRAPH_CONFIG = {
  width: 100,
  height: 100,
  gridLines: [-40, -20, 0],
  strokeWidth: 1.5,
  gridColor: '#333',
  lineColor: '#444',
  curveColor: '#FF9800',
  thresholdColor: '#FF9800',
} as const;