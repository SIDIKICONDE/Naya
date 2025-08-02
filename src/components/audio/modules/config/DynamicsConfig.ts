/**
 * Configuration des modules de dynamique
 * Support thématique complet
 */

import { ModuleType } from '../../../../audio/enums';
import type { AudioColors } from '../../../../theme';

export interface DynamicsConfig {
  name: string;
  types: ModuleType[];
  color: (colors: AudioColors) => string;
  icon: string;
}

export const DynamicsConfigData: DynamicsConfig = {
  name: '🔊 Dynamique',
  types: [
    ModuleType.COMPRESSOR,
    ModuleType.LIMITER,
    ModuleType.GATE,
    ModuleType.MULTIBAND_COMPRESSOR,
    ModuleType.DE_ESSER,
  ],
  color: (colors) => colors.compressorColor,
  icon: '🔊',
};

export const dynamicsModules = (colors: AudioColors) => ({
  [ModuleType.COMPRESSOR]: {
    displayName: 'Compresseur',
    description: 'Contrôle de la dynamique et volume constant',
    category: 'Dynamique',
    color: colors.compressorColor,
  },
  [ModuleType.LIMITER]: {
    displayName: 'Limiteur',
    description: 'Protection contre les pics et saturation',
    category: 'Dynamique',
    color: colors.compressorColor,
  },
  [ModuleType.GATE]: {
    displayName: 'Gate',
    description: 'Suppression du bruit de fond et silence',
    category: 'Dynamique',
    color: colors.gateColor,
  },
  [ModuleType.MULTIBAND_COMPRESSOR]: {
    displayName: 'Compresseur Multibande',
    description: 'Compression séparée par bandes de fréquences',
    category: 'Dynamique',
    color: colors.compressorColor,
  },
  [ModuleType.DE_ESSER]: {
    displayName: 'De-Esser',
    description: 'Réduction des sibilantes et consonnes dures',
    category: 'Dynamique',
    color: colors.compressorColor,
  },
});
