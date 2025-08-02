/**
 * Système de pipeline et de routage audio
 * @module AudioPipeline
 */

import { 
  AudioBuffer, 
  AudioConfig, 
  ModuleConnection, 
  ConnectionType,
  AudioEvent,
  PerformanceMetrics 
} from '../types/AudioTypes';
import { IAudioModule } from './AudioModule';

/**
 * Nœud dans le graphe audio
 */
export interface AudioNode {
  id: string;
  module: IAudioModule;
  inputs: AudioPort[];
  outputs: AudioPort[];
  position?: { x: number; y: number }; // Pour l'UI
}

/**
 * Port d'entrée/sortie audio
 */
export interface AudioPort {
  id: string;
  name: string;
  type: ConnectionType;
  channels: number;
  connected: boolean;
}

/**
 * Configuration du pipeline
 */
export interface PipelineConfig {
  name: string;
  description?: string;
  sampleRate: number;
  bufferSize: number;
  channels: number;
  maxLatency?: number;
  parallelProcessing?: boolean;
}

/**
 * État du pipeline
 */
export interface PipelineState {
  nodes: Map<string, AudioNode>;
  connections: ModuleConnection[];
  config: PipelineConfig;
  running: boolean;
  bypassed: boolean;
}

/**
 * Interface du pipeline audio principal
 */
export interface IAudioPipeline {
  /** Configuration actuelle */
  readonly config: PipelineConfig;
  
  /** État actuel */
  readonly state: PipelineState;
  
  /**
   * Ajoute un module au pipeline
   * @param module Module à ajouter
   * @param position Position dans l'UI (optionnel)
   * @returns ID du nœud créé
   */
  addModule(module: IAudioModule, position?: { x: number; y: number }): string;
  
  /**
   * Retire un module du pipeline
   * @param nodeId ID du nœud à retirer
   */
  removeModule(nodeId: string): void;
  
  /**
   * Connecte deux modules
   * @param connection Détails de la connexion
   */
  connect(connection: ModuleConnection): void;
  
  /**
   * Déconnecte deux modules
   * @param sourceId ID du module source
   * @param targetId ID du module cible
   */
  disconnect(sourceId: string, targetId: string): void;
  
  /**
   * Traite un buffer audio à travers le pipeline
   * @param input Buffer d'entrée
   * @returns Buffer de sortie traité
   */
  process(input: AudioBuffer): AudioBuffer;
  
  /**
   * Démarre le traitement
   */
  start(): Promise<void>;
  
  /**
   * Arrête le traitement
   */
  stop(): Promise<void>;
  
  /**
   * Active/désactive le bypass global
   * @param bypassed État de bypass
   */
  setBypassed(bypassed: boolean): void;
  
  /**
   * Obtient l'ordre de traitement optimisé
   * @returns Liste ordonnée des IDs de nœuds
   */
  getProcessingOrder(): string[];
  
  /**
   * Calcule la latence totale
   * @returns Latence en échantillons
   */
  getTotalLatency(): number;
  
  /**
   * Obtient les métriques de performance
   * @returns Métriques globales
   */
  getPerformanceMetrics(): PerformanceMetrics;
  
  /**
   * Sauvegarde l'état du pipeline
   * @returns État sérialisé
   */
  saveState(): string;
  
  /**
   * Charge un état sauvegardé
   * @param state État sérialisé
   */
  loadState(state: string): void;
  
  /**
   * Valide le graphe audio
   * @returns Liste des erreurs de validation
   */
  validate(): ValidationError[];
  
  /**
   * Optimise le graphe audio
   */
  optimize(): void;
  
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
 * Erreur de validation du pipeline
 */
export interface ValidationError {
  type: 'CYCLE' | 'MISSING_CONNECTION' | 'INCOMPATIBLE_FORMAT' | 'LATENCY_EXCEEDED';
  nodeId?: string;
  message: string;
}

/**
 * Factory pour créer des modules
 */
export interface IModuleFactory {
  /**
   * Crée un module par son type
   * @param type Type du module
   * @param config Configuration initiale
   * @returns Module créé
   */
  createModule(type: string, config?: any): IAudioModule;
  
  /**
   * Obtient la liste des types disponibles
   * @returns Types de modules
   */
  getAvailableTypes(): string[];
  
  /**
   * Enregistre un nouveau type de module
   * @param type Nom du type
   * @param constructor Constructeur du module
   */
  registerModule(type: string, constructor: new() => IAudioModule): void;
}

/**
 * Gestionnaire de presets pour le pipeline
 */
export interface IPresetManager {
  /**
   * Sauvegarde un preset
   * @param name Nom du preset
   * @param category Catégorie (optionnel)
   */
  savePreset(name: string, category?: string): void;
  
  /**
   * Charge un preset
   * @param id ID du preset
   */
  loadPreset(id: string): void;
  
  /**
   * Liste les presets disponibles
   * @param category Filtrer par catégorie (optionnel)
   * @returns Liste des presets
   */
  listPresets(category?: string): PresetInfo[];
  
  /**
   * Supprime un preset
   * @param id ID du preset
   */
  deletePreset(id: string): void;
  
  /**
   * Exporte un preset
   * @param id ID du preset
   * @returns Données du preset
   */
  exportPreset(id: string): string;
  
  /**
   * Importe un preset
   * @param data Données du preset
   * @returns ID du preset importé
   */
  importPreset(data: string): string;
}

/**
 * Information sur un preset
 */
export interface PresetInfo {
  id: string;
  name: string;
  category?: string;
  description?: string;
  author?: string;
  created: Date;
  modified: Date;
  tags?: string[];
  thumbnail?: string;
}