/**
 * Liste des types de modules dans une catégorie
 */

import React from 'react';
import { FlatList, TouchableOpacity, Text } from 'react-native';
import type { ModuleTypeListProps } from './types';
import { getModuleDisplayName } from './utils';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';
import { createRackStyles } from './styles';

export const ModuleTypeList: React.FC<ModuleTypeListProps> = ({
  category,
  onSelectModule,
  onBack,
}) => {
  const audioTheme = useAudioTheme();
  const styles = createRackStyles();

  return (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
      >
        <Text style={styles.backButtonText}>‹ Retour</Text>
      </TouchableOpacity>
      <FlatList
        data={category.types}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.moduleTypeItem}
            onPress={() => onSelectModule(item)}
          >
            <Text style={styles.moduleTypeName}>
              {getModuleDisplayName(item)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
};