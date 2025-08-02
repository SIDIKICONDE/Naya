/**
 * Interface de base pour tous les modules audio
 * @module AudioModule
 */

import { AudioBuffer, AudioParameter, ModuleState, ModuleMetadata, AudioEvent, PerformanceMetrics } from '../types/AudioTypes';

/**
 * Interface de base pour tous les modules de traitement audio
 */
export interface IAudioModule {
  /** Métadonnées du module */
  readonly metadata: ModuleMetadata;
  
  /** État actuel du module */
  state: ModuleState;
  
  /** Paramètres du module */
  readonly parameters: ReadonlyMap<string, AudioParameter>;
  
  /**
   * Initialise le module avec la configuration audio
   * @param sampleRate Fréquence d'échantillonnage
   * @param bufferSize Taille du buffer
   */
  initialize(sampleRate: number, bufferSize: number): Promise<void>;
  
  /**
   * Traite un buffer audio
   * @param input Buffer d'entrée
   * @param output Buffer de sortie (peut être le même que l'entrée)
   * @returns Buffer traité
   */
  process(input: AudioBuffer, output?: AudioBuffer): AudioBuffer;
  
  /**
   * Définit la valeur d'un paramètre
   * @param parameterId ID du paramètre
   * @param value Nouvelle valeur
   */
  setParameter(parameterId: string, value: number): void;
  
  /**
   * Récupère la valeur d'un paramètre
   * @param parameterId ID du paramètre
   * @returns Valeur actuelle
   */
  getParameter(parameterId: string): number;
  
  /**
   * Active ou désactive le module
   * @param enabled État d'activation
   */
  setEnabled(enabled: boolean): void;
  
  /**
   * Active ou désactive le bypass
   * @param bypassed État de bypass
   */
  setBypassed(bypassed: boolean): void;
  
  /**
   * Réinitialise le module à son état par défaut
   */
  reset(): void;
  
  /**
   * Charge un état sauvegardé
   * @param state État à charger
   */
  loadState(state: ModuleState): void;
  
  /**
   * Sauvegarde l'état actuel
   * @returns État actuel
   */
  saveState(): ModuleState;
  
  /**
   * Obtient les métriques de performance
   * @returns Métriques actuelles
   */
  getPerformanceMetrics(): PerformanceMetrics;
  
  /**
   * Libère les ressources
   */
  dispose(): void;
  
  /**
   * Enregistre un écouteur d'événements
   * @param callback Fonction de rappel
   */
  addEventListener(callback: (event: AudioEvent) => void): void;
  
  /**
   * Supprime un écouteur d'événements
   * @param callback Fonction de rappel
   */
  removeEventListener(callback: (event: AudioEvent) => void): void;
}

/**
 * Classe de base abstraite pour les modules audio
 */
export abstract class BaseAudioModule implements IAudioModule {
  abstract readonly metadata: ModuleMetadata;
  public state: ModuleState;
  protected _parameters: Map<string, AudioParameter>;
  protected _sampleRate: number = 48000;
  protected _bufferSize: number = 512;
  private _eventListeners: Set<(event: AudioEvent) => void> = new Set();
  private _performanceMetrics: PerformanceMetrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    latency: 0,
    bufferUnderruns: 0,
    processingTime: 0
  };

  constructor() {
    this._parameters = new Map();
    this.state = {
      enabled: true,
      bypassed: false,
      parameters: {}
    };
  }

  get parameters(): ReadonlyMap<string, AudioParameter> {
    return this._parameters;
  }

  async initialize(sampleRate: number, bufferSize: number): Promise<void> {
    this._sampleRate = sampleRate;
    this._bufferSize = bufferSize;
    this.initializeParameters();
    await this.onInitialize();
  }

  abstract process(input: AudioBuffer, output?: AudioBuffer): AudioBuffer;

  setParameter(parameterId: string, value: number): void {
    const param = this._parameters.get(parameterId);
    if (!param) {
      throw new Error(`Parameter ${parameterId} not found`);
    }

    const clampedValue = Math.max(param.min, Math.min(param.max, value));
    param.value = clampedValue;
    this.state.parameters[parameterId] = clampedValue;
    
    this.emitEvent({
      type: 'PARAMETER_CHANGED' as any,
      source: this.metadata.id,
      timestamp: Date.now(),
      data: { parameterId, value: clampedValue }
    });

    this.onParameterChanged(parameterId, clampedValue);
  }

  getParameter(parameterId: string): number {
    const param = this._parameters.get(parameterId);
    if (!param) {
      throw new Error(`Parameter ${parameterId} not found`);
    }
    return param.value;
  }

  setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
    this.emitEvent({
      type: 'STATE_CHANGED' as any,
      source: this.metadata.id,
      timestamp: Date.now(),
      data: { enabled }
    });
  }

  setBypassed(bypassed: boolean): void {
    this.state.bypassed = bypassed;
    this.emitEvent({
      type: 'STATE_CHANGED' as any,
      source: this.metadata.id,
      timestamp: Date.now(),
      data: { bypassed }
    });
  }

  reset(): void {
    this._parameters.forEach((param) => {
      param.value = param.defaultValue;
      this.state.parameters[param.id] = param.defaultValue;
    });
    this.state.enabled = true;
    this.state.bypassed = false;
    this.onReset();
  }

  loadState(state: ModuleState): void {
    this.state = { ...state };
    Object.entries(state.parameters).forEach(([id, value]) => {
      if (this._parameters.has(id)) {
        this.setParameter(id, value);
      }
    });
  }

  saveState(): ModuleState {
    return {
      ...this.state,
      parameters: { ...this.state.parameters }
    };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this._performanceMetrics };
  }

  dispose(): void {
    this._eventListeners.clear();
    this.onDispose();
  }

  addEventListener(callback: (event: AudioEvent) => void): void {
    this._eventListeners.add(callback);
  }

  removeEventListener(callback: (event: AudioEvent) => void): void {
    this._eventListeners.delete(callback);
  }

  protected emitEvent(event: AudioEvent): void {
    this._eventListeners.forEach(callback => callback(event));
  }

  protected updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    this._performanceMetrics = { ...this._performanceMetrics, ...metrics };
  }

  /** Méthodes à implémenter par les sous-classes */
  protected abstract initializeParameters(): void;
  protected abstract onInitialize(): Promise<void>;
  protected abstract onParameterChanged(parameterId: string, value: number): void;
  protected abstract onReset(): void;
  protected abstract onDispose(): void;
}