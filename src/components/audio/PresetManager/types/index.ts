/**
 * Types pour les composants du PresetManager
 */

import type {
  ActionsTranslations,
  CategoriesTranslations,
  PresetCardTranslations,
  EmptyStateTranslations,
  SaveModalTranslations,
} from './translations';

export interface PresetManagerProps {
  onClose: () => void;
  onLoadPreset: (presetId: string) => void;
}

export interface HeaderProps {
  title: string;
  onClose: () => void;
}

export interface ActionsProps {
  onSave: () => void;
  onImport: () => void;
  translations: ActionsTranslations;
}

export interface CategoriesProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  translations: CategoriesTranslations;
}

export interface PresetCardProps {
  preset: PresetItem;
  onLoad: () => void;
  onDelete: () => void;
  translations: PresetCardTranslations;
}

export interface EmptyStateProps {
  translations: EmptyStateTranslations;
}

export interface SaveModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, category: string) => void;
  translations: SaveModalTranslations;
}

export type PresetCategory = string;

export interface PresetItem {
  id: string;
  name: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
  isFavorite?: boolean;
  isFactory?: boolean;
  data?: any;
}

export * from './translations';