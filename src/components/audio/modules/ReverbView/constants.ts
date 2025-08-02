/**
 * Constantes et configurations pour le module de réverbération
 */

import { ReverbTypeConfig, ReverbPreset } from './types';

export const REVERB_TYPES: ReverbTypeConfig[] = [
  { 
    type: 'ROOM', 
    name: 'Salle', 
    icon: '🏠',
    params: { roomSize: 0.4, damping: 0.6, wetLevel: 0.25, preDelay: 15, width: 0.8 }
  },
  { 
    type: 'HALL', 
    name: 'Hall', 
    icon: '🏛️',
    params: { roomSize: 0.8, damping: 0.3, wetLevel: 0.35, preDelay: 35, width: 1.0 }
  },
  { 
    type: 'PLATE', 
    name: 'Plaque', 
    icon: '📐',
    params: { roomSize: 0.5, damping: 0.7, wetLevel: 0.2, preDelay: 8, width: 0.9 }
  },
  { 
    type: 'SPRING', 
    name: 'Ressort', 
    icon: '🌀',
    params: { roomSize: 0.6, damping: 0.4, wetLevel: 0.3, preDelay: 2, width: 0.7 }
  },
  { 
    type: 'CHAMBER', 
    name: 'Chambre', 
    icon: '🚪',
    params: { roomSize: 0.3, damping: 0.5, wetLevel: 0.15, preDelay: 20, width: 0.85 }
  },
];

export const REVERB_PRESETS: ReverbPreset[] = [
  { name: 'Petite salle', type: 'ROOM', roomSize: 0.3, damping: 0.6, wetLevel: 0.2, preDelay: 10, width: 0.8 },
  { name: 'Grande salle', type: 'HALL', roomSize: 0.8, damping: 0.4, wetLevel: 0.3, preDelay: 30, width: 1 },
  { name: 'Cathédrale', type: 'HALL', roomSize: 0.95, damping: 0.2, wetLevel: 0.4, preDelay: 50, width: 1 },
  { name: 'Vocal', type: 'PLATE', roomSize: 0.4, damping: 0.7, wetLevel: 0.15, preDelay: 15, width: 0.9 },
  { name: 'Ambiance', type: 'ROOM', roomSize: 0.6, damping: 0.5, wetLevel: 0.25, preDelay: 20, width: 1 },
  { name: 'Spring Guitar', type: 'SPRING', roomSize: 0.5, damping: 0.3, wetLevel: 0.3, preDelay: 0, width: 0.7 },
];

export const DEFAULT_REVERB_STATE = {
  selectedType: 'HALL' as const,
  roomSize: 0.5,
  damping: 0.5,
  wetLevel: 0.3,
  dryLevel: 1,
  preDelay: 20,
  width: 1,
  compactMode: false,
  showAdvanced: false,
};