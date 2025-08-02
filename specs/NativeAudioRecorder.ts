import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface AudioRecorderConfig {
  sampleRate: number;   // 8000, 16000, 22050, 44100, 48000, 88200 (maximum supporté)
  channels: number;     // 1-8 canaux supportés
  bitDepth: number;     // 16, 24, ou 32 bits
  bufferSize: number;   // Taille du buffer en échantillons
}

export interface AudioBuffer {
  data: Array<number>;
  timestamp: number;
  duration: number;
}

export interface RecordingStats {
  duration: number;
  size: number;
  isRecording: boolean;
  bufferLevel: number;
}

export interface Spec extends TurboModule {
  readonly getConstants: () => {};  // Requis par Codegen
  // Configuration
  readonly initialize: (config: AudioRecorderConfig) => boolean;
  readonly configure: (config: AudioRecorderConfig) => boolean;
  
  // Contrôle d'enregistrement
  readonly startRecording: (outputPath: string) => boolean;
  readonly stopRecording: () => string; // Retourne le chemin du fichier
  readonly pauseRecording: () => boolean;
  readonly resumeRecording: () => boolean;
  
  // État et statistiques
  readonly isRecording: () => boolean;
  readonly getRecordingStats: () => RecordingStats;
  readonly getAudioLevel: () => number;
  
  // Gestion des buffers
  readonly getAudioBuffer: () => AudioBuffer | null;
  readonly clearBuffers: () => void;
  
  // Utilitaires
  readonly getSupportedFormats: () => Array<string>;
  readonly cleanup: () => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeAudioRecorder');