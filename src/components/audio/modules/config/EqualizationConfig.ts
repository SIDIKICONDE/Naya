/**
 * Configuration des modules d'égalisation
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

export const EqualizationConfig: ModuleConfig = {
  name: '🎚️ Égalisation',
  types: [
    ModuleType.PARAMETRIC_EQ,
    ModuleType.GRAPHIC_EQ,
    ModuleType.MULTIBAND_EQ,
  ],
  color: (colors) => colors.equalizerColor,
  icon: '🎚️',
};

export const equalizationModules = (colors: AudioColors) => ({
  [ModuleType.PARAMETRIC_EQ]: {
    displayName: 'Égaliseur Paramétrique',
    description: 'Contrôle précis des fréquences avec Q variable',
    category: 'Égalisation',
    color: colors.equalizerColor,
  },
  [ModuleType.GRAPHIC_EQ]: {
    displayName: 'Égaliseur Graphique',
    description: 'Égaliseur à bandes fixes visuellement intuitif',
    category: 'Égalisation',
    color: colors.equalizerColor,
  },
  [ModuleType.MULTIBAND_EQ]: {
    displayName: 'Égaliseur Multibande',
    description: 'Égalisation séparée par bandes de fréquences',
    category: 'Égalisation',
    color: colors.equalizerColor,
  },
});
