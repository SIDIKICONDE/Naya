/**
 * Rack de modules audio - Version modulaire
 * Gestion visuelle et sélection des modules
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import type { ModuleRackProps, ModuleCategory } from './types';
import { FloatingButton } from './FloatingButton';
import { ModuleModal } from './ModuleModal';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';
import { createRackStyles } from './styles';

export const ModuleRack: React.FC<ModuleRackProps> = ({
  onAddModule,
  disabled = false,
}) => {
  const audioTheme = useAudioTheme();
  const styles = createRackStyles();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | null>(null);

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedCategory(null);
  };

  const handleSelectModule = (moduleType: any) => {
    onAddModule(moduleType);
    handleCloseModal();
  };

  return (
    <View style={styles.container}>
      <FloatingButton
        onPress={() => setShowAddModal(true)}
        disabled={disabled}
      />

      <ModuleModal
        visible={showAddModal}
        selectedCategory={selectedCategory}
        onClose={handleCloseModal}
        onSelectCategory={setSelectedCategory}
        onSelectModule={handleSelectModule}
        onBack={() => setSelectedCategory(null)}
      />
    </View>
  );
};