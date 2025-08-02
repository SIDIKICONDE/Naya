/**
 * Types et interfaces pour le gestionnaire de presets
 */

export interface PresetManagerProps {
  onClose: () => void;
  onLoadPreset: (presetId: string) => void;
}

export interface PresetItem {
  id: string;
  name: string;
  category: string;
  created?: Date;
  modified?: Date;
}

export interface PresetCardProps {
  preset: PresetItem;
  onLoad: () => void;
  onDelete: () => void;
}

export interface SaveModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, category: string) => void;
}

export interface HeaderProps {
  title: string;
  onClose: () => void;
}

export interface ActionsProps {
  onSave: () => void;
  onImport: () => void;
}

export interface CategoriesProps {
  categories: PresetCategory[];
  selectedCategory: PresetCategory;
  onCategorySelect: (category: PresetCategory) => void;
}

export type PresetCategory = 'All' | 'User' | 'Factory' | 'Vocal' | 'Instrument' | 'Master';