/**
 * Configuration des catégories de modules audio
 * Support thématique complet
 */

import { ModuleType } from '../../../../audio/AudioInterface';
import type { ModuleCategory } from './types';
import type { AudioColors } from '../../../../theme/types/ThemeTypes';

export const moduleCategories: ModuleCategory[] = [
  {
    name: '🎚️ Égalisation',
    types: [ModuleType.PARAMETRIC_EQ, ModuleType.GRAPHIC_EQ, ModuleType.MULTIBAND_EQ],
    color: (colors: AudioColors) => colors.equalizerColor,
  },
  {
    name: '🔊 Dynamique',
    types: [ModuleType.COMPRESSOR, ModuleType.LIMITER, ModuleType.GATE, ModuleType.MULTIBAND_COMPRESSOR],
    color: (colors: AudioColors) => colors.compressorColor,
  },
  {
    name: '🎵 Effets',
    types: [ModuleType.REVERB, ModuleType.DELAY, ModuleType.CHORUS, ModuleType.DISTORTION],
    color: (colors: AudioColors) => colors.chorusColor,
  },
  {
    name: '📊 Analyse',
    types: [ModuleType.LEVEL_METER, ModuleType.NOISE_REDUCER],
    color: (colors: AudioColors) => colors.levelMeterColor,
  },
];