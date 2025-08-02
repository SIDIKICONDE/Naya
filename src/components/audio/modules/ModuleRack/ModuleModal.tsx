/**
 * Modal pour la sélection de modules
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import type { ModuleModalProps } from './types';
import { moduleCategories } from './moduleCategories';
import { CategoryList } from './CategoryList';
import { ModuleTypeList } from './ModuleTypeList';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';
import { createRackStyles } from './styles';

export const ModuleModal: React.FC<ModuleModalProps> = ({
  visible,
  selectedCategory,
  onClose,
  onSelectCategory,
  onSelectModule,
  onBack,
}) => {
  const audioTheme = useAudioTheme();
  const styles = createRackStyles();

  const handleModuleSelect = (moduleType: any) => {
    onSelectModule(moduleType);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedCategory ? selectedCategory.name : 'Ajouter un module'}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {!selectedCategory ? (
            <CategoryList
              categories={moduleCategories}
              onSelectCategory={onSelectCategory}
            />
          ) : (
            <ModuleTypeList
              category={selectedCategory}
              onSelectModule={handleModuleSelect}
              onBack={onBack}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};