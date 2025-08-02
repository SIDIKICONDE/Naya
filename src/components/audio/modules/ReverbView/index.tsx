/**
 * Composant principal du module de réverbération
 * Gère l'interface et la logique du module d'effet de réverbération
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ReverbViewProps } from './types';
import { useReverbState } from './hooks/useReverbState';
import { CompactMode } from './components/CompactMode';
import { AdvancedMode } from './components/AdvancedMode';
import { DefaultMode } from './components/DefaultMode';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';
import { createReverbStyles } from './styles';

export const ReverbView: React.FC<ReverbViewProps> = ({ moduleId }) => {
  const audioTheme = useAudioTheme();
  const styles = createReverbStyles();
  const {
    selectedType,
    roomSize,
    damping,
    wetLevel,
    dryLevel,
    preDelay,
    width,
    compactMode,
    showAdvanced,
    setRoomSize,
    setDamping,
    setWetLevel,
    setDryLevel,
    setPreDelay,
    setWidth,
    setCompactMode,
    setShowAdvanced,
    updateParameter,
    applyReverbType,
    applyPreset,
    toggleCompactMode,
    toggleAdvancedMode,
  } = useReverbState(moduleId);

  return (
    <View style={[
      styles.container, 
      compactMode && styles.containerCompact,
      (!compactMode && !showAdvanced) && styles.containerDefault
    ]}>
      {/* Header */}
      <View style={[
        styles.header, 
        compactMode && styles.headerCompact,
        (!compactMode && !showAdvanced) && styles.headerDefault
      ]}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Réverbération</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.modeButton, compactMode && styles.modeButtonActive]}
              onPress={toggleCompactMode}
            >
              <Text style={[styles.modeButtonText, compactMode && styles.modeButtonTextActive]}>
                {compactMode ? '✓ Compact' : 'Compact'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, showAdvanced && styles.modeButtonActive]}
              onPress={toggleAdvancedMode}
            >
              <Text style={[styles.modeButtonText, showAdvanced && styles.modeButtonTextActive]}>
                {showAdvanced ? '✓ Avancé' : 'Avancé'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={[
        styles.scrollContainer, 
        compactMode && styles.scrollContainerCompact,
        (!compactMode && !showAdvanced) && styles.scrollContainerDefault
      ]}>
        {compactMode ? (
          <CompactMode
            selectedType={selectedType}
            roomSize={roomSize}
            damping={damping}
            wetLevel={wetLevel}
            dryLevel={dryLevel}
            setRoomSize={setRoomSize}
            setDamping={setDamping}
            setWetLevel={setWetLevel}
            setDryLevel={setDryLevel}
            updateParameter={updateParameter}
            applyReverbType={applyReverbType}
          />
        ) : showAdvanced ? (
          <AdvancedMode
            selectedType={selectedType}
            roomSize={roomSize}
            damping={damping}
            wetLevel={wetLevel}
            dryLevel={dryLevel}
            preDelay={preDelay}
            width={width}
            setRoomSize={setRoomSize}
            setDamping={setDamping}
            setWetLevel={setWetLevel}
            setDryLevel={setDryLevel}
            setPreDelay={setPreDelay}
            setWidth={setWidth}
            updateParameter={updateParameter}
            applyReverbType={applyReverbType}
            applyPreset={applyPreset}
          />
        ) : (
          <DefaultMode
            setCompactMode={setCompactMode}
            setShowAdvanced={setShowAdvanced}
          />
        )}
      </ScrollView>
    </View>
  );
};