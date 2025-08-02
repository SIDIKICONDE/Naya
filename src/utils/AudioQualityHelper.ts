import type { AudioRecorderConfig } from '../../specs/NativeAudioRecorder';
import { AudioPresets } from '../constants/AudioPresets';

/**
 * Utilitaires pour la gestion de la qualité audio
 */
export class AudioQualityHelper {
  
  /**
   * Calcule la taille estimée d'un fichier audio
   * @param config Configuration audio
   * @param durationSeconds Durée en secondes
   * @returns Taille en octets
   */
  static calculateFileSize(config: AudioRecorderConfig, durationSeconds: number): number {
    const bytesPerSample = config.bitDepth / 8;
    const bytesPerSecond = config.sampleRate * config.channels * bytesPerSample;
    return Math.ceil(bytesPerSecond * durationSeconds);
  }
  
  /**
   * Formate la taille en unités lisibles
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
  
  /**
   * Obtient la qualité recommandée selon l'usage
   */
  static getRecommendedQuality(usage: AudioUsage): AudioRecorderConfig {
    switch (usage) {
      case 'voice':
        return AudioPresets.Voice;
      case 'podcast':
        return AudioPresets.Voice;
      case 'music-amateur':
        return AudioPresets.Studio;
      case 'music-professional':
        return AudioPresets.StudioMax;
      case 'mastering':
        return AudioPresets.DXD;
      case 'audiophile':
        return AudioPresets.HiRes;
      case 'surround':
        return AudioPresets.Surround51;
      default:
        return AudioPresets.Studio;
    }
  }
  
  /**
   * Valide une configuration audio
   */
  static validateConfig(config: AudioRecorderConfig): ConfigValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validation du sample rate
    const validSampleRates = [8000, 16000, 22050, 44100, 48000, 88200, 96000, 176400, 192000, 352800, 384000];
    if (!validSampleRates.includes(config.sampleRate)) {
      errors.push(`Taux d'échantillonnage non supporté: ${config.sampleRate}Hz`);
    }
    
    // Validation de la profondeur de bits
    if (![16, 24, 32].includes(config.bitDepth)) {
      errors.push(`Profondeur de bits non supportée: ${config.bitDepth}bit`);
    }
    
    // Validation des canaux
    if (config.channels < 1 || config.channels > 8) {
      errors.push(`Nombre de canaux invalide: ${config.channels}`);
    }
    
    // Validation de la taille du buffer
    if (config.bufferSize < 256 || config.bufferSize > 32768) {
      errors.push(`Taille de buffer invalide: ${config.bufferSize}`);
    }
    
    // Avertissements pour les configurations extrêmes
    if (config.sampleRate > 192000) {
      warnings.push('Taux d\'échantillonnage très élevé - consommation CPU importante');
    }
    
    if (config.bitDepth === 32 && config.sampleRate > 96000) {
      warnings.push('Configuration haute résolution - fichiers très volumineux');
    }
    
    if (config.channels > 2 && config.sampleRate > 48000) {
      warnings.push('Configuration multicanal haute résolution - performance impactée');
    }
    
    const estimatedMBPerMinute = this.calculateFileSize(config, 60) / (1024 * 1024);
    if (estimatedMBPerMinute > 50) {
      warnings.push(`Taille de fichier importante: ~${estimatedMBPerMinute.toFixed(1)}MB/min`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Obtient des informations détaillées sur une configuration
   */
  static getConfigInfo(config: AudioRecorderConfig): ConfigInfo {
    const fileSize1Min = this.calculateFileSize(config, 60);
    const nyquistFreq = config.sampleRate / 2;
    
    let qualityLevel: QualityLevel;
    if (config.sampleRate <= 16000) qualityLevel = 'voice';
    else if (config.sampleRate <= 48000) qualityLevel = 'standard';
    else if (config.sampleRate <= 96000) qualityLevel = 'high';
    else qualityLevel = 'ultra';
    
    let dynamicRange: number;
    switch (config.bitDepth) {
      case 16: dynamicRange = 96; break;
      case 24: dynamicRange = 144; break;
      case 32: dynamicRange = 192; break;
      default: dynamicRange = 96;
    }
    
    return {
      qualityLevel,
      nyquistFrequency: nyquistFreq,
      dynamicRange,
      fileSizePerMinute: this.formatFileSize(fileSize1Min),
      fileSizePerMinuteBytes: fileSize1Min,
      bandwidth: `DC - ${(nyquistFreq / 1000).toFixed(1)}kHz`,
      channelLayout: this.getChannelLayout(config.channels)
    };
  }
  
  /**
   * Suggère des optimisations pour une configuration
   */
  static suggestOptimizations(config: AudioRecorderConfig, constraints?: PerformanceConstraints): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    if (constraints?.maxFileSizeMB) {
      const currentSizeMB = this.calculateFileSize(config, 60) / (1024 * 1024);
      if (currentSizeMB > constraints.maxFileSizeMB) {
        suggestions.push({
          type: 'reduce_quality',
          description: 'Réduire la qualité pour respecter la limite de taille',
          impact: 'Taille de fichier réduite',
          newConfig: this.findConfigForFileSize(constraints.maxFileSizeMB, config.channels)
        });
      }
    }
    
    if (constraints?.lowPowerMode) {
      if (config.sampleRate > 48000) {
        suggestions.push({
          type: 'reduce_sample_rate',
          description: 'Réduire le taux d\'échantillonnage pour économiser la batterie',
          impact: 'Consommation CPU réduite',
          newConfig: { ...config, sampleRate: 48000, bufferSize: 4096 }
        });
      }
    }
    
    if (constraints?.realtimeProcessing && config.bufferSize > 4096) {
      suggestions.push({
        type: 'reduce_buffer_size',
        description: 'Réduire la taille du buffer pour la latence temps réel',
        impact: 'Latence réduite mais plus de CPU',
        newConfig: { ...config, bufferSize: 2048 }
      });
    }
    
    return suggestions;
  }
  
  private static getChannelLayout(channels: number): string {
    switch (channels) {
      case 1: return 'Mono';
      case 2: return 'Stéréo (L, R)';
      case 6: return '5.1 Surround (L, R, C, LFE, Ls, Rs)';
      case 8: return '7.1 Surround (L, R, C, LFE, Ls, Rs, Lb, Rb)';
      default: return `${channels} canaux`;
    }
  }
  
  private static findConfigForFileSize(maxMB: number, channels: number): AudioRecorderConfig {
    const configs = [
      AudioPresets.Voice,
      AudioPresets.CD,
      AudioPresets.Studio,
      AudioPresets.HiRes
    ];
    
    for (const config of configs) {
      const sizeMB = this.calculateFileSize(config, 60) / (1024 * 1024);
      if (sizeMB <= maxMB) {
        return { ...config, channels };
      }
    }
    
    return { ...AudioPresets.Voice, channels };
  }
}

// Types d'assistance
export type AudioUsage = 
  | 'voice' 
  | 'podcast' 
  | 'music-amateur' 
  | 'music-professional' 
  | 'mastering' 
  | 'audiophile' 
  | 'surround';

export type QualityLevel = 'voice' | 'standard' | 'high' | 'ultra';

export interface ConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigInfo {
  qualityLevel: QualityLevel;
  nyquistFrequency: number;
  dynamicRange: number;
  fileSizePerMinute: string;
  fileSizePerMinuteBytes: number;
  bandwidth: string;
  channelLayout: string;
}

export interface PerformanceConstraints {
  maxFileSizeMB?: number;
  lowPowerMode?: boolean;
  realtimeProcessing?: boolean;
  maxChannels?: number;
}

export interface OptimizationSuggestion {
  type: 'reduce_quality' | 'reduce_sample_rate' | 'reduce_buffer_size' | 'reduce_channels';
  description: string;
  impact: string;
  newConfig: AudioRecorderConfig;
}

/**
 * Constantes utiles pour l'audio
 */
export const AudioConstants = {
  // Taux d'échantillonnage standards
  SAMPLE_RATES: {
    TELEPHONE: 8000,
    WIDEBAND_VOICE: 16000,
    RADIO_QUALITY: 22050,
    CD_QUALITY: 44100,
    DAT_DVD: 48000,
    HIRES_2X: 88200,
    HIRES_STANDARD: 96000,
    HIRES_4X: 176400,
    HIRES_MAX: 192000,
    DXD: 352800,
    EXTREME_HIRES: 384000
  },
  
  // Profondeurs de bits
  BIT_DEPTHS: {
    STANDARD: 16,
    PROFESSIONAL: 24,
    FLOAT: 32
  },
  
  // Tailles de buffer recommandées
  BUFFER_SIZES: {
    LOW_LATENCY: 256,
    REALTIME: 512,
    BALANCED: 1024,
    STANDARD: 2048,
    LARGE: 4096,
    EXTRA_LARGE: 8192,
    MAXIMUM: 16384
  }
} as const;