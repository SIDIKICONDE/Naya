/**
 * Composant de contrôle réutilisable pour les paramètres du compresseur
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAudioTheme } from '../../../../../theme/hooks/useAudioTheme';
import type { ControlProps } from '../types';

export const CompressorControl: React.FC<ControlProps> = ({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit,
  onChange,
  onComplete,
  color,
  formatValue,
  compact = false,
}) => {
  const audioTheme = useAudioTheme();
  const displayValue = formatValue ? formatValue(value) : `${value.toFixed(1)} ${unit}`;

  // Styles thématiques
  const styles = StyleSheet.create({
    control: {
      marginBottom: audioTheme.spacing.md,
    },
    compactControl: {
      marginBottom: audioTheme.spacing.md,
    },
    controlHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: audioTheme.spacing.sm,
    },
    controlLabel: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.spectrumSecondary,
    },
    compactLabel: {
      fontSize: 10,
      fontWeight: '600' as const,
      color: audioTheme.colors.spectrumSecondary,
    },
    controlValue: {
      ...audioTheme.typography.valueDisplay,
      color: audioTheme.colors.spectrumPrimary,
    },
    slider: {
      height: 16,
    },
    compactSlider: {
      height: 6,
      transform: [{ scaleY: 0.5 }],
    },
  });

  return (
    <View style={[styles.control, compact && styles.compactControl]}>
      <View style={styles.controlHeader}>
        <Text style={[styles.controlLabel, compact && styles.compactLabel]}>{label}</Text>
        {!compact && (
          <Text style={styles.controlValue}>{displayValue}</Text>
        )}
      </View>
      <Slider
        style={[styles.slider, compact && styles.compactSlider]}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        onSlidingComplete={onComplete}
        minimumTrackTintColor={color}
        maximumTrackTintColor={audioTheme.colors.sliderTrack}
        thumbTintColor={audioTheme.colors.knobActive}
      />
    </View>
  );
};