import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  readonly getFFmpegVersion: () => string;
  readonly initializeFFmpeg: () => boolean;
  readonly getSupportedFormats: () => string;
  readonly testAudioEncoding: () => boolean;
  readonly getAudioInfo: (filePath: string) => string;
  readonly convertAudioFormat: (inputPath: string, outputPath: string, format: string) => boolean;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeFFmpegModule');