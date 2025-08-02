/**
 * Définitions des paramètres pour chaque type de module audio
 */

import { ModuleType } from './enums';
import { AudioParameter } from './types';

export type ParameterDefinition = Omit<AudioParameter, 'value'> & { defaultValue: number };

export function getModuleParameters(type: ModuleType): ParameterDefinition[] {
  const commonParams: ParameterDefinition[] = [
    { id: 'enabled', name: 'Activé', defaultValue: 1, min: 0, max: 1 },
    { id: 'bypassed', name: 'Bypass', defaultValue: 0, min: 0, max: 1 }
  ];

  switch (type) {
    case ModuleType.PARAMETRIC_EQ:
      return [
        ...commonParams,
        { id: 'outputGain', name: 'Gain Sortie', defaultValue: 0, min: -24, max: 24, unit: 'dB' },
        ...Array.from({ length: 8 }, (_, i) => [
          { id: `band${i}_enabled`, name: `Bande ${i+1} Activée`, defaultValue: 1, min: 0, max: 1 },
          { id: `band${i}_frequency`, name: `Bande ${i+1} Fréquence`, defaultValue: 1000 * Math.pow(2, i-2), min: 20, max: 20000, unit: 'Hz', step: 1, logarithmic: true },
          { id: `band${i}_gain`, name: `Bande ${i+1} Gain`, defaultValue: 0, min: -18, max: 18, unit: 'dB' },
          { id: `band${i}_q`, name: `Bande ${i+1} Q`, defaultValue: 0.7, min: 0.1, max: 10 },
          { id: `band${i}_type`, name: `Bande ${i+1} Type`, defaultValue: 0, min: 0, max: 4 }
        ]).flat()
      ];

    case ModuleType.COMPRESSOR:
      return [
        ...commonParams,
        // === CONTRÔLES PRINCIPAUX ===
        { id: 'threshold', name: 'Seuil', defaultValue: -12, min: -60, max: 0, unit: 'dB' },
        { id: 'ratio', name: 'Ratio', defaultValue: 4, min: 1, max: 100 }, // Jusqu'à 100:1 pour limiting
        { id: 'attack', name: 'Attaque', defaultValue: 10, min: 0.01, max: 500, unit: 'ms', logarithmic: true },
        { id: 'release', name: 'Relâchement', defaultValue: 100, min: 1, max: 5000, unit: 'ms', logarithmic: true },
        { id: 'knee', name: 'Knee', defaultValue: 2, min: 0, max: 20, unit: 'dB' },
        { id: 'makeupGain', name: 'Gain Compensation', defaultValue: 0, min: -24, max: 48, unit: 'dB' },
        
        // === DÉTECTION AVANCÉE ===
        { id: 'detectionMode', name: 'Mode Détection', defaultValue: 0, min: 0, max: 3 }, // 0=Peak, 1=RMS, 2=Feedback, 3=Feedforward
        { id: 'lookahead', name: 'Anticipation', defaultValue: 5, min: 0, max: 50, unit: 'ms' },
        { id: 'stereoLink', name: 'Liaison Stéréo', defaultValue: 1, min: 0, max: 1 },
        { id: 'linkAmount', name: 'Quantité Liaison', defaultValue: 100, min: 0, max: 100, unit: '%' },
        { id: 'rmsWindow', name: 'Fenêtre RMS', defaultValue: 10, min: 0.1, max: 100, unit: 'ms' },
        
        // === SIDECHAIN ===
        { id: 'sidechainEnabled', name: 'Sidechain Activé', defaultValue: 0, min: 0, max: 1 },
        { id: 'sidechainHPF', name: 'Sidechain HPF', defaultValue: 20, min: 20, max: 2000, unit: 'Hz', logarithmic: true },
        { id: 'sidechainLPF', name: 'Sidechain LPF', defaultValue: 20000, min: 200, max: 20000, unit: 'Hz', logarithmic: true },
        { id: 'sidechainListen', name: 'Écoute Sidechain', defaultValue: 0, min: 0, max: 1 },
        { id: 'sidechainGain', name: 'Gain Sidechain', defaultValue: 0, min: -24, max: 24, unit: 'dB' },
        
        // === CARACTÈRE ET COULEUR ===
        { id: 'saturation', name: 'Saturation', defaultValue: 0, min: 0, max: 100, unit: '%' },
        { id: 'saturationType', name: 'Type Saturation', defaultValue: 0, min: 0, max: 4 }, // 0=Off, 1=Tube, 2=Tape, 3=Transistor, 4=Digital
        { id: 'warmth', name: 'Chaleur', defaultValue: 0, min: 0, max: 100, unit: '%' },
        { id: 'punch', name: 'Punch', defaultValue: 0, min: 0, max: 100, unit: '%' },
        
        // === CONTRÔLES AVANCÉS ===
        { id: 'autoRelease', name: 'Release Auto', defaultValue: 0, min: 0, max: 1 },
        { id: 'autoMakeup', name: 'Compensation Auto', defaultValue: 0, min: 0, max: 1 },
        { id: 'adaptiveRelease', name: 'Release Adaptatif', defaultValue: 0, min: 0, max: 1 },
        { id: 'programDependentRelease', name: 'Release Dépendant', defaultValue: 0, min: 0, max: 1 },
        { id: 'hold', name: 'Maintien', defaultValue: 0, min: 0, max: 100, unit: 'ms' },
        
        // === MIX ET ROUTING ===
        { id: 'mix', name: 'Mix', defaultValue: 100, min: 0, max: 100, unit: '%' },
        { id: 'dryLevel', name: 'Niveau Dry', defaultValue: 0, min: -inf, max: 12, unit: 'dB' },
        { id: 'wetLevel', name: 'Niveau Wet', defaultValue: 0, min: -inf, max: 12, unit: 'dB' },
        { id: 'parallelCompression', name: 'Compression Parallèle', defaultValue: 0, min: 0, max: 1 },
        
        // === ANALYSE ET MONITORING ===
        { id: 'inputLevel', name: 'Niveau Entrée', defaultValue: 0, min: -80, max: 12, unit: 'dB' }, // Read-only
        { id: 'outputLevel', name: 'Niveau Sortie', defaultValue: 0, min: -80, max: 12, unit: 'dB' }, // Read-only
        { id: 'gainReduction', name: 'Réduction Gain', defaultValue: 0, min: 0, max: 60, unit: 'dB' }, // Read-only
        { id: 'envelope', name: 'Enveloppe', defaultValue: 0, min: -80, max: 12, unit: 'dB' }, // Read-only
        
        // === MODES SPÉCIAUX ===
        { id: 'vintageMode', name: 'Mode Vintage', defaultValue: 0, min: 0, max: 4 }, // 0=Off, 1=1176, 2=LA2A, 3=Fairchild, 4=SSL
        { id: 'oversampling', name: 'Suréchantillonnage', defaultValue: 1, min: 0, max: 3 }, // 0=Off, 1=2x, 2=4x, 3=8x
        { id: 'antiAliasing', name: 'Anti-Aliasing', defaultValue: 1, min: 0, max: 1 },
        { id: 'softClip', name: 'Soft Clipping', defaultValue: 0, min: 0, max: 1 },
        { id: 'brickwallLimit', name: 'Limitation Brickwall', defaultValue: 0, min: 0, max: 1 }
      ];

    case ModuleType.REVERB:
      return [
        ...commonParams,
        { id: 'roomSize', name: 'Taille Salle', defaultValue: 0.5, min: 0, max: 1 },
        { id: 'damping', name: 'Amortissement', defaultValue: 0.5, min: 0, max: 1 },
        { id: 'wetLevel', name: 'Niveau Effet', defaultValue: 0.3, min: 0, max: 1 },
        { id: 'dryLevel', name: 'Niveau Sec', defaultValue: 1, min: 0, max: 1 },
        { id: 'preDelay', name: 'Pré-Délai', defaultValue: 20, min: 0, max: 200, unit: 'ms' },
        { id: 'width', name: 'Largeur Stéréo', defaultValue: 1, min: 0, max: 1 }
      ];

    case ModuleType.DELAY:
      return [
        ...commonParams,
        { id: 'time', name: 'Temps', defaultValue: 250, min: 1, max: 2000, unit: 'ms' },
        { id: 'feedback', name: 'Feedback', defaultValue: 0.3, min: 0, max: 0.95 },
        { id: 'mix', name: 'Mix', defaultValue: 0.3, min: 0, max: 1 }
      ];

    case ModuleType.NOISE_REDUCER:
      return [
        ...commonParams,
        // === DÉTECTION AUTOMATIQUE ===
        { id: 'autoDetection', name: 'Détection Auto', defaultValue: 1, min: 0, max: 1 },
        { id: 'autoThreshold', name: 'Seuil Auto', defaultValue: 1, min: 0, max: 1 },
        { id: 'adaptiveMode', name: 'Mode Adaptatif', defaultValue: 1, min: 0, max: 1 },
        { id: 'learningTime', name: 'Temps Apprentissage', defaultValue: 5, min: 1, max: 30, unit: 's' },
        { id: 'sensitivity', name: 'Sensibilité', defaultValue: 0.7, min: 0, max: 1 },
        
        // === RÉDUCTION DE BRUIT ===
        { id: 'threshold', name: 'Seuil Bruit', defaultValue: -40, min: -80, max: -10, unit: 'dB' },
        { id: 'reduction', name: 'Réduction Max', defaultValue: 20, min: 0, max: 40, unit: 'dB' },
        { id: 'ratio', name: 'Ratio Réduction', defaultValue: 4, min: 1, max: 10 },
        { id: 'attack', name: 'Attaque', defaultValue: 5, min: 0.1, max: 100, unit: 'ms' },
        { id: 'release', name: 'Relâchement', defaultValue: 50, min: 1, max: 1000, unit: 'ms' },
        
        // === FILTRAGE SPECTRAL ===
        { id: 'spectralSmoothing', name: 'Lissage Spectral', defaultValue: 0.6, min: 0, max: 1 },
        { id: 'frequencySmoothing', name: 'Lissage Fréquentiel', defaultValue: 0.4, min: 0, max: 1 },
        { id: 'timeSmoothing', name: 'Lissage Temporel', defaultValue: 0.5, min: 0, max: 1 },
        { id: 'windowSize', name: 'Taille Fenêtre', defaultValue: 2048, min: 512, max: 8192 },
        { id: 'overlap', name: 'Recouvrement', defaultValue: 0.75, min: 0.25, max: 0.95 },
        
        // === BANDES FRÉQUENTIELLES ===
        { id: 'lowFreqReduction', name: 'Réduction Graves', defaultValue: 15, min: 0, max: 30, unit: 'dB' },
        { id: 'midFreqReduction', name: 'Réduction Médiums', defaultValue: 12, min: 0, max: 30, unit: 'dB' },
        { id: 'highFreqReduction', name: 'Réduction Aigus', defaultValue: 18, min: 0, max: 30, unit: 'dB' },
        { id: 'lowFreqLimit', name: 'Limite Graves', defaultValue: 200, min: 50, max: 1000, unit: 'Hz' },
        { id: 'highFreqLimit', name: 'Limite Aigus', defaultValue: 8000, min: 2000, max: 20000, unit: 'Hz' },
        
        // === PRÉSERVATION SIGNAL ===
        { id: 'musicPreservation', name: 'Préservation Musique', defaultValue: 0.8, min: 0, max: 1 },
        { id: 'speechPreservation', name: 'Préservation Voix', defaultValue: 0.9, min: 0, max: 1 },
        { id: 'transientPreservation', name: 'Préservation Transitoires', defaultValue: 0.7, min: 0, max: 1 },
        { id: 'harmonicPreservation', name: 'Préservation Harmoniques', defaultValue: 0.6, min: 0, max: 1 },
        
        // === ALGORITHMES AVANCÉS ===
        { id: 'algorithm', name: 'Algorithme', defaultValue: 2, min: 0, max: 4 }, // 0=Spectral, 1=Wiener, 2=Neural, 3=Hybrid, 4=AI
        { id: 'qualityMode', name: 'Mode Qualité', defaultValue: 1, min: 0, max: 2 }, // 0=Rapide, 1=Équilibré, 2=Haute Qualité
        { id: 'artificialReverbSuppression', name: 'Suppression Réverb Artificielle', defaultValue: 0.5, min: 0, max: 1 },
        { id: 'clickPopReduction', name: 'Réduction Clics/Pops', defaultValue: 0.8, min: 0, max: 1 },
        
        // === CONTRÔLE EN TEMPS RÉEL ===
        { id: 'realTimeProcessing', name: 'Traitement Temps Réel', defaultValue: 1, min: 0, max: 1 },
        { id: 'lookahead', name: 'Anticipation', defaultValue: 10, min: 0, max: 50, unit: 'ms' },
        { id: 'adaptationSpeed', name: 'Vitesse Adaptation', defaultValue: 0.5, min: 0.1, max: 2 },
        { id: 'noiseGating', name: 'Gate de Bruit', defaultValue: 0.3, min: 0, max: 1 },
        
        // === MONITORING ===
        { id: 'noiseLevel', name: 'Niveau Bruit Détecté', defaultValue: 0, min: -80, max: 0, unit: 'dB' }, // Read-only
        { id: 'reductionAmount', name: 'Réduction Appliquée', defaultValue: 0, min: 0, max: 40, unit: 'dB' }, // Read-only
        { id: 'signalToNoiseRatio', name: 'Rapport S/B', defaultValue: 20, min: 0, max: 60, unit: 'dB' } // Read-only
      ];

    default:
      return commonParams;
  }
}

const inf = Number.POSITIVE_INFINITY;