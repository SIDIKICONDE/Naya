/**
 * Types et interfaces pour l'EqualizerView
 */

export interface EqualizerViewProps {
  moduleId: string;
}

export interface EQBand {
  id: number;
  frequency: number;
  gain: number;
  q: number;
  type: 'BELL' | 'HIGH_SHELF' | 'LOW_SHELF' | 'HIGH_PASS' | 'LOW_PASS';
  enabled: boolean;
}

export interface ResponseGraphProps {
  bands: EQBand[];
  selectedBand: number;
  showIndividualCurves?: boolean;
  onBandSelect?: (bandId: number) => void;
}

export interface BandSelectorProps {
  bands: EQBand[];
  selectedBand: number;
  onSelectBand: (index: number) => void;
  onToggleBand: (bandId: number) => void;
}

export interface BandControlsProps {
  band: EQBand;
  bandIndex: number;
  onUpdateParameter: (parameter: string, value: number) => void;
  onToggleBand: () => void;
  onResetBand: () => void;
}

export interface GlobalControlsProps {
  globalGain: number;
  onGlobalGainChange: (value: number) => void;
}

export interface EqualizerHeaderProps {
  bypassEnabled: boolean;
  showIndividualCurves: boolean;
  onToggleBypass: () => void;
  onResetAll: () => void;
  onToggleIndividualCurves: () => void;
}