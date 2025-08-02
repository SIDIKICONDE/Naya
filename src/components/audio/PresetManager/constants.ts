/**
 * Constantes pour le gestionnaire de presets
 */

import type { PresetCategory } from './types';

export const PRESET_CATEGORIES: PresetCategory[] = [
  'All', 
  'User', 
  'Factory', 
  'Vocal', 
  'Instrument', 
  'Master'
];

export const SAVE_CATEGORIES: PresetCategory[] = [
  'User', 
  'Vocal', 
  'Instrument', 
  'Master'
];

export const DEFAULT_CATEGORY: PresetCategory = 'User';

export const MODAL_CONFIG = {
  maxHeight: 0.85,
  maxWidth: 400,
  borderRadius: 16,
  padding: 12,
} as const;

export const EMPTY_STATE = {
  icon: '📂',
  message: 'Aucun preset dans cette catégorie',
} as const;