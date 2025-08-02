import { AudioRecorderConfig } from '../specs/NativeAudioRecorder';

// Configurations prédéfinies pour différents usages
export const AudioPresets = {
  // Qualité téléphone/voix
  Voice: {
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16,
    bufferSize: 2048
  },
  
  // Qualité CD standard
  CD: {
    sampleRate: 44100,
    channels: 2,
    bitDepth: 16,
    bufferSize: 4096
  },
  
  // Qualité studio standard
  Studio: {
    sampleRate: 48000,
    channels: 2,
    bitDepth: 24,
    bufferSize: 4096
  },
  
  // Haute résolution 96kHz/24bit
  HiRes: {
    sampleRate: 96000,
    channels: 2,
    bitDepth: 24,
    bufferSize: 8192
  },
  
  // Qualité studio maximale 192kHz/32bit
  StudioMax: {
    sampleRate: 192000,
    channels: 2,
    bitDepth: 32,
    bufferSize: 8192
  },
  
  // DXD (Digital eXtreme Definition) pour mastering
  DXD: {
    sampleRate: 352800,
    channels: 2,
    bitDepth: 32,
    bufferSize: 16384
  },
  
  // Configuration surround 5.1
  Surround51: {
    sampleRate: 48000,
    channels: 6,
    bitDepth: 24,
    bufferSize: 8192
  },
  
  // Configuration surround 7.1 haute résolution
  Surround71HiRes: {
    sampleRate: 96000,
    channels: 8,
    bitDepth: 32,
    bufferSize: 16384
  }
} as const satisfies Record<string, AudioRecorderConfig>;

export type AudioPresetName = keyof typeof AudioPresets;