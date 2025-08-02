/**
 * Bouton flottant pour ajouter des modules
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import type { FloatingButtonProps } from './types';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';
import { createRackStyles } from './styles';

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  const audioTheme = useAudioTheme();
  const styles = createRackStyles();

  return (
    <TouchableOpacity
      style={[styles.floatingButton, disabled && styles.disabledButton]}
      onPress={() => !disabled && onPress()}
      disabled={disabled}
    >
      <Text style={[styles.floatingButtonText, disabled && styles.disabledText]}>
        {disabled ? '⏳' : '+'}
      </Text>
    </TouchableOpacity>
  );
};