/**
 * Interface NativeAudioEqualizer TurboModule
 * Auto-suffisante pour Codegen
 */

import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Initialisation
  readonly initialize: () => Promise<boolean>;
  readonly cleanup: () => boolean;
  
  // Égaliseur de base
  readonly setBandGain: (bandIndex: number, gain: number) => boolean;
  readonly getBandGain: (bandIndex: number) => number;
  readonly resetEqualizer: () => boolean;
  
  // Fichier audio
  readonly loadAudioFile: (filePath: string) => Promise<{
    success: boolean;
    duration: number;
    sampleRate: number;
    channels: number;
  }>;
  
  // Status
  readonly getStatus: () => {
    initialized: boolean;
    currentFile: string;
    bandsCount: number;
  };
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeAudioEqualizer');