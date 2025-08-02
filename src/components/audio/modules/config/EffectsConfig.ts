/**
 * Configuration des modules d'effets
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

export const EffectsConfig: ModuleConfig = {
  name: '🎵 Effets',
  types: [
    ModuleType.REVERB,
    ModuleType.DELAY,
    ModuleType.CHORUS,
    ModuleType.FLANGER,
    ModuleType.PHASER,
    ModuleType.DISTORTION,
    ModuleType.PITCH_SHIFTER,
    ModuleType.HARMONIZER,
  ],
  color: (colors) => colors.chorusColor,
  icon: '🎵',
};

export const effectsModules = (colors: AudioColors) => ({
  [ModuleType.REVERB]: {
    displayName: 'Réverbération',
    description: 'Ambiance et profondeur spatiale',
    category: 'Effets',
    color: colors.reverbColor,
  },
  [ModuleType.DELAY]: {
    displayName: 'Delay',
    description: 'Écho et répétitions temporelles',
    category: 'Effets',
    color: colors.delayColor,
  },
  [ModuleType.CHORUS]: {
    displayName: 'Chorus',
    description: 'Enrichissement harmonique et épaisseur',
    category: 'Effets',
    color: colors.chorusColor,
  },
  [ModuleType.FLANGER]: {
    displayName: 'Flanger',
    description: 'Effet de balayage métallique',
    category: 'Effets',
    color: colors.flangerColor,
  },
  [ModuleType.PHASER]: {
    displayName: 'Phaser',
    description: 'Modulation de phase et mouvement',
    category: 'Effets',
    color: colors.phaserColor,
  },
  [ModuleType.DISTORTION]: {
    displayName: 'Distorsion',
    description: 'Saturation et coloration harmonique',
    category: 'Effets',
    color: colors.distortionColor,
  },
  [ModuleType.PITCH_SHIFTER]: {
    displayName: 'Pitch Shifter',
    description: 'Modification de hauteur tonale',
    category: 'Effets',
    color: colors.pitchShiftColor,
  },
  [ModuleType.HARMONIZER]: {
    displayName: 'Harmoniseur',
    description: "Génération d'harmonies automatiques",
    category: 'Effets',
    color: colors.harmonizerColor,
  },
});
