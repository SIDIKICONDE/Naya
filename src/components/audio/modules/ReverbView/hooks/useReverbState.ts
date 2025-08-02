/**
 * Hook personnalisé pour gérer l'état du module de réverbération
 */

import { useState, useEffect, useCallback } from 'react';
import { ReverbType, ReverbPreset } from '../types';
import { audioInterface } from '../../../../../audio/AudioInterface';
import { REVERB_TYPES, DEFAULT_REVERB_STATE } from '../constants';

export const useReverbState = (moduleId: string) => {
  const [selectedType, setSelectedType] = useState<ReverbType>(DEFAULT_REVERB_STATE.selectedType);
  const [roomSize, setRoomSize] = useState(DEFAULT_REVERB_STATE.roomSize);
  const [damping, setDamping] = useState(DEFAULT_REVERB_STATE.damping);
  const [wetLevel, setWetLevel] = useState(DEFAULT_REVERB_STATE.wetLevel);
  const [dryLevel, setDryLevel] = useState(DEFAULT_REVERB_STATE.dryLevel);
  const [preDelay, setPreDelay] = useState(DEFAULT_REVERB_STATE.preDelay);
  const [width, setWidth] = useState(DEFAULT_REVERB_STATE.width);
  const [compactMode, setCompactMode] = useState(DEFAULT_REVERB_STATE.compactMode);
  const [showAdvanced, setShowAdvanced] = useState(DEFAULT_REVERB_STATE.showAdvanced);

  const module = audioInterface.getModule(moduleId);

  useEffect(() => {
    if (!module) return;

    // Charger les valeurs initiales depuis le module audio
    const typeIndex = module.getParameter('type') ?? 1;
    setSelectedType(REVERB_TYPES[typeIndex]?.type ?? 'HALL');
    setRoomSize(module.getParameter('roomSize') ?? DEFAULT_REVERB_STATE.roomSize);
    setDamping(module.getParameter('damping') ?? DEFAULT_REVERB_STATE.damping);
    setWetLevel(module.getParameter('wetLevel') ?? DEFAULT_REVERB_STATE.wetLevel);
    setDryLevel(module.getParameter('dryLevel') ?? DEFAULT_REVERB_STATE.dryLevel);
    setPreDelay(module.getParameter('preDelay') ?? DEFAULT_REVERB_STATE.preDelay);
    setWidth(module.getParameter('width') ?? DEFAULT_REVERB_STATE.width);
  }, [moduleId, module]);

  const updateParameter = useCallback((param: string, value: number) => {
    if (!module) return;
    module.setParameter(param, value);
  }, [module]);

  const applyReverbType = useCallback((type: ReverbType) => {
    const selectedReverbType = REVERB_TYPES.find(t => t.type === type);
    if (!selectedReverbType) return;

    // Appliquer le type et ses paramètres par défaut
    setSelectedType(type);
    setRoomSize(selectedReverbType.params.roomSize);
    setDamping(selectedReverbType.params.damping);
    setWetLevel(selectedReverbType.params.wetLevel);
    setPreDelay(selectedReverbType.params.preDelay);
    setWidth(selectedReverbType.params.width);
    
    // Mettre à jour les paramètres du module audio
    updateParameter('type', REVERB_TYPES.findIndex(t => t.type === type));
    updateParameter('roomSize', selectedReverbType.params.roomSize);
    updateParameter('damping', selectedReverbType.params.damping);
    updateParameter('wetLevel', selectedReverbType.params.wetLevel);
    updateParameter('preDelay', selectedReverbType.params.preDelay);
    updateParameter('width', selectedReverbType.params.width);
  }, [updateParameter]);

  const applyPreset = useCallback((preset: ReverbPreset) => {
    // Appliquer tous les paramètres du preset
    setSelectedType(preset.type);
    setRoomSize(preset.roomSize);
    setDamping(preset.damping);
    setWetLevel(preset.wetLevel);
    setPreDelay(preset.preDelay);
    setWidth(preset.width);
    
    // Mettre à jour les paramètres du module audio
    updateParameter('type', REVERB_TYPES.findIndex(t => t.type === preset.type));
    updateParameter('roomSize', preset.roomSize);
    updateParameter('damping', preset.damping);
    updateParameter('wetLevel', preset.wetLevel);
    updateParameter('preDelay', preset.preDelay);
    updateParameter('width', preset.width);
  }, [updateParameter]);

  const toggleCompactMode = useCallback(() => {
    setCompactMode(!compactMode);
    setShowAdvanced(false);
  }, [compactMode]);

  const toggleAdvancedMode = useCallback(() => {
    setShowAdvanced(!showAdvanced);
    setCompactMode(false);
  }, [showAdvanced]);

  return {
    // État
    selectedType,
    roomSize,
    damping,
    wetLevel,
    dryLevel,
    preDelay,
    width,
    compactMode,
    showAdvanced,
    
    // Setters
    setRoomSize,
    setDamping,
    setWetLevel,
    setDryLevel,
    setPreDelay,
    setWidth,
    setCompactMode,
    setShowAdvanced,
    
    // Actions
    updateParameter,
    applyReverbType,
    applyPreset,
    toggleCompactMode,
    toggleAdvancedMode,
    
    // Module
    module,
  };
};