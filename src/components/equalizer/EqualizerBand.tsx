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
  const handleValueChange = (value: number) => {
    const roundedValue = Math.round(value * 10) / 10; // Arrondi à 0.1 dB
    onGainChange(roundedValue);
  };

  const getGainColor = (gain: number) => {
    if (gain > 0) return '#4CAF50'; // Vert pour boost
    if (gain < 0) return '#FF5722'; // Rouge pour cut
    return '#757575'; // Gris pour neutre
  };

  return (
    <View style={styles.container}>
      {/* Indicateur de gain */}
      <View style={styles.gainIndicator}>
        <Text style={[styles.gainText, { color: getGainColor(band.gain) }]}>
          {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}
        </Text>
        <Text style={styles.gainUnit}>dB</Text>
      </View>

      {/* Slider vertical */}
      <View style={styles.sliderContainer}>
        <Text style={styles.maxLabel}>+20</Text>
        
        <Slider
          style={styles.slider}
          value={band.gain}
          minimumValue={-20}
          maximumValue={20}
          step={0.1}
          onValueChange={handleValueChange}
          minimumTrackTintColor={getGainColor(band.gain)}
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor={getGainColor(band.gain)}
          disabled={disabled}
          vertical={true}
        />
        
        <Text style={styles.minLabel}>-20</Text>
      </View>

      {/* Label de fréquence */}
      <View style={styles.frequencyLabel}>
        <Text style={styles.frequencyText}>{band.label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
    minWidth: 60,
  },
  gainIndicator: {
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  gainText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  gainUnit: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
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
    fontSize: 10,
    color: '#757575',
    marginBottom: 4,
  },
  minLabel: {
    fontSize: 10,
    color: '#757575',
    marginTop: 4,
  },
  frequencyLabel: {
    marginTop: 12,
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});