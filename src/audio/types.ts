/**
 * Types et interfaces pour le système audio
 */

// ==================== TYPES DE BASE ====================

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bufferSize: number;
  format: 'FLOAT_32' | 'PCM_24' | 'PCM_16';
  latency?: number;
}

export interface AudioBuffer {
  data: Float32Array[];
  channels: number;
  sampleRate: number;
  length: number;
}

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
}

export interface ModuleState {
  enabled: boolean;
  bypassed: boolean;
  parameters: Record<string, number>;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  latency: number;
  processingTime: number;
}

// ==================== ÉVÉNEMENTS ====================

export type AudioEventType = 
  | 'PARAMETER_CHANGED'
  | 'MODULE_ADDED'
  | 'MODULE_REMOVED'
  | 'STATE_CHANGED'
  | 'ERROR';

export interface AudioEvent {
  type: AudioEventType;
  source: string;
  timestamp: number;
  data?: any;
}

export type AudioEventCallback = (event: AudioEvent) => void;

// ==================== MODULES ====================

export interface ModuleMetadata {
  id: string;
  type: string;
  name: string;
  category: string;
  version: string;
  description?: string;
  author?: string;
  tags?: string[];
}

// ==================== INTERFACE PRINCIPALE ====================

export interface IAudioModule {
  readonly metadata: ModuleMetadata;
  state: ModuleState;
  readonly parameters: ReadonlyMap<string, AudioParameter>;
  
  initialize(sampleRate: number, bufferSize: number): Promise<void>;
  process(input: AudioBuffer, output?: AudioBuffer): AudioBuffer;
  setParameter(parameterId: string, value: number): void;
  getParameter(parameterId: string): number | undefined;
  setEnabled(enabled: boolean): void;
  setBypassed(bypassed: boolean): void;
  reset(): void;
  dispose(): void;
  addEventListener(callback: AudioEventCallback): void;
  removeEventListener(callback: AudioEventCallback): void;
}

// ==================== CONFIGURATIONS SPÉCIALISÉES ====================

// Égaliseur
export interface EQBandConfig {
  frequency: number;
  gain: number;
  q: number;
  type: 'PEAK' | 'LOW_SHELF' | 'HIGH_SHELF' | 'LOW_PASS' | 'HIGH_PASS';
  enabled: boolean;
}

export interface EqualizerConfig {
  bands: EQBandConfig[];
  outputGain: number;
  analysisEnabled?: boolean;
}

// Compresseur
export interface CompressorConfig {
  threshold: number;      // dB
  ratio: number;         // 1:1 à ∞:1
  attack: number;        // ms
  release: number;       // ms
  knee: number;          // dB
  makeupGain: number;    // dB
  lookahead?: number;    // ms
  sidechain?: boolean;
}

// Réverbération
export interface ReverbConfig {
  type: 'ROOM' | 'HALL' | 'PLATE' | 'SPRING' | 'CHAMBER';
  roomSize: number;      // 0-1
  damping: number;       // 0-1
  wetLevel: number;      // 0-1
  dryLevel: number;      // 0-1
  preDelay: number;      // ms
  width: number;         // 0-1
}

// Delay
export interface DelayConfig {
  time: number;          // ms
  feedback: number;      // 0-1
  mix: number;           // 0-1
  pingPong?: boolean;
  sync?: {
    enabled: boolean;
    tempo: number;       // BPM
    division: string;    // '1/4', '1/8', etc.
  };
}

// Réduction de bruit
export interface NoiseReductionConfig {
  threshold: number;     // dB
  reduction: number;     // dB
  smoothing: number;     // 0-1
  adaptiveMode: boolean;
}