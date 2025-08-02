/**
 * Utilitaires et helpers pour l'interface audio
 * Fonctions pratiques pour simplifier l'utilisation
 */

import { audioInterface, ModuleType, AudioConfig } from './AudioInterface';

// ==================== FACTORY DE CONFIGURATION ====================

export class AudioConfigFactory {
  static createHighQualityConfig(): AudioConfig {
    return {
      sampleRate: 96000,
      channels: 2,
      bufferSize: 256,
      format: 'FLOAT_32',
      latency: 5
    };
  }

  static createStandardConfig(): AudioConfig {
    return {
      sampleRate: 48000,
      channels: 2,
      bufferSize: 512,
      format: 'FLOAT_32',
      latency: 10
    };
  }

  static createLowLatencyConfig(): AudioConfig {
    return {
      sampleRate: 48000,
      channels: 2,
      bufferSize: 128,
      format: 'FLOAT_32',
      latency: 3
    };
  }
}

// ==================== BUILDER DE CHAÎNE AUDIO ====================

export class AudioChainBuilder {
  private moduleIds: string[] = [];
  private chainName: string = '';

  constructor(name: string = 'Audio Chain') {
    this.chainName = name;
  }

  // Ajouter un égaliseur paramétrique
  addParametricEQ(config?: {
    bands?: Array<{ frequency: number; gain: number; q: number }>;
    outputGain?: number;
  }): AudioChainBuilder {
    const moduleId = audioInterface.createModule(ModuleType.PARAMETRIC_EQ, config);
    this.moduleIds.push(moduleId);
    return this;
  }

  // Ajouter un compresseur
  addCompressor(config?: {
    threshold?: number;
    ratio?: number;
    attack?: number;
    release?: number;
    makeupGain?: number;
  }): AudioChainBuilder {
    const moduleId = audioInterface.createModule(ModuleType.COMPRESSOR, config);
    this.moduleIds.push(moduleId);
    return this;
  }

  // Ajouter une réverbération
  addReverb(config?: {
    type?: string;
    roomSize?: number;
    damping?: number;
    wetLevel?: number;
  }): AudioChainBuilder {
    const moduleId = audioInterface.createModule(ModuleType.REVERB, config);
    this.moduleIds.push(moduleId);
    return this;
  }

  // Ajouter un delay
  addDelay(config?: {
    time?: number;
    feedback?: number;
    mix?: number;
  }): AudioChainBuilder {
    const moduleId = audioInterface.createModule(ModuleType.DELAY, config);
    this.moduleIds.push(moduleId);
    return this;
  }

  // Ajouter un limiteur
  addLimiter(config?: {
    threshold?: number;
    release?: number;
    ceiling?: number;
  }): AudioChainBuilder {
    const moduleId = audioInterface.createModule(ModuleType.LIMITER, config);
    this.moduleIds.push(moduleId);
    return this;
  }


  // Construire et connecter la chaîne
  build(): AudioChain {
    // Connecter les modules en série
    for (let i = 0; i < this.moduleIds.length - 1; i++) {
      audioInterface.connectModules(this.moduleIds[i], this.moduleIds[i + 1]);
    }

    return new AudioChain(this.chainName, this.moduleIds);
  }
}

// ==================== GESTIONNAIRE DE CHAÎNE ====================

export class AudioChain {
  constructor(
    public readonly name: string,
    public readonly moduleIds: string[]
  ) {}

  // Activer/désactiver toute la chaîne
  setEnabled(enabled: boolean): void {
    this.moduleIds.forEach(moduleId => {
      const module = audioInterface.getModule(moduleId);
      if (module) {
        module.setEnabled(enabled);
      }
    });
  }

  // Bypass toute la chaîne
  setBypassed(bypassed: boolean): void {
    this.moduleIds.forEach(moduleId => {
      const module = audioInterface.getModule(moduleId);
      if (module) {
        module.setBypassed(bypassed);
      }
    });
  }

  // Réinitialiser tous les modules
  reset(): void {
    this.moduleIds.forEach(moduleId => {
      const module = audioInterface.getModule(moduleId);
      if (module) {
        module.reset();
      }
    });
  }

  // Supprimer la chaîne
  destroy(): void {
    this.moduleIds.forEach(moduleId => {
      audioInterface.removeModule(moduleId);
    });
  }

  // Obtenir un module par son index dans la chaîne
  getModule(index: number) {
    if (index >= 0 && index < this.moduleIds.length) {
      return audioInterface.getModule(this.moduleIds[index]);
    }
    return undefined;
  }

  // Obtenir les métadonnées de tous les modules
  getModulesInfo() {
    return this.moduleIds.map(moduleId => {
      const module = audioInterface.getModule(moduleId);
      return module ? module.metadata : null;
    }).filter(Boolean);
  }
}

// ==================== PRESETS PRÉDÉFINIS ====================

export class AudioPresets {
  
  // Chaîne de mastering vocal
  static createVocalMasteringChain(): AudioChain {
    return new AudioChainBuilder('Vocal Mastering')
      .addParametricEQ({
        bands: [
          { frequency: 80, gain: -6, q: 0.7 },    // Filtre passe-haut
          { frequency: 3000, gain: 2, q: 1.2 },   // Présence
          { frequency: 10000, gain: 1.5, q: 0.8 } // Air
        ]
      })
      .addCompressor({
        threshold: -18,
        ratio: 3,
        attack: 5,
        release: 80,
        makeupGain: 3
      })
      .addDelay({
        time: 125,
        feedback: 0.2,
        mix: 0.15
      })
      .addReverb({
        type: 'HALL',
        roomSize: 0.4,
        damping: 0.6,
        wetLevel: 0.2
      })
      .addLimiter({
        threshold: -2,
        release: 50
      })
      .build();
  }

  // Chaîne pour instruments
  static createInstrumentChain(): AudioChain {
    return new AudioChainBuilder('Instrument Processing')
      .addParametricEQ({
        bands: [
          { frequency: 40, gain: -12, q: 0.5 },   // Nettoyage grave
          { frequency: 2000, gain: 1, q: 1.0 },   // Définition
          { frequency: 8000, gain: 0.5, q: 0.7 }  // Brillance
        ]
      })
      .addCompressor({
        threshold: -15,
        ratio: 2.5,
        attack: 10,
        release: 120,
        makeupGain: 2
      })
      .build();
  }

  // Chaîne d'analyse
  static createAnalysisChain(): AudioChain {
    return new AudioChainBuilder('Analysis Chain')
      .build();
  }

  // Chaîne de nettoyage audio
  static createAudioCleanupChain(): AudioChain {
    return new AudioChainBuilder('Audio Cleanup')
      .addParametricEQ({
        bands: [
          { frequency: 50, gain: -18, q: 0.7 },   // Rumble
          { frequency: 1000, gain: 0, q: 5.0 }    // Notch si nécessaire
        ]
      })
      .addCompressor({
        threshold: -20,
        ratio: 1.5,
        attack: 1,
        release: 200,
        makeupGain: 1
      })
      .addLimiter({
        threshold: -1,
        release: 30
      })
      .build();
  }
}

// ==================== UTILITAIRES DE CONVERSION ====================

export class AudioConversionUtils {
  
  // Conversion dB vers valeur linéaire
  static dbToLinear(db: number): number {
    return Math.pow(10, db / 20);
  }

  // Conversion valeur linéaire vers dB
  static linearToDb(linear: number): number {
    return 20 * Math.log10(Math.max(linear, 0.000001)); // Éviter log(0)
  }

  // Conversion Hz vers note musicale
  static frequencyToNote(frequency: number): string {
    const A4 = 440;
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const noteNumber = Math.round(12 * Math.log2(frequency / A4) + 69);
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = notes[noteNumber % 12];
    
    return `${note}${octave}`;
  }

  // Conversion note vers fréquence
  static noteToFrequency(note: string): number {
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return 440;
    
    const noteName = match[1];
    const octave = parseInt(match[2]);
    
    const noteNumber = noteMap[noteName] + (octave + 1) * 12;
    return 440 * Math.pow(2, (noteNumber - 69) / 12);
  }

  // Calcul de Q à partir de la largeur de bande en octaves
  static bandwidthToQ(bandwidth: number): number {
    return 1 / (2 * Math.sinh(Math.log(2) / 2 * bandwidth));
  }

  // Calcul de la largeur de bande à partir de Q
  static qToBandwidth(q: number): number {
    return 2 * Math.asinh(1 / (2 * q)) / Math.log(2);
  }
}

// ==================== GESTIONNAIRE D'ÉVÉNEMENTS SIMPLIFIÉS ====================

export class AudioEventManager {
  private static instance: AudioEventManager;
  private eventHandlers: Map<string, Set<Function>> = new Map();

  static getInstance(): AudioEventManager {
    if (!AudioEventManager.instance) {
      AudioEventManager.instance = new AudioEventManager();
    }
    return AudioEventManager.instance;
  }

  // Écouter les changements de paramètres
  onParameterChange(moduleId: string, callback: (parameterId: string, value: number) => void): void {
    const key = `parameter_${moduleId}`;
    if (!this.eventHandlers.has(key)) {
      this.eventHandlers.set(key, new Set());
    }
    this.eventHandlers.get(key)!.add(callback);

    // S'abonner aux événements de l'interface audio
    audioInterface.addEventListener((event) => {
      if (event.type === 'PARAMETER_CHANGED' && event.source === moduleId) {
        callback(event.data.parameterId, event.data.value);
      }
    });
  }

  // Écouter les changements d'état des modules
  onModuleStateChange(callback: (moduleId: string, enabled: boolean, bypassed: boolean) => void): void {
    audioInterface.addEventListener((event) => {
      if (event.type === 'STATE_CHANGED') {
        const { enabled, bypassed } = event.data;
        callback(event.source, enabled, bypassed);
      }
    });
  }

  // Écouter l'ajout/suppression de modules
  onModuleChange(callback: (action: 'added' | 'removed', moduleId: string, type?: string) => void): void {
    audioInterface.addEventListener((event) => {
      if (event.type === 'MODULE_ADDED') {
        callback('added', event.data.moduleId, event.data.type);
      } else if (event.type === 'MODULE_REMOVED') {
        callback('removed', event.data.moduleId);
      }
    });
  }
}

// ==================== MONITEUR DE PERFORMANCE ====================

export class AudioPerformanceMonitor {
  private monitoring: boolean = false;
  private metricsHistory: Array<{ timestamp: number; metrics: any }> = [];
  private maxHistorySize: number = 1000;

  start(): void {
    if (this.monitoring) return;
    
    this.monitoring = true;
    this.collectMetrics();
  }

  stop(): void {
    this.monitoring = false;
  }

  getLatestMetrics() {
    return audioInterface.getPerformanceMetrics();
  }

  getMetricsHistory() {
    return [...this.metricsHistory];
  }

  clearHistory(): void {
    this.metricsHistory = [];
  }

  private collectMetrics(): void {
    if (!this.monitoring) return;

    try {
      const metrics = audioInterface.getPerformanceMetrics();
      this.metricsHistory.push({
        timestamp: Date.now(),
        metrics
      });

      // Limiter la taille de l'historique
      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory.shift();
      }
    } catch (error) {
      console.warn('Erreur lors de la collecte des métriques:', error);
    }

    // Prochaine collecte
    setTimeout(() => this.collectMetrics(), 100); // 10 FPS
  }

  // Alertes de performance
  onPerformanceIssue(callback: (issue: string, severity: 'warning' | 'error') => void): void {
    audioInterface.addEventListener(() => {
      const metrics = this.getLatestMetrics();
      
      if (metrics.cpuUsage > 80) {
        callback(`CPU élevé: ${metrics.cpuUsage.toFixed(1)}%`, 'warning');
      }
      
      if (metrics.cpuUsage > 95) {
        callback(`CPU critique: ${metrics.cpuUsage.toFixed(1)}%`, 'error');
      }
      
      if (metrics.latency > 50) {
        callback(`Latence élevée: ${metrics.latency.toFixed(1)}ms`, 'warning');
      }
    });
  }
}

// Export des instances singleton
export const audioEventManager = AudioEventManager.getInstance();
export const audioPerformanceMonitor = new AudioPerformanceMonitor();