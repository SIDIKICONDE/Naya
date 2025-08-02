/**
 * Mode d'affichage compact pour le module de réverbération
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { ReverbType } from '../types';
import { REVERB_TYPES } from '../constants';
import { useAudioTheme } from '../../../../../theme/hooks/useAudioTheme';
import { createReverbStyles } from '../styles';

interface CompactModeProps {
  selectedType: ReverbType;
  roomSize: number;
  damping: number;
  wetLevel: number;
  dryLevel: number;
  setRoomSize: (value: number) => void;
  setDamping: (value: number) => void;
  setWetLevel: (value: number) => void;
  setDryLevel: (value: number) => void;
  updateParameter: (param: string, value: number) => void;
  applyReverbType: (type: ReverbType) => void;
}

export const CompactMode: React.FC<CompactModeProps> = ({
  selectedType,
  roomSize,
  damping,
  wetLevel,
  dryLevel,
  setRoomSize,
  setDamping,
  setWetLevel,
  setDryLevel,
  updateParameter,
  applyReverbType,
}) => {
  const audioTheme = useAudioTheme();
  const styles = createReverbStyles();

  return (
    <View style={styles.compactLayout}>
      {/* Types de réverbération compacts */}
      <View style={styles.compactTypes}>
        {REVERB_TYPES.map((type) => (
          <TouchableOpacity
            key={type.type}
            style={[
              styles.compactTypeButton,
              selectedType === type.type && styles.compactTypeButtonActive
            ]}
            onPress={() => applyReverbType(type.type)}
          >
            <Text style={[
              styles.compactTypeText,
              selectedType === type.type && styles.compactTypeTextActive
            ]}>
              {type.icon}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contrôles principaux compacts */}
      <View style={styles.compactControls}>
        {/* Taille & Amortissement */}
        <View style={styles.compactRow}>
          <View style={styles.compactControl}>
            <Text style={styles.compactLabel}>Taille</Text>
            <Slider
              style={styles.compactSlider}
              value={roomSize}
              minimumValue={0}
              maximumValue={1}
              onValueChange={setRoomSize}
              onSlidingComplete={(value) => updateParameter('roomSize', value)}
              minimumTrackTintColor="#9C27B0"
              maximumTrackTintColor="#333"
              thumbTintColor="#9C27B0"
            />
          </View>
          <View style={styles.compactControl}>
            <Text style={styles.compactLabel}>Damping</Text>
            <Slider
              style={styles.compactSlider}
              value={damping}
              minimumValue={0}
              maximumValue={1}
              onValueChange={setDamping}
              onSlidingComplete={(value) => updateParameter('damping', value)}
              minimumTrackTintColor="#FF9800"
              maximumTrackTintColor="#333"
              thumbTintColor="#FF9800"
            />
          </View>
        </View>

        {/* Wet & Dry */}
        <View style={styles.compactRow}>
          <View style={styles.compactControl}>
            <Text style={styles.compactLabel}>Wet</Text>
            <Slider
              style={styles.compactSlider}
              value={wetLevel}
              minimumValue={0}
              maximumValue={1}
              onValueChange={setWetLevel}
              onSlidingComplete={(value) => updateParameter('wetLevel', value)}
              minimumTrackTintColor="#2196F3"
              maximumTrackTintColor="#333"
              thumbTintColor="#2196F3"
            />
          </View>
          <View style={styles.compactControl}>
            <Text style={styles.compactLabel}>Dry</Text>
            <Slider
              style={styles.compactSlider}
              value={dryLevel}
              minimumValue={0}
              maximumValue={1}
              onValueChange={setDryLevel}
              onSlidingComplete={(value) => updateParameter('dryLevel', value)}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#333"
              thumbTintColor="#4CAF50"
            />
          </View>
        </View>
      </View>
    </View>
  );
};