/**
 * Types et interfaces pour le CompressorView
 */

export interface CompressorPreset {
  name: string;
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee?: number;
  makeupGain?: number;
  description: string;
}

export interface CompressorParams {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
  makeupGain: number;
}

export interface CompressorState extends CompressorParams {
  gainReduction: number;
  isActive: boolean;
  showAdvanced: boolean;
  compactMode: boolean;
  showPresets: boolean;
}

export interface CompressorViewProps {
  moduleId: string;
}

export interface MeterProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
}

export interface ControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
  onComplete: (value: number) => void;
  color: string;
  formatValue?: (value: number) => string;
  compact?: boolean;
}