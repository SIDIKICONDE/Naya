/**
 * Sélecteur de bandes de l'égaliseur
 */

import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import type { BandSelectorProps } from './types';
import { formatFrequency, formatGain, getBandColor } from './utils';
import { useAudioTheme, useModuleColors } from '../../../../theme/hooks/useAudioTheme';
import { createEqualizerStyles } from './styles';

export const BandSelector: React.FC<BandSelectorProps> = ({
  bands,
  selectedBand,
  onSelectBand,
  onToggleBand,
}) => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('equalizer');
  const styles = createEqualizerStyles();

  return (
    <View style={styles.bandSelector}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexGrow: 1,
          gap: audioTheme.spacing.xs,
        }}
      >
        {bands.map((band, index) => {
          const isSelected = selectedBand === index;
          const bandColor = getBandColor(band.id, false, audioTheme.colors);
          
          return (
            <TouchableOpacity
              key={band.id}
              style={[
                styles.bandButton,
                isSelected && styles.bandButtonActive,
                !band.enabled && styles.bandButtonDisabled,
                !isSelected && band.enabled && { borderColor: bandColor },
              ]}
              onPress={() => onSelectBand(index)}
              onLongPress={() => onToggleBand(band.id)}
            >
              <Text style={[
                styles.bandButtonText,
                isSelected && styles.bandButtonTextActive,
                !band.enabled && styles.bandButtonTextDisabled,
                !isSelected && band.enabled && { color: bandColor },
              ]}>
                {formatFrequency(band.frequency)}
              </Text>
              <Text style={[
                styles.bandGainText,
                isSelected && styles.bandButtonTextActive,
                !band.enabled && styles.bandButtonTextDisabled,
                !isSelected && band.enabled && { color: bandColor },
              ]}>
                {formatGain(band.gain)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};