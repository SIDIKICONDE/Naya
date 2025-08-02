/**
 * Constantes pour le gestionnaire de presets
 */

// Types simples pour les catégories (chaînes)
export type PresetCategoryType = 'All' | 'User' | 'Factory' | 'Vocal' | 'Instrument' | 'Master';

export const PRESET_CATEGORIES: PresetCategoryType[] = [
  'All', 
  'User', 
  'Factory', 
  'Vocal', 
  'Instrument', 
  'Master'
];

export const SAVE_CATEGORIES: PresetCategoryType[] = [
  'User', 
  'Vocal', 
  'Instrument', 
  'Master'
];

export const DEFAULT_CATEGORY: PresetCategoryType = 'User';

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
