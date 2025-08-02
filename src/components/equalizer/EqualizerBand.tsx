/**
 * EqualizerBand.tsx
 * Composant individuel pour une bande de fréquence de l'égaliseur
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { EqualizerBand as BandType } from './types';
import { useAudioTheme } from '../../theme/hooks/useAudioTheme';
import { useTranslation } from '../../i18n';

interface EqualizerBandProps {
  band: BandType;
  onGainChange: (gain: number) => void;
  disabled?: boolean;
}

export const EqualizerBand: React.FC<EqualizerBandProps> = ({
  band,
  onGainChange,
  disabled = false,
}) => {
  const audioTheme = useAudioTheme();
  const themedStyles = createStyles(audioTheme);
  const { t } = useTranslation();
  const handleValueChange = (value: number) => {
    const roundedValue = Math.round(value * 10) / 10; // Arrondi à 0.1 dB
    onGainChange(roundedValue);
  };

  const getGainColor = (gain: number) => {
    if (gain > 0) return audioTheme.colors.rmsNormal; // Boost
    if (gain < 0) return audioTheme.colors.rmsAlert; // Cut
    return audioTheme.colors.text; // Neutre
  };

  return (
    <View style={themedStyles.container}>
      {/* Indicateur de gain */}
      <View style={themedStyles.gainIndicator}>
        <Text style={[themedStyles.gainText, { color: getGainColor(band.gain) }]}>
          {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}
        </Text>
        <Text style={themedStyles.gainUnit}>{t('audio:units.db')}</Text>
      </View>

      {/* Slider vertical */}
      <View style={themedStyles.sliderContainer}>
        <Text style={themedStyles.maxLabel}>+20 {t('audio:units.db')}</Text>
        
        <Slider
          style={themedStyles.slider}
          value={band.gain}
          minimumValue={-20}
          maximumValue={20}
          step={0.1}
          onValueChange={handleValueChange}
          minimumTrackTintColor={getGainColor(band.gain)}
          maximumTrackTintColor={audioTheme.colors.moduleBackground}
          thumbTintColor={getGainColor(band.gain)}
          disabled={disabled}
          vertical={true}
        />
        
        <Text style={themedStyles.minLabel}>-20 {t('audio:units.db')}</Text>
      </View>

      {/* Label de fréquence */}
      <View style={themedStyles.frequencyLabel}>
        <Text style={themedStyles.frequencyText}>{band.label}</Text>
      </View>
    </View>
  );
};

const createStyles = (audioTheme: ReturnType<typeof useAudioTheme>) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: audioTheme.spacing.sm,
    paddingVertical: audioTheme.spacing.md,
    minWidth: 60,
  },
  gainIndicator: {
    alignItems: 'center',
    marginBottom: audioTheme.spacing.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  gainText: {
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
  },
  gainUnit: {
    fontSize: audioTheme.typography.parameterLabel.fontSize * 0.8,
    color: audioTheme.colors.text,
    opacity: 0.7,
    marginTop: audioTheme.spacing.xs,
  },
  sliderContainer: {
    alignItems: 'center',
    height: 200,
    justifyContent: 'space-between',
  },
  slider: {
    height: 160,
    width: 40,
    transform: [{ rotate: '-90deg' }],
  },
  maxLabel: {
    fontSize: audioTheme.typography.parameterLabel.fontSize * 0.8,
    color: audioTheme.colors.text,
    opacity: 0.7,
    marginBottom: audioTheme.spacing.xs,
  },
  minLabel: {
    fontSize: audioTheme.typography.parameterLabel.fontSize * 0.8,
    color: audioTheme.colors.text,
    opacity: 0.7,
    marginTop: audioTheme.spacing.xs,
  },
  frequencyLabel: {
    marginTop: audioTheme.spacing.sm,
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
    color: audioTheme.colors.text,
  },
});