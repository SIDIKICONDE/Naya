/**
 * Configuration audio pour basculer entre mock et production
 */

export const AUDIO_CONFIG = {
  // Utiliser le mock pendant le développement
  USE_MOCK: __DEV__ ?? true,
  
  // Configuration par défaut
  DEFAULT_SAMPLE_RATE: 48000,
  DEFAULT_BUFFER_SIZE: 512,
  DEFAULT_CHANNELS: 2,
  
  // Paramètres de performance
  PERFORMANCE_MONITORING: true,
  LOG_AUDIO_EVENTS: __DEV__ ?? false,
  
  // Mock settings
  MOCK_REALISTIC_DATA: true,
  MOCK_SIMULATION_SPEED: 1.0, // Multiplicateur de vitesse pour les tests
} as const;

export type AudioConfigType = typeof AUDIO_CONFIG;