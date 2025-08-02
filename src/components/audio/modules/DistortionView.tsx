/**
 * Interface visuelle de la distorsion
 * Saturation et effets de distorsion harmonique
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { audioInterface } from '../../../audio/AudioInterface';

interface DistortionViewProps {
  moduleId: string;
}

const DISTORTION_TYPES = [
  { 
    id: 'tube', 
    name: 'Tube', 
    color: '#ff9500',
    preset: { drive: 45, tone: 65, outputGain: -3, mix: 85, asymmetry: 15, harmonics: 35, gateThreshold: -50 }
  },
  { 
    id: 'overdrive', 
    name: 'OD', 
    color: '#4a9eff',
    preset: { drive: 25, tone: 55, outputGain: 0, mix: 70, asymmetry: 5, harmonics: 20, gateThreshold: -60 }
  },
  { 
    id: 'fuzz', 
    name: 'Fuzz', 
    color: '#e91e63',
    preset: { drive: 75, tone: 40, outputGain: -6, mix: 90, asymmetry: -10, harmonics: 60, gateThreshold: -40 }
  },
  { 
    id: 'bitcrush', 
    name: 'Bit', 
    color: '#9c27b0',
    preset: { drive: 85, tone: 30, outputGain: -8, mix: 65, asymmetry: 0, harmonics: 80, gateThreshold: -70 }
  },
];

const SliderControl: React.FC<{
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  color: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}> = ({ label, value, unit = '', min, max, color, onChange, formatValue }) => (
  <View style={styles.control}>
    <View style={styles.controlHeader}>
      <Text style={styles.controlLabel}>{label}</Text>
      <Text style={styles.controlValue}>
        {formatValue ? formatValue(value) : `${value.toFixed(0)}${unit}`}
      </Text>
    </View>
    <Slider
      style={styles.slider}
      minimumValue={min}
      maximumValue={max}
      value={value}
      onValueChange={onChange}
      minimumTrackTintColor={color}
      maximumTrackTintColor="#333"
      thumbTintColor={color}
    />
  </View>
);

export const DistortionView: React.FC<DistortionViewProps> = ({ moduleId }) => {
  const [state, setState] = useState({
    drive: 30,
    tone: 50,
    outputGain: 0,
    mix: 50,
    asymmetry: 0,
    harmonics: 20,
    gateThreshold: -60,
    distortionType: 'tube',
  });

  const module = audioInterface.getModule(moduleId);

  useEffect(() => {
    if (!module) return;
    const typeIndex = module.getParameter('type') || 0;
    setState({
      drive: module.getParameter('drive') || 30,
      tone: module.getParameter('tone') || 50,
      outputGain: module.getParameter('outputGain') || 0,
      mix: module.getParameter('mix') || 50,
      asymmetry: module.getParameter('asymmetry') || 0,
      harmonics: module.getParameter('harmonics') || 20,
      gateThreshold: module.getParameter('gateThreshold') || -60,
      distortionType: DISTORTION_TYPES[typeIndex]?.id || 'tube',
    });
  }, [moduleId]);

  const updateParam = (key: string, value: number | string) => {
    if (!module) return;
    
    if (key === 'distortionType') {
      const selectedType = DISTORTION_TYPES.find(t => t.id === value);
      if (selectedType) {
        // Appliquer le preset complet
        const newState = {
          ...selectedType.preset,
          distortionType: value as string
        };
        setState(prev => ({ ...prev, ...newState }));
        
        // Mettre à jour tous les paramètres du module
        Object.entries(selectedType.preset).forEach(([param, paramValue]) => {
          module.setParameter(param, paramValue);
        });
        
        const typeIndex = DISTORTION_TYPES.findIndex(t => t.id === value);
        module.setParameter('type', typeIndex);
      }
    } else {
      setState(prev => ({ ...prev, [key]: value }));
      module.setParameter(key, value as number);
    }
  };

  if (!module) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Module non trouvé</Text>
      </View>
    );
  }

  const selectedType = DISTORTION_TYPES.find(t => t.id === state.distortionType) || DISTORTION_TYPES[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Distorsion</Text>
        <View style={styles.typeGrid}>
          {DISTORTION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                state.distortionType === type.id 
                  ? { borderColor: type.color, backgroundColor: type.color }
                  : { borderColor: '#333', backgroundColor: '#1a1a1a' }
              ]}
              onPress={() => updateParam('distortionType', type.id)}
            >
              <Text style={[
                styles.typeName,
                state.distortionType === type.id && styles.typeNameActive
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <SliderControl
          label="Drive"
          value={state.drive}
          unit="%"
          min={0}
          max={100}
          color={selectedType.color}
          onChange={(v) => updateParam('drive', v)}
        />

        <View style={styles.row}>
          <SliderControl
            label="Tone"
            value={state.tone}
            unit="%"
            min={0}
            max={100}
            color="#ff6b35"
            onChange={(v) => updateParam('tone', v)}
          />
          <SliderControl
            label="Mix"
            value={state.mix}
            unit="%"
            min={0}
            max={100}
            color="#4a9eff"
            onChange={(v) => updateParam('mix', v)}
          />
        </View>

        <SliderControl
          label="Gain"
          value={state.outputGain}
          min={-24}
          max={24}
          color="#00ff88"
          onChange={(v) => updateParam('outputGain', v)}
          formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} dB`}
        />

        <View style={styles.row}>
          <SliderControl
            label="Asymétrie"
            value={state.asymmetry}
            unit="%"
            min={-50}
            max={50}
            color="#ff9500"
            onChange={(v) => updateParam('asymmetry', v)}
          />
          <SliderControl
            label="Harmoniques"
            value={state.harmonics}
            unit="%"
            min={0}
            max={100}
            color="#e91e63"
            onChange={(v) => updateParam('harmonics', v)}
          />
        </View>

        <SliderControl
          label="Gate"
          value={state.gateThreshold}
          unit=" dB"
          min={-80}
          max={-10}
          color="#9c27b0"
          onChange={(v) => updateParam('gateThreshold', v)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 10,
    overflow: 'hidden',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 10,
  },
  header: {
    padding: 5,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 3,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderRadius: 4,
    padding: 4,
    alignItems: 'center',
    minHeight: 28,
    justifyContent: 'center',
  },
  typeName: {
    color: '#ccc',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  typeNameActive: {
    color: '#fff',
  },
  controls: {
    padding: 6,
    paddingBottom: 2,
    backgroundColor: '#161616',
    borderRadius: 8,
    margin: 2,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  control: {
    marginBottom: 8,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  controlValue: {
    fontSize: 10,
    fontWeight: '500',
    color: '#ccc',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  slider: {
    height: 24,
    marginVertical: 2,
  },
});