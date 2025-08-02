/**
 * Mock de l'AudioEngine natif pour le développement
 * Simule toutes les fonctionnalités sans code C++
 */

import { mockDataGenerator, MockLevelData } from './MockDataGenerator';

export interface MockModule {
  id: string;
  type: string;
  enabled: boolean;
  bypassed: boolean;
  parameters: Record<string, number>;
}

export interface MockMetrics {
  cpuUsage: number;
  memoryUsage: number;
  latency: number;
  processingTime: number;
}

export interface MockAudioMetrics {
  peak: { left: number; right: number };
  rms: { left: number; right: number };
  lufs: { momentary: number; shortTerm: number; integrated: number; range: number };
  truePeak: { left: number; right: number };
  correlation: number;
  phase: number;
  crestFactor: number;
  dynamicRange: number;
}

class AudioEngineMock {
  private initialized: boolean = false;
  private processing: boolean = false;
  private modules: Map<string, MockModule> = new Map();
  private connections: Array<{source: string; target: string}> = [];
  private presets: Array<{id: string; name: string; category: string}> = [];
  private sampleRate: number = 48000;
  private bufferSize: number = 512;
  private channels: number = 2;
  private moduleCounter: number = 0;

  // Variables pour simuler des métriques audio en temps réel
  private animationFrame: number | null = null;
  private audioTime: number = 0;

  // ==================== INITIALISATION ====================

  async initialize(sampleRate: number, bufferSize: number, channels: number): Promise<boolean> {
    console.log(`[AudioEngineMock] Initialisation - ${sampleRate}Hz, ${bufferSize} samples, ${channels} canaux`);
    
    // Simuler un délai d'initialisation court
    await new Promise<void>(resolve => setTimeout(resolve, 100));
    
    this.sampleRate = sampleRate;
    this.bufferSize = bufferSize;
    this.channels = channels;
    this.initialized = true;
    
    // Créer quelques presets par défaut
    this.presets.push(
      { id: 'preset_1', name: 'Vocal Warm', category: 'Voix' },
      { id: 'preset_2', name: 'Master Clear', category: 'Mastering' },
      { id: 'preset_3', name: 'Bass Heavy', category: 'Instruments' }
    );
    
    console.log('[AudioEngineMock] Initialisation terminée avec succès');
    return true;
  }

  async shutdown(): Promise<void> {
    console.log('[AudioEngineMock] Arrêt du moteur audio');
    await this.stopProcessing();
    this.modules.clear();
    this.connections = [];
    this.initialized = false;
  }

  // ==================== GESTION DES MODULES ====================

  createModule(type: string, config: string): string {
    if (!this.initialized) {
      throw new Error('AudioEngine non initialisé');
    }

    const moduleId = `mock_module_${++this.moduleCounter}`;
    const configObj = config ? JSON.parse(config) : {};
    
    const module: MockModule = {
      id: moduleId,
      type,
      enabled: true,
      bypassed: false,
      parameters: this.getDefaultParametersForType(type)
    };

    this.modules.set(moduleId, module);
    console.log(`[AudioEngineMock] Module ${type} créé avec l'ID: ${moduleId}`);
    
    return moduleId;
  }

  destroyModule(moduleId: string): void {
    if (this.modules.has(moduleId)) {
      this.modules.delete(moduleId);
      // Supprimer les connexions liées à ce module
      this.connections = this.connections.filter(
        conn => conn.source !== moduleId && conn.target !== moduleId
      );
      console.log(`[AudioEngineMock] Module ${moduleId} supprimé`);
    }
  }

  setParameter(moduleId: string, parameterId: string, value: number): void {
    const module = this.modules.get(moduleId);
    if (module) {
      module.parameters[parameterId] = value;
      console.log(`[AudioEngineMock] ${moduleId}.${parameterId} = ${value}`);
    }
  }

  getParameter(moduleId: string, parameterId: string): number {
    const module = this.modules.get(moduleId);
    return module?.parameters[parameterId] ?? 0;
  }

  setModuleEnabled(moduleId: string, enabled: boolean): void {
    const module = this.modules.get(moduleId);
    if (module) {
      module.enabled = enabled;
      console.log(`[AudioEngineMock] Module ${moduleId} ${enabled ? 'activé' : 'désactivé'}`);
    }
  }

  setModuleBypassed(moduleId: string, bypassed: boolean): void {
    const module = this.modules.get(moduleId);
    if (module) {
      module.bypassed = bypassed;
      console.log(`[AudioEngineMock] Module ${moduleId} ${bypassed ? 'bypassé' : 'actif'}`);
    }
  }

  // ==================== CONNEXIONS ====================

  connectModules(sourceId: string, sourceOutput: number, targetId: string, targetInput: number): void {
    this.connections.push({ source: sourceId, target: targetId });
    console.log(`[AudioEngineMock] Connexion: ${sourceId}:${sourceOutput} -> ${targetId}:${targetInput}`);
  }

  disconnectModules(sourceId: string, targetId: string): void {
    this.connections = this.connections.filter(
      conn => !(conn.source === sourceId && conn.target === targetId)
    );
    console.log(`[AudioEngineMock] Déconnexion: ${sourceId} -> ${targetId}`);
  }

  // ==================== TRAITEMENT ====================

  async startProcessing(): Promise<void> {
    if (!this.initialized) {
      throw new Error('AudioEngine non initialisé');
    }
    
    this.processing = true;
    this.startMetricsSimulation();
    mockDataGenerator.start();
    console.log('[AudioEngineMock] Traitement audio démarré');
  }

  async stopProcessing(): Promise<void> {
    this.processing = false;
    this.stopMetricsSimulation();
    mockDataGenerator.stop();
    console.log('[AudioEngineMock] Traitement audio arrêté');
  }

  isProcessing(): boolean {
    return this.processing;
  }

  // ==================== MÉTRIQUES ====================

  getPerformanceMetrics(): string {
    const metrics: MockMetrics = {
      cpuUsage: this.processing ? 15 + Math.random() * 10 : 0,
      memoryUsage: 45 + Math.random() * 10,
      latency: this.bufferSize / this.sampleRate * 1000 + Math.random() * 2,
      processingTime: this.processing ? Math.random() * 5 : 0
    };
    
    return JSON.stringify(metrics);
  }

  getAudioMetrics(): string {
    // Utiliser le générateur de données réalistes
    const levelData = mockDataGenerator.generateLevelData();
    
    const metrics: MockAudioMetrics = {
      peak: levelData.peak,
      rms: levelData.rms,
      lufs: levelData.lufs,
      truePeak: levelData.truePeak,
      correlation: levelData.correlation,
      phase: levelData.phase,
      crestFactor: levelData.crestFactor,
      dynamicRange: levelData.dynamicRange
    };

    return JSON.stringify(metrics);
  }

  // ==================== PRESETS ====================

  savePreset(name: string, category: string): string {
    const presetId = `preset_${Date.now()}`;
    this.presets.push({ id: presetId, name, category });
    console.log(`[AudioEngineMock] Preset sauvegardé: ${name} (${presetId})`);
    return presetId;
  }

  loadPreset(presetId: string): void {
    const preset = this.presets.find(p => p.id === presetId);
    if (preset) {
      console.log(`[AudioEngineMock] Preset chargé: ${preset.name}`);
      // Simuler le chargement de paramètres
      this.modules.forEach(module => {
        Object.keys(module.parameters).forEach(param => {
          module.parameters[param] = Math.random();
        });
      });
    }
  }

  listPresets(): string {
    return JSON.stringify(this.presets);
  }

  exportState(): string {
    const state = {
      modules: Array.from(this.modules.entries()),
      connections: this.connections,
      sampleRate: this.sampleRate,
      bufferSize: this.bufferSize,
      channels: this.channels
    };
    return JSON.stringify(state);
  }

  importState(state: string): void {
    try {
      const stateObj = JSON.parse(state);
      this.modules = new Map(stateObj.modules);
      this.connections = stateObj.connections;
      console.log('[AudioEngineMock] État importé avec succès');
    } catch (error) {
      console.error('[AudioEngineMock] Erreur lors de l\'import:', error);
    }
  }

  // ==================== VALIDATION ====================

  validatePipeline(): string {
    const errors: string[] = [];
    
    // Simuler quelques validations
    if (this.modules.size === 0) {
      errors.push('Aucun module dans le pipeline');
    }
    
    if (this.connections.length === 0 && this.modules.size > 1) {
      errors.push('Modules non connectés');
    }
    
    return JSON.stringify(errors);
  }

  optimizePipeline(): void {
    console.log('[AudioEngineMock] Pipeline optimisé');
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private getDefaultParametersForType(type: string): Record<string, number> {
    switch (type) {
      case 'PARAMETRIC_EQ':
        const eqParams: Record<string, number> = {
          outputGain: 0
        };
        // Ajouter les paramètres pour 8 bandes
        for (let i = 0; i < 8; i++) {
          eqParams[`band${i}_enabled`] = 1;
          eqParams[`band${i}_frequency`] = 1000 * Math.pow(2, i-2);
          eqParams[`band${i}_gain`] = 0;
          eqParams[`band${i}_q`] = 0.7;
          eqParams[`band${i}_type`] = 0; // PEAK par défaut
        }
        return eqParams;
      
      case 'COMPRESSOR':
        return {
          // === CONTRÔLES PRINCIPAUX ===
          threshold: -12,
          ratio: 4,
          attack: 10,
          release: 100,
          knee: 2,
          makeupGain: 0,
          
          // === DÉTECTION AVANCÉE ===
          detectionMode: 0,
          lookahead: 5,
          stereoLink: 1,
          linkAmount: 100,
          rmsWindow: 10,
          
          // === SIDECHAIN ===
          sidechainEnabled: 0,
          sidechainHPF: 20,
          sidechainLPF: 20000,
          sidechainListen: 0,
          sidechainGain: 0,
          
          // === CARACTÈRE ET COULEUR ===
          saturation: 0,
          saturationType: 0,
          warmth: 0,
          punch: 0,
          
          // === CONTRÔLES AVANCÉS ===
          autoRelease: 0,
          autoMakeup: 0,
          adaptiveRelease: 0,
          programDependentRelease: 0,
          hold: 0,
          
          // === MIX ET ROUTING ===
          mix: 100,
          dryLevel: 0,
          wetLevel: 0,
          parallelCompression: 0,
          
          // === ANALYSE ET MONITORING ===
          inputLevel: -20,
          outputLevel: -20,
          gainReduction: 3,
          envelope: -25,
          
          // === MODES SPÉCIAUX ===
          vintageMode: 0,
          oversampling: 1,
          antiAliasing: 1,
          softClip: 0,
          brickwallLimit: 0
        };
      
      case 'REVERB':
        return {
          roomSize: 0.5,
          damping: 0.5,
          wetLevel: 0.3,
          dryLevel: 1,
          preDelay: 20,
          width: 1
        };
      
      case 'NOISE_REDUCER':
        return {
          // === DÉTECTION AUTOMATIQUE ===
          autoDetection: 1,
          autoThreshold: 1,
          adaptiveMode: 1,
          learningTime: 5,
          sensitivity: 0.7,
          
          // === RÉDUCTION DE BRUIT ===
          threshold: -40,
          reduction: 20,
          ratio: 4,
          attack: 5,
          release: 50,
          
          // === FILTRAGE SPECTRAL ===
          spectralSmoothing: 0.6,
          frequencySmoothing: 0.4,
          timeSmoothing: 0.5,
          windowSize: 2048,
          overlap: 0.75,
          
          // === BANDES FRÉQUENTIELLES ===
          lowFreqReduction: 15,
          midFreqReduction: 12,
          highFreqReduction: 18,
          lowFreqLimit: 200,
          highFreqLimit: 8000,
          
          // === PRÉSERVATION SIGNAL ===
          musicPreservation: 0.8,
          speechPreservation: 0.9,
          transientPreservation: 0.7,
          harmonicPreservation: 0.6,
          
          // === ALGORITHMES AVANCÉS ===
          algorithm: 2,
          qualityMode: 1,
          artificialReverbSuppression: 0.5,
          clickPopReduction: 0.8,
          
          // === CONTRÔLE EN TEMPS RÉEL ===
          realTimeProcessing: 1,
          lookahead: 10,
          adaptationSpeed: 0.5,
          noiseGating: 0.3,
          
          // === MONITORING ===
          noiseLevel: -45,
          reductionAmount: 12,
          signalToNoiseRatio: 25
        };
      
      default:
        return {
          enabled: 1,
          bypassed: 0
        };
    }
  }

  private startMetricsSimulation(): void {
    const updateMetrics = () => {
      if (this.processing) {
        this.audioTime += 0.1;
        this.animationFrame = requestAnimationFrame(updateMetrics);
      }
    };
    updateMetrics();
  }

  private stopMetricsSimulation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

// Export de l'instance singleton mock
export const AudioEngineNativeMock = new AudioEngineMock();