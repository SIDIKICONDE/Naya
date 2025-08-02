/**
 * Contrôles détaillés pour une bande de l'égaliseur
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import type { BandControlsProps } from './types';
import { formatFrequency, formatGain, getBandSliderColor } from './utils';
import { useAudioTheme, useModuleColors } from '../../../../theme/hooks/useAudioTheme';
import { createEqualizerStyles } from './styles';

export const BandControls: React.FC<BandControlsProps> = ({
  band,
  bandIndex,
  onUpdateParameter,
  onToggleBand,
  onResetBand,
}) => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('equalizer');
  const styles = createEqualizerStyles();
  const sliderColor = getBandSliderColor(band.id, audioTheme.colors);
  
  return (
    <View style={styles.bandControls}>
      <Text style={styles.controlsTitle}>
        Bande {bandIndex + 1} - {band.type}
      </Text>

      {/* Fréquence */}
      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>Fréquence</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={Math.log(20)}
            maximumValue={Math.log(20000)}
            value={Math.log(Math.max(20, band.frequency))}
            onValueChange={(logValue) => {
              const frequency = Math.exp(logValue);
              const clampedFrequency = Math.max(20, Math.min(20000, frequency));
              onUpdateParameter('frequency', clampedFrequency);
            }}
            minimumTrackTintColor={sliderColor}
            maximumTrackTintColor={audioTheme.colors.sliderTrack}
            thumbTintColor={sliderColor}
          />
        </View>
      </View>

      {/* Gain */}
      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>Gain</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={-12}
            maximumValue={12}
            value={band.gain}
            onValueChange={(value) => onUpdateParameter('gain', value)}
            minimumTrackTintColor={sliderColor}
            maximumTrackTintColor={audioTheme.colors.sliderTrack}
            thumbTintColor={sliderColor}
          />
        </View>
      </View>

      {/* Q (résonance) - pour toutes les bandes */}
      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>Q (Résonance)</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={10}
            value={band.q}
            onValueChange={(value) => onUpdateParameter('q', value)}
            minimumTrackTintColor={sliderColor}
            maximumTrackTintColor={audioTheme.colors.sliderTrack}
            thumbTintColor={sliderColor}
          />
        </View>
      </View>

      {/* Actions de bande */}
      <View style={styles.bandActions}>
        <TouchableOpacity
          style={[styles.actionButton, !band.enabled && styles.actionButtonDisabled]}
          onPress={onToggleBand}
        >
          <Text style={[styles.actionText, !band.enabled && styles.actionTextDisabled]}>
            {band.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onResetBand}
        >
          <Text style={styles.actionText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};