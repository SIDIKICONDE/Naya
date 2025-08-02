/**
 * Contrôles globaux de l'égaliseur
 */

import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import type { GlobalControlsProps } from './types';
import { formatGain } from './utils';
import { useAudioTheme, useModuleColors } from '../../../../theme/hooks/useAudioTheme';
import { createEqualizerStyles } from './styles';

export const GlobalControls: React.FC<GlobalControlsProps> = ({
  globalGain,
  onGlobalGainChange,
}) => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('equalizer');
  const styles = createEqualizerStyles();

  return (
    <View style={styles.globalControls}>
      <Text style={styles.controlLabel}>Gain Global</Text>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={-12}
          maximumValue={12}
          value={globalGain}
          onValueChange={onGlobalGainChange}
          minimumTrackTintColor={moduleColors.primary}
          maximumTrackTintColor={audioTheme.colors.sliderTrack}
          thumbTintColor={moduleColors.primary}
        />
      </View>
    </View>
  );
};