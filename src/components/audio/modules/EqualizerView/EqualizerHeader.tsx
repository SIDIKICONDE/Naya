/**
 * Header de l'égaliseur avec bypass et reset
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { EqualizerHeaderProps } from './types';
import { useAudioTheme, useModuleColors } from '../../../../theme/hooks/useAudioTheme';
import { createEqualizerStyles } from './styles';

export const EqualizerHeader: React.FC<EqualizerHeaderProps> = ({
  bypassEnabled,
  showIndividualCurves,
  onToggleBypass,
  onResetAll,
  onToggleIndividualCurves,
}) => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('equalizer');
  const styles = createEqualizerStyles();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>EQ</Text>
      <View style={styles.headerControls}>
        <TouchableOpacity
          style={[styles.bypassButton, showIndividualCurves && styles.bypassActive]}
          onPress={onToggleIndividualCurves}
        >
          <Text style={[styles.bypassText, showIndividualCurves && styles.bypassTextActive]}>
            COURBES
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bypassButton, bypassEnabled && styles.bypassActive]}
          onPress={onToggleBypass}
        >
          <Text style={[styles.bypassText, bypassEnabled && styles.bypassTextActive]}>
            BYPASS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={onResetAll}>
          <Text style={styles.resetText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};