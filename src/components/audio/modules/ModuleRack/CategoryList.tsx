/**
 * Liste des catégories de modules
 */

import React from 'react';
import { FlatList, TouchableOpacity, Text } from 'react-native';
import type { CategoryListProps } from './types';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';
import { createRackStyles } from './styles';

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onSelectCategory,
}) => {
  const audioTheme = useAudioTheme();
  const styles = createRackStyles();

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.categoryItem, { borderLeftColor: item.color(audioTheme.colors) }]}
          onPress={() => onSelectCategory(item)}
        >
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryArrow}>›</Text>
        </TouchableOpacity>
      )}
    />
  );
};