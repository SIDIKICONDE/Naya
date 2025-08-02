/**
 * Configuration des modules d'analyse
 * Support thématique complet
 */

import { ModuleType } from '../../../../audio/enums';
import type { AudioColors } from '../../../../theme';

export interface ModuleConfig {
  name: string;
  types: ModuleType[];
  color: (colors: AudioColors) => string;
  icon: string;
}

export const AnalysisConfig: ModuleConfig = {
  name: '📊 Analyse',
  types: [
    ModuleType.OSCILLOSCOPE,
    ModuleType.LEVEL_METER,
    ModuleType.NOISE_REDUCER,
    ModuleType.STEREO_ENHANCER,
  ],
  color: (colors) => colors.levelMeterColor,
  icon: '📊',
};

export const analysisModules = (colors: AudioColors) => ({
  [ModuleType.OSCILLOSCOPE]: {
    displayName: 'Oscilloscope',
    description: 'Visualisation temps réel du signal audio',
    category: 'Analyse',
    color: colors.levelMeterColor,
  },
  [ModuleType.LEVEL_METER]: {
    displayName: 'VU-Mètre',
    description: 'Mesure précise des niveaux audio',
    category: 'Analyse',
    color: colors.levelMeterColor,
  },
  [ModuleType.NOISE_REDUCER]: {
    displayName: 'Réducteur de Bruit',
    description: 'Suppression intelligente du bruit de fond',
    category: 'Analyse',
    color: colors.levelMeterColor,
  },
  [ModuleType.STEREO_ENHANCER]: {
    displayName: 'Élargisseur Stéréo',
    description: "Amélioration de l'image stéréophonique",
    category: 'Analyse',
    color: colors.levelMeterColor,
  },
});
