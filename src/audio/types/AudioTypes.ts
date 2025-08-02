/**
 * Types de base pour l'interface audio professionnelle
 * @module AudioTypes
 */

/**
 * Format audio supporté
 */
export enum AudioFormat {
  PCM_16 = 'PCM_16',
  PCM_24 = 'PCM_24',
  PCM_32 = 'PCM_32',
  FLOAT_32 = 'FLOAT_32',
  FLOAT_64 = 'FLOAT_64'
}

/**
 * Configuration audio de base
 */
export interface AudioConfig {
  sampleRate: number;
  channels: number;
  format: AudioFormat;
  bufferSize: number;
  latency?: number;
}

/**
 * Buffer audio générique
 */
export interface AudioBuffer {
  data: Float32Array[];
  channels: number;
  sampleRate: number;
  length: number;
}

/**
 * Paramètre audio avec métadonnées
 */
export interface AudioParameter {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  unit?: string;
  step?: number;
  logarithmic?: boolean;
  automatable?: boolean;
}

/**
 * Point d'automation
 */
export interface AutomationPoint {
  time: number;
  value: number;
  curve?: 'linear' | 'exponential' | 'logarithmic' | 'step';
}

/**
 * État d'un module audio
 */
export interface ModuleState {
  enabled: boolean;
  bypassed: boolean;
  parameters: Record<string, number>;
  automation?: Record<string, AutomationPoint[]>;
}

/**
 * Métadonnées d'un module
 */
export interface ModuleMetadata {
  id: string;
  name: string;
  category: string;
  version: string;
  author?: string;
  description?: string;
  tags?: string[];
}

/**
 * Résultat d'analyse audio
 */
export interface AnalysisResult {
  timestamp: number;
  duration: number;
  data: Record<string, any>;
}

/**
 * Configuration de preset
 */
export interface Preset {
  id: string;
  name: string;
  category?: string;
  moduleId: string;
  state: ModuleState;
  metadata?: Record<string, any>;
}

/**
 * Types d'événements audio
 */
export enum AudioEventType {
  PARAMETER_CHANGED = 'PARAMETER_CHANGED',
  STATE_CHANGED = 'STATE_CHANGED',
  BUFFER_PROCESSED = 'BUFFER_PROCESSED',
  MODULE_ADDED = 'MODULE_ADDED',
  MODULE_REMOVED = 'MODULE_REMOVED',
  ERROR = 'ERROR',
  WARNING = 'WARNING'
}

/**
 * Événement audio
 */
export interface AudioEvent {
  type: AudioEventType;
  source: string;
  timestamp: number;
  data?: any;
}

/**
 * Callback pour les événements
 */
export type AudioEventCallback = (event: AudioEvent) => void;

/**
 * Métriques de performance
 */
export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  latency: number;
  bufferUnderruns: number;
  processingTime: number;
}

/**
 * Types de connexion entre modules
 */
export enum ConnectionType {
  AUDIO = 'AUDIO',
  MIDI = 'MIDI',
  CONTROL = 'CONTROL',
  SIDECHAIN = 'SIDECHAIN'
}

/**
 * Connexion entre modules
 */
export interface ModuleConnection {
  sourceId: string;
  sourceOutput: number;
  targetId: string;
  targetInput: number;
  type: ConnectionType;
  gain?: number;
}