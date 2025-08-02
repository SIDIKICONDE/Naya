/**
 * Interface Audio Professionnelle - Version refactorisée
 * Architecture modulaire complète pour traitement audio temps réel
 */

import { AUDIO_CONFIG } from '../config/audio.config';
import { AudioEngineNativeMock } from '../native/AudioEngineMock';
import { AudioModuleWrapper } from './AudioModuleWrapper';
import { 
  AudioConfig, 
  IAudioModule, 
  AudioEvent, 
  AudioEventCallback, 
  ModuleMetadata,
  PerformanceMetrics 
} from './types';
import { ModuleType } from './enums';

// Sélection automatique entre mock et production
const AudioEngineNative = AUDIO_CONFIG.USE_MOCK 
  ? AudioEngineNativeMock 
  : AudioEngineNativeMock; // TODO: Remplacer par le vrai module natif

// ==================== GESTIONNAIRE PRINCIPAL ====================

export class AudioInterface {
  private static instance: AudioInterface;
  private initialized: boolean = false;
  private modules: Map<string, IAudioModule> = new Map();
  private eventListeners: Set<AudioEventCallback> = new Set();
  private config: AudioConfig;

  private constructor() {
    this.config = {
      sampleRate: 48000,
      channels: 2,
      bufferSize: 512,
      format: 'FLOAT_32'
    };
  }

  static getInstance(): AudioInterface {
    if (!AudioInterface.instance) {
      AudioInterface.instance = new AudioInterface();
    }
    return AudioInterface.instance;
  }

  // ==================== INITIALISATION ====================

  async initialize(config: Partial<AudioConfig> = {}): Promise<void> {
    if (this.initialized) {
      throw new Error('AudioInterface déjà initialisée');
    }

    // Utiliser les valeurs par défaut de la configuration
    this.config = { 
      sampleRate: AUDIO_CONFIG.DEFAULT_SAMPLE_RATE,
      bufferSize: AUDIO_CONFIG.DEFAULT_BUFFER_SIZE,
      channels: AUDIO_CONFIG.DEFAULT_CHANNELS,
      format: 'FLOAT_32',
      ...config 
    };
    
    if (AUDIO_CONFIG.LOG_AUDIO_EVENTS) {
      console.log(`[AudioInterface] Initialisation avec ${AUDIO_CONFIG.USE_MOCK ? 'MOCK' : 'NATIF'}`, this.config);
    }
    
    const success = await AudioEngineNative.initialize(
      this.config.sampleRate,
      this.config.bufferSize,
      this.config.channels
    );

    if (!success) {
      throw new Error('Échec de l\'initialisation du moteur audio');
    }

    this.initialized = true;
    this.emitEvent({
      type: 'STATE_CHANGED',
      source: 'AudioInterface',
      timestamp: Date.now(),
      data: { initialized: true }
    });

    if (AUDIO_CONFIG.LOG_AUDIO_EVENTS) {
      console.log('[AudioInterface] Initialisation terminée avec succès');
    }
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    await this.stopProcessing();
    
    for (const [id, module] of this.modules) {
      module.dispose();
      AudioEngineNative.destroyModule(id);
    }
    this.modules.clear();

    await AudioEngineNative.shutdown();
    this.initialized = false;
  }

  // ==================== GESTION DES MODULES ====================

  createModule(type: ModuleType, config?: any): string {
    this.checkInitialized();

    const moduleId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Créer le module natif
    const nativeId = AudioEngineNative.createModule(
      type,
      JSON.stringify(config || {})
    );

    // Créer le wrapper TypeScript
    const module = new AudioModuleWrapper(type, nativeId, moduleId);
    this.modules.set(moduleId, module);

    this.emitEvent({
      type: 'MODULE_ADDED',
      source: 'AudioInterface',
      timestamp: Date.now(),
      data: { moduleId, type, nativeId }
    });

    return moduleId;
  }

  removeModule(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} introuvable`);
    }

    module.dispose();
    const nativeId = (module as any).nativeId;
    AudioEngineNative.destroyModule(nativeId);
    this.modules.delete(moduleId);

    this.emitEvent({
      type: 'MODULE_REMOVED',
      source: 'AudioInterface',
      timestamp: Date.now(),
      data: { moduleId }
    });
  }

  getModule(moduleId: string): IAudioModule | undefined {
    return this.modules.get(moduleId);
  }

  listModules(): Array<{ id: string; metadata: ModuleMetadata }> {
    return Array.from(this.modules.entries()).map(([id, module]) => ({
      id,
      metadata: module.metadata
    }));
  }

  // ==================== CONNEXIONS ENTRE MODULES ====================

  connectModules(sourceId: string, targetId: string, 
                sourceOutput: number = 0, targetInput: number = 0): void {
    this.checkInitialized();
    
    const source = this.modules.get(sourceId);
    const target = this.modules.get(targetId);
    
    if (!source || !target) {
      throw new Error('IDs de modules invalides');
    }

    const sourceNativeId = (source as any).nativeId;
    const targetNativeId = (target as any).nativeId;

    AudioEngineNative.connectModules(
      sourceNativeId,
      sourceOutput,
      targetNativeId,
      targetInput
    );
  }

  disconnectModules(sourceId: string, targetId: string): void {
    this.checkInitialized();
    
    const source = this.modules.get(sourceId);
    const target = this.modules.get(targetId);
    
    if (!source || !target) {
      throw new Error('IDs de modules invalides');
    }

    const sourceNativeId = (source as any).nativeId;
    const targetNativeId = (target as any).nativeId;

    AudioEngineNative.disconnectModules(sourceNativeId, targetNativeId);
  }

  // ==================== CONTRÔLE DU TRAITEMENT ====================

  async startProcessing(): Promise<void> {
    this.checkInitialized();
    await AudioEngineNative.startProcessing();
  }

  async stopProcessing(): Promise<void> {
    this.checkInitialized();
    await AudioEngineNative.stopProcessing();
  }

  isProcessing(): boolean {
    return this.initialized && AudioEngineNative.isProcessing();
  }

  // ==================== MÉTRIQUES ET ANALYSE ====================

  getPerformanceMetrics(): PerformanceMetrics {
    this.checkInitialized();
    const metricsJson = AudioEngineNative.getPerformanceMetrics();
    return JSON.parse(metricsJson);
  }

  getAudioMetrics(): any {
    this.checkInitialized();
    try {
      const metricsJson = AudioEngineNative.getAudioMetrics();
      return JSON.parse(metricsJson);
    } catch (error) {
      // Retourner des valeurs par défaut si pas de données
      return {
        peak: { left: -60, right: -60 },
        rms: { left: -60, right: -60 },
        lufs: { momentary: -60, shortTerm: -60, integrated: -60, range: 0 },
        truePeak: { left: -60, right: -60 },
        correlation: 0,
        phase: 0,
        crestFactor: 0,
        dynamicRange: 0
      };
    }
  }

  // ==================== PRESETS ====================

  savePreset(name: string, category: string = 'User'): string {
    this.checkInitialized();
    return AudioEngineNative.savePreset(name, category);
  }

  loadPreset(presetId: string): void {
    this.checkInitialized();
    AudioEngineNative.loadPreset(presetId);
  }

  listPresets(): Array<{ id: string; name: string; category: string }> {
    this.checkInitialized();
    const presetsJson = AudioEngineNative.listPresets();
    return JSON.parse(presetsJson);
  }

  exportState(): string {
    this.checkInitialized();
    return AudioEngineNative.exportState();
  }

  importState(state: string): void {
    this.checkInitialized();
    AudioEngineNative.importState(state);
  }

  // ==================== ÉVÉNEMENTS ====================

  addEventListener(callback: AudioEventCallback): void {
    this.eventListeners.add(callback);
  }

  removeEventListener(callback: AudioEventCallback): void {
    this.eventListeners.delete(callback);
  }

  private emitEvent(event: AudioEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }

  // ==================== UTILITAIRES ====================

  getAvailableModuleTypes(): ModuleType[] {
    return Object.values(ModuleType);
  }

  validatePipeline(): string[] {
    this.checkInitialized();
    const errorsJson = AudioEngineNative.validatePipeline();
    return JSON.parse(errorsJson);
  }

  optimizePipeline(): void {
    this.checkInitialized();
    AudioEngineNative.optimizePipeline();
  }

  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('AudioInterface non initialisée. Appelez initialize() d\'abord.');
    }
  }
}

// Export de l'instance singleton
export const audioInterface = AudioInterface.getInstance();

// Re-export des types nécessaires
export * from './types';
export * from './enums';