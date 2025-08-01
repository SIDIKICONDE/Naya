/**
 * Index central pour les composants d'égaliseur
 * Export modulaire de tous les composants
 */

export { EqualizerBand } from './EqualizerBand';
export { EqualizerPanel } from './EqualizerPanel';
export { AudioFileSelector } from './AudioFileSelector';
export { PresetSelector } from './PresetSelector';

export type {
  EqualizerBand as EqualizerBandType,
  AudioFileInfo,
  EqualizerState,
  EqualizerControls,
  PresetItem,
} from './types';

export {
  DEFAULT_BANDS,
  DEFAULT_PRESETS,
} from './types';