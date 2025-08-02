/**
 * Sélecteur de catégories de presets
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { CategoriesProps } from '../types/index';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';

const getCategoryTranslation = (category: any, translations: any) => {
  const translationMap: Record<string, string> = {
    'All': translations.all,
    'User': translations.user,
    'Factory': translations.factory,
    'Favorites': translations.favorites,
    'Recent': translations.recent,
    'Vocal': 'Vocal',
    'Instrument': 'Instrument',
    'Master': 'Master',
  };
  return translationMap[category] || category;
};

export const Categories: React.FC<CategoriesProps> = ({
  categories, 
  selectedCategory, 
  onCategorySelect,
  translations
}) => {
  const audioTheme = useAudioTheme();
  const styles = createStyles(audioTheme);

  return (
    <View style={styles.categories}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.selectedCategoryButton,
          ]}
          onPress={() => onCategorySelect(category)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.selectedCategoryButtonText,
            ]}
          >
            {getCategoryTranslation(category, translations)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = (audioTheme: any) => StyleSheet.create({
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: audioTheme.spacing.md,
    paddingVertical: audioTheme.spacing.sm,
    gap: audioTheme.spacing.xs,
    backgroundColor: audioTheme.colors.moduleBackground,
    borderBottomWidth: 1,
    borderBottomColor: audioTheme.colors.buttonInactive,
  },
  categoryButton: {
    paddingHorizontal: audioTheme.spacing.md,
    paddingVertical: audioTheme.spacing.xs,
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.lg,
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: audioTheme.colors.primary,
    borderColor: audioTheme.colors.primary,
    shadowColor: audioTheme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryButtonText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.buttonInactive,
    letterSpacing: 0.3,
  },
  selectedCategoryButtonText: {
    color: audioTheme.colors.text,
  },
});