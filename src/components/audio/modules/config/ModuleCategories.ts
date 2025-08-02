/**
 * Configuration centralisée des catégories de modules
 * Support thématique complet
 */

import { ModuleType } from '../../../../audio/enums';
import { EqualizationConfig } from './EqualizationConfig';
import { DynamicsConfigData } from './DynamicsConfig';
import { EffectsConfig } from './EffectsConfig';
import { AnalysisConfig } from './AnalysisConfig';
import type { AudioColors } from '../../../../theme';

export interface ModuleCategory {
  name: string;
  types: ModuleType[];
  color: (colors: AudioColors) => string;
  icon: string;
}

/**
 * Toutes les catégories de modules disponibles
 */
export const moduleCategories: ModuleCategory[] = [
  EqualizationConfig,
  DynamicsConfigData,
  EffectsConfig,
  AnalysisConfig,
];

/**
 * Trouve la catégorie d'un type de module
 */
export const findModuleCategory = (
  moduleType: ModuleType,
): ModuleCategory | undefined => {
  return moduleCategories.find((category) =>
    category.types.includes(moduleType),
  );
};

/**
 * Obtient tous les types de modules disponibles
 */
export const getAllModuleTypes = (): ModuleType[] => {
  return moduleCategories.flatMap((category) => category.types);
};

/**
 * Obtient le nombre total de modules disponibles
 */
export const getTotalModuleCount = (): number => {
  return getAllModuleTypes().length;
};
