/**
 * Types et interfaces pour les composants d'égaliseur
 * Définitions centralisées pour l'interface utilisateur
 */

export interface EqualizerBand {
  id: number;
  frequency: number;
  gain: number;
  label: string;
  enabled: boolean;
}

export interface AudioFileInfo {
  path: string;
  name: string;
  duration: number;
  sampleRate: number;
  channels: number;
  size: number;
}

export interface EqualizerState {
  bands: EqualizerBand[];
  globalGain: number;
  enabled: boolean;
  currentFile?: AudioFileInfo;
  isPlaying: boolean;
  currentTime: number;
}

export interface EqualizerControls {
  onBandChange: (bandIndex: number, gain: number) => void;
  onReset: () => void;
  onToggle: (enabled: boolean) => void;
  onLoadFile: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

export interface PresetItem {
  id: string;
  name: string;
  description: string;
  bands: number[];
}

export const DEFAULT_BANDS: EqualizerBand[] = [
  { id: 0, frequency: 31.5, gain: 0, label: '31Hz', enabled: true },
  { id: 1, frequency: 63, gain: 0, label: '63Hz', enabled: true },
  { id: 2, frequency: 125, gain: 0, label: '125Hz', enabled: true },
  { id: 3, frequency: 250, gain: 0, label: '250Hz', enabled: true },
  { id: 4, frequency: 500, gain: 0, label: '500Hz', enabled: true },
  { id: 5, frequency: 1000, gain: 0, label: '1kHz', enabled: true },
  { id: 6, frequency: 2000, gain: 0, label: '2kHz', enabled: true },
  { id: 7, frequency: 4000, gain: 0, label: '4kHz', enabled: true },
  { id: 8, frequency: 8000, gain: 0, label: '8kHz', enabled: true },
  { id: 9, frequency: 16000, gain: 0, label: '16kHz', enabled: true },
];

export const DEFAULT_PRESETS: PresetItem[] = [
  {
    id: 'flat',
    name: 'audio:equalizer.defaultPresets.flat.name',
    description: 'audio:equalizer.defaultPresets.flat.description',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 'vocal',
    name: 'audio:equalizer.defaultPresets.vocal.name',
    description: 'audio:equalizer.defaultPresets.vocal.description',
    bands: [-2, -1, 1, 3, 4, 3, 2, 1, -1, -2]
  },
  {
    id: 'bass_boost',
    name: 'audio:equalizer.defaultPresets.bassBoost.name',
    description: 'audio:equalizer.defaultPresets.bassBoost.description',
    bands: [6, 4, 2, 1, 0, -1, -1, -1, 0, 0]
  },
  {
    id: 'treble_boost',
    name: 'audio:equalizer.defaultPresets.trebleBoost.name',
    description: 'audio:equalizer.defaultPresets.trebleBoost.description',
    bands: [0, 0, -1, -1, 0, 1, 2, 4, 6, 4]
  }
];