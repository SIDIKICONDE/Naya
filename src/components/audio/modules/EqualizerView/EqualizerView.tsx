/**
 * Interface visuelle de l'égaliseur paramétrique - Version modulaire
 * Contrôles professionnels multi-bandes avec courbe de réponse
 */

import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { audioInterface } from '../../../../audio/AudioInterface';
import type { EqualizerViewProps, EQBand } from './types';
import { EqualizerHeader } from './EqualizerHeader';
import { ResponseGraph } from './ResponseGraph';
import { BandSelector } from './BandSelector';
import { BandControls } from './BandControls';
import { GlobalControls } from './GlobalControls';
import { useAudioTheme, useModuleColors } from '../../../../theme/hooks/useAudioTheme';
import { createEqualizerStyles } from './styles';

export const EqualizerView: React.FC<EqualizerViewProps> = ({ moduleId }) => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('equalizer');
  const styles = createEqualizerStyles();

  const [selectedBand, setSelectedBand] = useState(0);
  const [bands, setBands] = useState<EQBand[]>([
    { id: 0, frequency: 60, gain: 0, q: 0.7, type: 'LOW_SHELF', enabled: true },
    { id: 1, frequency: 200, gain: 0, q: 1.0, type: 'BELL', enabled: true },
    { id: 2, frequency: 800, gain: 0, q: 1.0, type: 'BELL', enabled: true },
    { id: 3, frequency: 3200, gain: 0, q: 1.0, type: 'BELL', enabled: true },
    { id: 4, frequency: 8000, gain: 0, q: 1.0, type: 'BELL', enabled: true },
    { id: 5, frequency: 12000, gain: 0, q: 0.7, type: 'HIGH_SHELF', enabled: true },
  ]);

  const [globalGain, setGlobalGain] = useState(0);
  const [bypassEnabled, setBypassEnabled] = useState(false);
  const [showIndividualCurves, setShowIndividualCurves] = useState(true);
  const module = audioInterface.getModule(moduleId);

  useEffect(() => {
    console.log('[EqualizerView] Module ID:', moduleId);
    console.log('[EqualizerView] Module trouvé:', module);
    
    if (!module) {
      console.warn('[EqualizerView] Aucun module trouvé pour ID:', moduleId);
      return;
    }

    // Charger les valeurs initiales des bandes
    const loadedBands = bands.map((band) => ({
      ...band,
      frequency: module.getParameter(`band${band.id}_frequency`) || band.frequency,
      gain: module.getParameter(`band${band.id}_gain`) || band.gain,
      q: module.getParameter(`band${band.id}_q`) || band.q,
      enabled: module.getParameter(`band${band.id}_enabled`) !== 0,
    }));

    setBands(loadedBands);
    setGlobalGain(module.getParameter('outputGain') || 0);
    setBypassEnabled(module.getParameter('bypassed') !== 0);
  }, [moduleId]);

  const updateBandParameter = (bandId: number, parameter: string, value: number) => {
    if (!module) {
      console.warn('[EqualizerView] Tentative de mise à jour sans module:', { bandId, parameter, value });
      return;
    }

    console.log('[EqualizerView] Mise à jour paramètre:', { bandId, parameter, value });
    
    const updatedBands = bands.map(band => 
      band.id === bandId 
        ? { ...band, [parameter]: value }
        : band
    );
    setBands(updatedBands);
    
    const parameterName = `band${bandId}_${parameter}`;
    console.log('[EqualizerView] Envoi vers module:', parameterName, '=', value);
    module.setParameter(parameterName, value);
  };

  const updateGlobalParameter = (parameter: string, value: number) => {
    if (!module) return;
    module.setParameter(parameter, value);
  };

  const toggleBand = (bandId: number) => {
    const newEnabled = !bands[bandId].enabled;
    updateBandParameter(bandId, 'enabled', newEnabled ? 1 : 0);
  };

  const resetBand = (bandId: number) => {
    updateBandParameter(bandId, 'gain', 0);
    updateBandParameter(bandId, 'q', 1.0);
  };

  const resetAllBands = () => {
    bands.forEach(band => resetBand(band.id));
    setGlobalGain(0);
    updateGlobalParameter('outputGain', 0);
  };

  const handleToggleBypass = () => {
    setBypassEnabled(!bypassEnabled);
    updateGlobalParameter('bypassed', bypassEnabled ? 0 : 1);
  };

  const handleGlobalGainChange = (value: number) => {
    setGlobalGain(value);
    updateGlobalParameter('outputGain', value);
  };

  const currentBand = bands[selectedBand];

  return (
    <View style={styles.container}>
      <EqualizerHeader
        bypassEnabled={bypassEnabled}
        showIndividualCurves={showIndividualCurves}
        onToggleBypass={handleToggleBypass}
        onResetAll={resetAllBands}
        onToggleIndividualCurves={() => setShowIndividualCurves(!showIndividualCurves)}
      />

      <ResponseGraph
        bands={bands}
        selectedBand={selectedBand}
        showIndividualCurves={showIndividualCurves}
      />

      <BandSelector
        bands={bands}
        selectedBand={selectedBand}
        onSelectBand={setSelectedBand}
        onToggleBand={toggleBand}
      />

      {currentBand && (
        <BandControls
          band={currentBand}
          bandIndex={selectedBand}
          onUpdateParameter={(parameter, value) => updateBandParameter(currentBand.id, parameter, value)}
          onToggleBand={() => toggleBand(currentBand.id)}
          onResetBand={() => resetBand(currentBand.id)}
        />
      )}

      <GlobalControls
        globalGain={globalGain}
        onGlobalGainChange={handleGlobalGainChange}
      />
    </View>
  );
};