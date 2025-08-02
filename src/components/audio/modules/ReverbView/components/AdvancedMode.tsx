/**
 * Mode d'affichage avancé pour le module de réverbération
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { ReverbType, ReverbPreset } from '../types';
import { REVERB_TYPES, REVERB_PRESETS } from '../constants';
import SpatialVisualization from './SpatialVisualization';
import { useAudioTheme } from '../../../../../theme/hooks/useAudioTheme';
import { createReverbStyles } from '../styles';

interface AdvancedModeProps {
  selectedType: ReverbType;
  roomSize: number;
  damping: number;
  wetLevel: number;
  dryLevel: number;
  preDelay: number;
  width: number;
  setRoomSize: (value: number) => void;
  setDamping: (value: number) => void;
  setWetLevel: (value: number) => void;
  setDryLevel: (value: number) => void;
  setPreDelay: (value: number) => void;
  setWidth: (value: number) => void;
  updateParameter: (param: string, value: number) => void;
  applyReverbType: (type: ReverbType) => void;
  applyPreset: (preset: ReverbPreset) => void;
}

export const AdvancedMode: React.FC<AdvancedModeProps> = ({
  selectedType,
  roomSize,
  damping,
  wetLevel,
  dryLevel,
  preDelay,
  width,
  setRoomSize,
  setDamping,
  setWetLevel,
  setDryLevel,
  setPreDelay,
  setWidth,
  updateParameter,
  applyReverbType,
  applyPreset,
}) => {
  const audioTheme = useAudioTheme();
  const styles = createReverbStyles();

  return (
    <View style={styles.advancedLayout}>
      {/* Visualisation spatiale */}
      <View style={styles.advancedVisualContainer}>
        <SpatialVisualization
          roomSize={roomSize}
          damping={damping}
          wetLevel={wetLevel}
          width={width}
        />
      </View>

      {/* Sélecteur de type avancé */}
      <View style={styles.advancedTypeSection}>
        <Text style={styles.sectionTitle}>Type de réverbération</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.advancedTypeList}
        >
          {REVERB_TYPES.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.advancedTypeButton,
                selectedType === type.type && styles.advancedTypeButtonActive,
              ]}
              onPress={() => applyReverbType(type.type)}
            >
              <Text style={styles.advancedTypeIcon}>{type.icon}</Text>
              <Text style={styles.advancedTypeName}>{type.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contrôles principaux en mode avancé */}
      <View style={styles.advancedMainSection}>
        <Text style={styles.sectionTitle}>Contrôles principaux</Text>
        
        {/* Taille & Amortissement */}
        <View style={styles.advancedMainRow}>
          <View style={styles.advancedMainControl}>
            <Text style={styles.advancedMainLabel}>Taille de la salle</Text>
            <Text style={styles.advancedMainValue}>{(roomSize * 100).toFixed(0)}%</Text>
            <Slider
              style={styles.advancedMainSlider}
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
          
          <View style={styles.advancedMainControl}>
            <Text style={styles.advancedMainLabel}>Amortissement</Text>
            <Text style={styles.advancedMainValue}>{(damping * 100).toFixed(0)}%</Text>
            <Slider
              style={styles.advancedMainSlider}
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

        {/* Mix Wet/Dry */}
        <View style={styles.advancedMainRow}>
          <View style={styles.advancedMainControl}>
            <Text style={styles.advancedMainLabel}>Effet (Wet)</Text>
            <Text style={styles.advancedMainValue}>{(wetLevel * 100).toFixed(0)}%</Text>
            <Slider
              style={styles.advancedMainSlider}
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
          
          <View style={styles.advancedMainControl}>
            <Text style={styles.advancedMainLabel}>Direct (Dry)</Text>
            <Text style={styles.advancedMainValue}>{(dryLevel * 100).toFixed(0)}%</Text>
            <Slider
              style={styles.advancedMainSlider}
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

      {/* Contrôles techniques avancés */}
      <View style={styles.advancedSection}>
        <Text style={styles.sectionTitle}>Contrôles techniques</Text>
        
        <View style={styles.advancedGrid}>
          <View style={styles.advancedControl}>
            <Text style={styles.advancedLabel}>Pré-délai</Text>
            <Text style={styles.advancedValue}>{preDelay.toFixed(0)} ms</Text>
            <Slider
              style={styles.advancedSlider}
              value={preDelay}
              minimumValue={0}
              maximumValue={200}
              onValueChange={setPreDelay}
              onSlidingComplete={(value) => updateParameter('preDelay', value)}
              minimumTrackTintColor="#FF5722"
              maximumTrackTintColor="#333"
              thumbTintColor="#FF5722"
            />
          </View>
          
          <View style={styles.advancedControl}>
            <Text style={styles.advancedLabel}>Largeur stéréo</Text>
            <Text style={styles.advancedValue}>{(width * 100).toFixed(0)}%</Text>
            <Slider
              style={styles.advancedSlider}
              value={width}
              minimumValue={0}
              maximumValue={1}
              onValueChange={setWidth}
              onSlidingComplete={(value) => updateParameter('width', value)}
              minimumTrackTintColor="#00BCD4"
              maximumTrackTintColor="#333"
              thumbTintColor="#00BCD4"
            />
          </View>
        </View>
      </View>

      {/* Presets */}
      <View style={styles.advancedPresetSection}>
        <Text style={styles.sectionTitle}>Presets</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.advancedPresetList}
        >
          {REVERB_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.name}
              style={styles.advancedPresetButton}
              onPress={() => applyPreset(preset)}
            >
              <Text style={styles.advancedPresetButtonText}>{preset.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};