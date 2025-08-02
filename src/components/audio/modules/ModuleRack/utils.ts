/**
 * Utilitaires pour le ModuleRack
 */

import { ModuleType } from '../../../../audio/AudioInterface';

/**
 * Retourne le nom d'affichage d'un type de module
 */
export const getModuleDisplayName = (type: ModuleType): string => {
  const names: Record<ModuleType, string> = {
    [ModuleType.PARAMETRIC_EQ]: 'Égaliseur Paramétrique',
    [ModuleType.GRAPHIC_EQ]: 'Égaliseur Graphique',
    [ModuleType.MULTIBAND_EQ]: 'Égaliseur Multibande',
    [ModuleType.COMPRESSOR]: 'Compresseur',
    [ModuleType.LIMITER]: 'Limiteur',
    [ModuleType.GATE]: 'Gate',
    [ModuleType.MULTIBAND_COMPRESSOR]: 'Compresseur Multibande',
    [ModuleType.DE_ESSER]: 'De-Esser',
    [ModuleType.REVERB]: 'Réverbération',
    [ModuleType.DELAY]: 'Delay',
    [ModuleType.CHORUS]: 'Chorus',
    [ModuleType.FLANGER]: 'Flanger',
    [ModuleType.PHASER]: 'Phaser',
    [ModuleType.DISTORTION]: 'Distorsion',
    [ModuleType.PITCH_SHIFTER]: 'Pitch Shifter',
    [ModuleType.HARMONIZER]: 'Harmoniseur',
    [ModuleType.OSCILLOSCOPE]: 'Oscilloscope',
    [ModuleType.LEVEL_METER]: 'VU-Mètre',
    [ModuleType.NOISE_REDUCER]: 'Réducteur de Bruit',
    [ModuleType.STEREO_ENHANCER]: 'Élargisseur Stéréo',
  };
  return names[type] || type;
};