/**
 * Hook personnalisé pour gérer l'état du compresseur
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { audioInterface } from '../../../../../audio/AudioInterface';
import { DEFAULT_PARAMS, ANIMATION_CONFIG } from '../constants';
import type { CompressorState, CompressorPreset } from '../types';

export const useCompressorState = (moduleId: string) => {
  // États principaux
  const [state, setState] = useState<CompressorState>({
    ...DEFAULT_PARAMS,
    gainReduction: 0,
    isActive: true,
    showAdvanced: false,
    compactMode: false, // Démarrer en mode normal pour tester
    showPresets: false,
  });

  // Animation pour la réduction de gain
  const gainReductionAnim = useRef(new Animated.Value(0)).current;
  
  // Référence au module audio
  const module = audioInterface?.getModule(moduleId);

  // Initialisation et chargement des paramètres
  useEffect(() => {
    if (!module) return;

    // Charger les valeurs depuis le module
    setState(prevState => ({
      ...prevState,
      threshold: module.getParameter('threshold') ?? DEFAULT_PARAMS.threshold,
      ratio: module.getParameter('ratio') ?? DEFAULT_PARAMS.ratio,
      attack: module.getParameter('attack') ?? DEFAULT_PARAMS.attack,
      release: module.getParameter('release') ?? DEFAULT_PARAMS.release,
      knee: module.getParameter('knee') ?? DEFAULT_PARAMS.knee,
      makeupGain: module.getParameter('makeupGain') ?? DEFAULT_PARAMS.makeupGain,
    }));

    // Animation de la réduction de gain
    const interval = setInterval(() => {
      const gr = Math.random() * ANIMATION_CONFIG.maxGainReduction; // Simulation
      setState(prevState => ({ ...prevState, gainReduction: gr }));
      
      Animated.timing(gainReductionAnim, {
        toValue: gr,
        duration: ANIMATION_CONFIG.animationDuration,
        useNativeDriver: false,
      }).start();
    }, ANIMATION_CONFIG.gainReductionUpdate);

    return () => clearInterval(interval);
  }, [moduleId, module, gainReductionAnim]);

  // Fonction pour mettre à jour un paramètre
  const updateParameter = useCallback((param: keyof CompressorState, value: number) => {
    setState(prevState => ({ ...prevState, [param]: value }));
    if (module && typeof value === 'number') {
      module.setParameter(param, value);
    }
  }, [module]);

  // Fonction pour appliquer un preset
  const applyPreset = useCallback((preset: CompressorPreset) => {
    const newState = {
      threshold: preset.threshold,
      ratio: preset.ratio,
      attack: preset.attack,
      release: preset.release,
      knee: preset.knee ?? DEFAULT_PARAMS.knee,
      makeupGain: preset.makeupGain ?? DEFAULT_PARAMS.makeupGain,
    };

    setState(prevState => ({ ...prevState, ...newState }));

    // Appliquer au module
    if (module) {
      Object.entries(newState).forEach(([param, value]) => {
        module.setParameter(param, value);
      });
    }
  }, [module]);

  // Fonction pour basculer l'état actif
  const toggleActive = useCallback(() => {
    setState(prevState => ({ ...prevState, isActive: !prevState.isActive }));
  }, []);

  // Fonction pour basculer les contrôles avancés
  const toggleAdvanced = useCallback(() => {
    setState(prevState => ({ 
      ...prevState, 
      showAdvanced: !prevState.showAdvanced,
      // Désactiver le mode compact quand on active les contrôles avancés
      compactMode: prevState.showAdvanced ? prevState.compactMode : false
    }));
  }, []);

  // Fonction pour basculer le mode compact
  const toggleCompact = useCallback(() => {
    setState(prevState => ({ 
      ...prevState, 
      compactMode: !prevState.compactMode,
      // Désactiver les contrôles avancés quand on active le mode compact
      showAdvanced: prevState.compactMode ? prevState.showAdvanced : false
    }));
  }, []);

  // Fonction pour basculer l'affichage des presets
  const togglePresets = useCallback(() => {
    setState(prevState => ({ ...prevState, showPresets: !prevState.showPresets }));
  }, []);

  return {
    state,
    gainReductionAnim,
    updateParameter,
    applyPreset,
    toggleActive,
    toggleAdvanced,
    toggleCompact,
    togglePresets,
    module,
  };
};