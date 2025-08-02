/**
 * Wrapper pour les modules audio
 */

import { AUDIO_CONFIG } from '../config/audio.config';
import { AudioEngineNativeMock } from '../native/AudioEngineMock';
import { 
  IAudioModule, 
  ModuleMetadata, 
  ModuleState, 
  AudioParameter, 
  AudioBuffer, 
  AudioEvent, 
  AudioEventCallback 
} from './types';
import { ModuleType } from './enums';
import { getModuleParameters } from './moduleParameters';

const AudioEngineNative = AUDIO_CONFIG.USE_MOCK 
  ? AudioEngineNativeMock 
  : AudioEngineNativeMock; // TODO: Remplacer par le vrai module natif

export class AudioModuleWrapper implements IAudioModule {
  readonly metadata: ModuleMetadata;
  state: ModuleState;
  private _parameters: Map<string, AudioParameter> = new Map();
  private eventListeners: Set<AudioEventCallback> = new Set();
  public nativeId: string;

  constructor(type: ModuleType, nativeId: string, moduleId: string) {
    this.nativeId = nativeId;
    this.metadata = {
      id: moduleId,
      type,
      name: this.getModuleName(type),
      category: this.getModuleCategory(type),
      version: '1.0.0'
    };

    this.state = {
      enabled: true,
      bypassed: false,
      parameters: {}
    };

    this.initializeParameters(type);
  }

  get parameters(): ReadonlyMap<string, AudioParameter> {
    return this._parameters;
  }

  async initialize(sampleRate: number, bufferSize: number): Promise<void> {
    // Déjà initialisé côté natif
  }

  process(input: AudioBuffer, output?: AudioBuffer): AudioBuffer {
    // Le traitement se fait côté natif
    return output || input;
  }

  setParameter(parameterId: string, value: number): void {
    const param = this._parameters.get(parameterId);
    if (!param) {
      console.warn(`[AudioModule] Paramètre ${parameterId} introuvable, création automatique`);
      // Créer automatiquement le paramètre avec des valeurs par défaut
      this.addParameter(parameterId, parameterId, value, -100, 100, value);
      const newParam = this._parameters.get(parameterId)!;
      newParam.value = value;
      this.state.parameters[parameterId] = value;
    } else {
      const clampedValue = Math.max(param.min, Math.min(param.max, value));
      param.value = clampedValue;
      this.state.parameters[parameterId] = clampedValue;
      value = clampedValue;
    }

    AudioEngineNative.setParameter(this.nativeId, parameterId, value);

    this.emitEvent({
      type: 'PARAMETER_CHANGED',
      source: this.metadata.id,
      timestamp: Date.now(),
      data: { parameterId, value }
    });
  }

  getParameter(parameterId: string): number | undefined {
    const param = this._parameters.get(parameterId);
    if (!param) {
      return undefined;
    }
    return param.value;
  }

  setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
    AudioEngineNative.setModuleEnabled(this.nativeId, enabled);
  }

  setBypassed(bypassed: boolean): void {
    this.state.bypassed = bypassed;
    AudioEngineNative.setModuleBypassed(this.nativeId, bypassed);
  }

  reset(): void {
    this._parameters.forEach((param) => {
      param.value = param.defaultValue;
      this.state.parameters[param.id] = param.defaultValue;
      AudioEngineNative.setParameter(this.nativeId, param.id, param.defaultValue);
    });
  }

  dispose(): void {
    this.eventListeners.clear();
  }

  addEventListener(callback: AudioEventCallback): void {
    this.eventListeners.add(callback);
  }

  removeEventListener(callback: AudioEventCallback): void {
    this.eventListeners.delete(callback);
  }

  private emitEvent(event: AudioEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }

  private initializeParameters(type: ModuleType): void {
    const parameterDefs = getModuleParameters(type);
    
    parameterDefs.forEach(def => {
      this.addParameter(
        def.id,
        def.name,
        def.defaultValue,
        def.min,
        def.max,
        def.defaultValue,
        def.unit,
        def.step,
        def.logarithmic
      );
    });
  }

  private addParameter(
    id: string, 
    name: string, 
    defaultValue: number,
    min: number, 
    max: number, 
    value: number,
    unit?: string, 
    step?: number, 
    logarithmic?: boolean
  ): void {
    this._parameters.set(id, {
      id,
      name,
      value,
      min,
      max,
      defaultValue,
      unit,
      step,
      logarithmic
    });
    this.state.parameters[id] = value;
  }

  private getModuleName(type: ModuleType): string {
    const names: Record<ModuleType, string> = {
      [ModuleType.PARAMETRIC_EQ]: 'Égaliseur Paramétrique',
      [ModuleType.GRAPHIC_EQ]: 'Égaliseur Graphique',
      [ModuleType.MULTIBAND_EQ]: 'Égaliseur Multibande',
      [ModuleType.COMPRESSOR]: 'Compresseur',
      [ModuleType.LIMITER]: 'Limiteur',
      [ModuleType.GATE]: 'Gate',
      [ModuleType.MULTIBAND_COMPRESSOR]: 'Compresseur Multibande',
      [ModuleType.DE_ESSER]: 'De-Esser',
      [ModuleType.REVERB]: 'Réverbération',
      [ModuleType.DELAY]: 'Delay',
      [ModuleType.CHORUS]: 'Chorus',
      [ModuleType.FLANGER]: 'Flanger',
      [ModuleType.PHASER]: 'Phaser',
      [ModuleType.DISTORTION]: 'Distorsion',
      [ModuleType.PITCH_SHIFTER]: 'Pitch Shifter',
      [ModuleType.HARMONIZER]: 'Harmoniseur',
      [ModuleType.OSCILLOSCOPE]: 'Oscilloscope',
      [ModuleType.LEVEL_METER]: 'Indicateur de Niveau',
      [ModuleType.NOISE_REDUCER]: 'Réducteur de Bruit',
      [ModuleType.STEREO_ENHANCER]: 'Élargisseur Stéréo'
    };
    return names[type] || type;
  }

  private getModuleCategory(type: ModuleType): string {
    if ([ModuleType.PARAMETRIC_EQ, ModuleType.GRAPHIC_EQ, ModuleType.MULTIBAND_EQ].includes(type)) {
      return 'Égalisation';
    }
    if ([ModuleType.COMPRESSOR, ModuleType.LIMITER, ModuleType.GATE, ModuleType.MULTIBAND_COMPRESSOR, ModuleType.DE_ESSER].includes(type)) {
      return 'Dynamique';
    }
    if ([ModuleType.REVERB, ModuleType.DELAY, ModuleType.CHORUS, ModuleType.FLANGER, ModuleType.PHASER, ModuleType.DISTORTION, ModuleType.PITCH_SHIFTER, ModuleType.HARMONIZER].includes(type)) {
      return 'Effets';
    }
    return 'Analyse';
  }

  // Méthodes pour les presets
  deletePreset(presetId: string): void {
    console.log(`Suppression du preset: ${presetId}`);
    // TODO: Implémenter la suppression réelle des presets
  }

  // Méthodes pour les visualiseurs
  getSpectrumData(fftSize: number): Float32Array {
    // Génération de données de spectre simulées
    const data = new Float32Array(fftSize / 2);
    for (let i = 0; i < data.length; i++) {
      // Simulation d'un spectre audio décroissant
      const freq = (i / data.length) * 20000; // 0-20kHz
      const magnitude = -30 - (Math.log10(freq + 1) * 20) + (Math.random() * 10 - 5);
      data[i] = Math.max(-90, magnitude);
    }
    return data;
  }

  getWaveformData(bufferSize: number): { left: Float32Array; right: Float32Array } {
    // Génération de données de forme d'onde simulées
    const left = new Float32Array(bufferSize);
    const right = new Float32Array(bufferSize);
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      // Onde sinusoïdale avec harmoniques
      left[i] = Math.sin(2 * Math.PI * 440 * t + time) * 0.5 +
                Math.sin(2 * Math.PI * 880 * t + time) * 0.2 +
                Math.sin(2 * Math.PI * 1320 * t + time) * 0.1;
      right[i] = Math.sin(2 * Math.PI * 440 * t + time + 0.5) * 0.5 +
                 Math.sin(2 * Math.PI * 880 * t + time + 0.5) * 0.2 +
                 Math.sin(2 * Math.PI * 1320 * t + time + 0.5) * 0.1;
    }
    
    return { left, right };
  }
}