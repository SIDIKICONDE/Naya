/**
 * Types et interfaces pour le ModuleRack
 * Support thématique complet
 */

import { ModuleType } from '../../../../audio/AudioInterface';
import type { AudioColors } from '../../../../theme/types/ThemeTypes';

export interface ModuleRackProps {
  onAddModule: (type: ModuleType) => void;
  disabled?: boolean;
}

export interface ModuleCategory {
  name: string;
  types: ModuleType[];
  color: (colors: AudioColors) => string;
}

export interface CategoryListProps {
  categories: ModuleCategory[];
  onSelectCategory: (category: ModuleCategory) => void;
}

export interface ModuleTypeListProps {
  category: ModuleCategory;
  onSelectModule: (type: ModuleType) => void;
  onBack: () => void;
}

export interface FloatingButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export interface ModuleModalProps {
  visible: boolean;
  selectedCategory: ModuleCategory | null;
  onClose: () => void;
  onSelectCategory: (category: ModuleCategory) => void;
  onSelectModule: (type: ModuleType) => void;
  onBack: () => void;
}