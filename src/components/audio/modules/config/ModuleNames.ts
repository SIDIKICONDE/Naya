/**
 * Noms et configurations centralisés pour tous les modules
 * Support thématique complet
 */

import { ModuleType } from '../../../../audio/enums';
import { equalizationModules } from './EqualizationConfig';
import { dynamicsModules } from './DynamicsConfig';
import { effectsModules } from './EffectsConfig';
import { analysisModules } from './AnalysisConfig';
import type { AudioColors } from '../../../../theme';

type ModuleInfo = {
  displayName: string;
  description: string;
  category: string;
  color: string;
};

// Fonction qui génère tous les modules avec les couleurs du thème
const getAllModules = (colors: AudioColors): Record<ModuleType, ModuleInfo> => ({
  ...equalizationModules(colors),
  ...dynamicsModules(colors),
  ...effectsModules(colors),
  ...analysisModules(colors),
});

/**
 * Obtient les informations d'un module en fonction du thème
 */
export const getModuleInfo = (
  type: ModuleType,
  colors: AudioColors,
): ModuleInfo => {
  const allModules = getAllModules(colors);
  return (
    allModules[type] || {
      displayName: type,
      description: 'Module audio',
      category: 'Autre',
      color: colors.text,
    }
  );
};

/**
 * Vérifie si un module existe
 */
export const moduleExists = (type: ModuleType): boolean => {
  // Cette vérification est maintenant indépendante du thème
  const allStaticModules = {
    ...equalizationModules({} as any),
    ...dynamicsModules({} as any),
    ...effectsModules({} as any),
    ...analysisModules({} as any),
  };
  return type in allStaticModules;
};
