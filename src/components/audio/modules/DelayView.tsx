import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { audioInterface } from '../../../audio/AudioInterface';

interface DelayViewProps {
  moduleId: string;
}

const DELAY_PRESETS = [
  { label: '1/8', value: 125, note: '♪' },
  { label: '1/4', value: 250, note: '♩' },
  { label: '1/2', value: 500, note: '♪.' },
  { label: '1/1', value: 1000, note: '○' },
];



export const DelayView: React.FC<DelayViewProps> = ({ moduleId }) => {
  const [state, setState] = useState({
    delayTime: 250,
    feedback: 30,
    wetLevel: 25,
    dryLevel: 100,
    highCut: 8000,
    lowCut: 100,
    stereoWidth: 50,
    sync: false,
  });
  const [compactMode, setCompactMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const module = audioInterface.getModule(moduleId);

  useEffect(() => {
    if (!module) return;
    setState({
      delayTime: module.getParameter('delayTime') || 250,
      feedback: module.getParameter('feedback') || 30,
      wetLevel: module.getParameter('wetLevel') || 25,
      dryLevel: module.getParameter('dryLevel') || 100,
      highCut: module.getParameter('highCut') || 8000,
      lowCut: module.getParameter('lowCut') || 100,
      stereoWidth: module.getParameter('stereoWidth') || 50,
      sync: module.getParameter('sync') !== 0,
    });
  }, [moduleId]);

  const updateParam = (key: string, value: number | boolean) => {
    if (!module) return;
    const numValue = typeof value === 'boolean' ? (value ? 1 : 0) : value;
    setState(prev => ({ ...prev, [key]: value }));
    module.setParameter(key, numValue);
  };

  if (!module) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Module non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      compactMode && styles.containerCompact,
      (!compactMode && !showAdvanced) && styles.containerDefault
    ]}>
      {/* Header compact */}
      <View style={[
        styles.header, 
        compactMode && styles.headerCompact,
        (!compactMode && !showAdvanced) && styles.headerDefault
      ]}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Delay</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.syncBtn, state.sync && styles.syncBtnActive]}
              onPress={() => updateParam('sync', !state.sync)}
            >
              <Text style={[styles.syncText, state.sync && styles.syncTextActive]}>
                {state.sync ? 'S' : 'F'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, compactMode && styles.modeButtonActive]}
              onPress={() => {
                setCompactMode(!compactMode);
                setShowAdvanced(false); // Passer en compact désactive avancé
              }}
            >
              <Text style={[styles.modeButtonText, compactMode && styles.modeButtonTextActive]}>
                {compactMode ? '✓ Compact' : 'Compact'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, showAdvanced && styles.modeButtonActive]}
              onPress={() => {
                setShowAdvanced(!showAdvanced);
                setCompactMode(false); // Passer en avancé désactive compact
              }}
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
          /* Mode compact */
          <View style={styles.compactLayout}>
            {/* Presets sync en mode compact */}
            {state.sync && (
              <View style={styles.compactPresets}>
                {DELAY_PRESETS.map(preset => (
                  <TouchableOpacity
                    key={preset.value}
                    style={[styles.compactPreset, state.delayTime === preset.value && styles.compactPresetActive]}
                    onPress={() => updateParam('delayTime', preset.value)}
                  >
                    <Text style={styles.compactPresetNote}>{preset.note}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Contrôles principaux compacts */}
            <View style={styles.compactControls}>
              {/* Temps & Feedback */}
              <View style={styles.compactRow}>
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>Temps</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={1}
                    maximumValue={2000}
                    value={state.delayTime}
                    onValueChange={(v) => updateParam('delayTime', v)}
                    minimumTrackTintColor="#ff6b35"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#ff6b35"
                    disabled={state.sync}
                  />
                </View>
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>Feedback</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={0}
                    maximumValue={95}
                    value={state.feedback}
                    onValueChange={(v) => updateParam('feedback', v)}
                    minimumTrackTintColor="#4a9eff"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#4a9eff"
                  />
                </View>
              </View>

              {/* Wet & Dry */}
              <View style={styles.compactRow}>
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>Wet</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={state.wetLevel}
                    onValueChange={(v) => updateParam('wetLevel', v)}
                    minimumTrackTintColor="#00ff88"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#00ff88"
                  />
                </View>
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>Dry</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={state.dryLevel}
                    onValueChange={(v) => updateParam('dryLevel', v)}
                    minimumTrackTintColor="#ff9500"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#ff9500"
                  />
                </View>
              </View>
            </View>
          </View>
        ) : showAdvanced ? (
          /* Mode avancé complet */
          <View style={styles.advancedLayout}>
            {/* Presets sync en mode avancé */}
            {state.sync && (
              <View style={styles.presets}>
                {DELAY_PRESETS.map(preset => (
                  <TouchableOpacity
                    key={preset.value}
                    style={[styles.preset, state.delayTime === preset.value && styles.presetActive]}
                    onPress={() => updateParam('delayTime', preset.value)}
                  >
                    <Text style={styles.presetNote}>{preset.note}</Text>
                    <Text style={styles.presetLabel}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Contrôles principaux en mode avancé */}
            <View style={styles.advancedMainSection}>
              <Text style={styles.sectionTitle}>Contrôles principaux</Text>
              
              {/* Temps & Feedback */}
              <View style={styles.advancedMainRow}>
                <View style={styles.advancedMainControl}>
                  <Text style={styles.advancedMainLabel}>Temps</Text>
                  <Text style={styles.advancedMainValue}>{state.delayTime.toFixed(0)} ms</Text>
                  <Slider
                    style={styles.advancedMainSlider}
                    minimumValue={1}
                    maximumValue={2000}
                    value={state.delayTime}
                    onValueChange={(v) => updateParam('delayTime', v)}
                    minimumTrackTintColor="#ff6b35"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#ff6b35"
                    disabled={state.sync}
                  />
                </View>
                
                <View style={styles.advancedMainControl}>
                  <Text style={styles.advancedMainLabel}>Feedback</Text>
                  <Text style={styles.advancedMainValue}>{state.feedback.toFixed(0)}%</Text>
                  <Slider
                    style={styles.advancedMainSlider}
                    minimumValue={0}
                    maximumValue={95}
                    value={state.feedback}
                    onValueChange={(v) => updateParam('feedback', v)}
                    minimumTrackTintColor="#4a9eff"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#4a9eff"
                  />
                </View>
              </View>

              {/* Wet & Dry */}
              <View style={styles.advancedMainRow}>
                <View style={styles.advancedMainControl}>
                  <Text style={styles.advancedMainLabel}>Wet</Text>
                  <Text style={styles.advancedMainValue}>{state.wetLevel.toFixed(0)}%</Text>
                  <Slider
                    style={styles.advancedMainSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={state.wetLevel}
                    onValueChange={(v) => updateParam('wetLevel', v)}
                    minimumTrackTintColor="#00ff88"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#00ff88"
                  />
                </View>
                
                <View style={styles.advancedMainControl}>
                  <Text style={styles.advancedMainLabel}>Dry</Text>
                  <Text style={styles.advancedMainValue}>{state.dryLevel.toFixed(0)}%</Text>
                  <Slider
                    style={styles.advancedMainSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={state.dryLevel}
                    onValueChange={(v) => updateParam('dryLevel', v)}
                    minimumTrackTintColor="#ff9500"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#ff9500"
                  />
                </View>
              </View>
            </View>

            {/* Contrôles techniques avancés */}
            <View style={styles.advancedSection}>
              <Text style={styles.sectionTitle}>Contrôles techniques</Text>
              
              <View style={styles.advancedGrid}>
                <View style={styles.advancedControl}>
                  <Text style={styles.advancedLabel}>Passe-bas</Text>
                  <Text style={styles.advancedValue}>
                    {state.highCut >= 20000 ? '∞' : `${(state.highCut / 1000).toFixed(1)} kHz`}
                  </Text>
                  <Slider
                    style={styles.advancedSlider}
                    minimumValue={1000}
                    maximumValue={20000}
                    value={state.highCut}
                    onValueChange={(v) => updateParam('highCut', v)}
                    minimumTrackTintColor="#e91e63"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#e91e63"
                  />
                </View>
                
                <View style={styles.advancedControl}>
                  <Text style={styles.advancedLabel}>Passe-haut</Text>
                  <Text style={styles.advancedValue}>{state.lowCut.toFixed(0)} Hz</Text>
                  <Slider
                    style={styles.advancedSlider}
                    minimumValue={20}
                    maximumValue={1000}
                    value={state.lowCut}
                    onValueChange={(v) => updateParam('lowCut', v)}
                    minimumTrackTintColor="#9c27b0"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#9c27b0"
                  />
                </View>
                
                <View style={styles.advancedControl}>
                  <Text style={styles.advancedLabel}>Largeur stéréo</Text>
                  <Text style={styles.advancedValue}>{state.stereoWidth.toFixed(0)}%</Text>
                  <Slider
                    style={styles.advancedSlider}
                    minimumValue={0}
                    maximumValue={200}
                    value={state.stereoWidth}
                    onValueChange={(v) => updateParam('stereoWidth', v)}
                    minimumTrackTintColor="#607d8b"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#607d8b"
                  />
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Mode de base (par défaut) */
          <View style={styles.defaultLayout}>
            <Text style={styles.modeInstruction}>
              Choisissez un mode d'affichage :
            </Text>
            <View style={styles.modeSelection}>
              <TouchableOpacity
                style={styles.modeSelectionButton}
                onPress={() => setCompactMode(true)}
              >
                <Text style={styles.modeSelectionText}>📱 Mode Compact</Text>
                <Text style={styles.modeSelectionDesc}>Interface minimaliste</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modeSelectionButton}
                onPress={() => setShowAdvanced(true)}
              >
                <Text style={styles.modeSelectionText}>🎛️ Mode Avancé</Text>
                <Text style={styles.modeSelectionDesc}>Tous les contrôles</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 12,
  },
  containerCompact: {
    flex: 0,
    minHeight: 'auto',
    borderRadius: 10,
  },
  containerDefault: {
    flex: 0,
    minHeight: 'auto',
    borderRadius: 10,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 10,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerCompact: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    marginBottom: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerDefault: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContainerCompact: {
    flex: 0,
    flexGrow: 0,
  },
  scrollContainerDefault: {
    flex: 0,
    flexGrow: 0,
  },
  syncBtn: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#555',
  },
  syncBtnActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  syncText: {
    color: '#888',
    fontSize: 9,
    fontWeight: '600',
  },
  syncTextActive: {
    color: '#fff',
  },
  modeButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#555',
  },
  modeButtonActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  modeButtonText: {
    color: '#888',
    fontSize: 9,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  // Styles mode compact
  compactLayout: {
    padding: 8,
    margin: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  compactPresets: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    justifyContent: 'center',
  },
  compactPreset: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  compactPresetActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  compactPresetNote: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  compactControls: {
    gap: 8,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  compactControl: {
    flex: 1,
  },
  compactLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  compactSlider: {
    height: 6,
    transform: [{ scaleY: 0.5 }],
  },
  // Styles mode avancé
  advancedLayout: {
    padding: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  advancedMainSection: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 8,
  },
  advancedMainRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  advancedMainControl: {
    flex: 1,
  },
  advancedMainLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  advancedMainValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  advancedMainSlider: {
    height: 12,
    transform: [{ scaleY: 0.9 }],
  },
  // Styles mode par défaut
  defaultLayout: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  modeInstruction: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  modeSelection: {
    flexDirection: 'row',
    gap: 8,
  },
  modeSelectionButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 100,
  },
  modeSelectionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  modeSelectionDesc: {
    color: '#888',
    fontSize: 9,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  // Styles contrôles avancés
  advancedSection: {
    padding: 12,
    backgroundColor: '#1a1a1a',
    margin: 8,
    borderRadius: 8,
  },
  advancedGrid: {
    gap: 8,
  },
  advancedControl: {
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  advancedLabel: {
    color: '#888',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 2,
  },
  advancedValue: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  advancedSlider: {
    height: 8,
    transform: [{ scaleY: 0.6 }],
  },
  // Styles presets normaux (maintenus)
  presets: {
    flexDirection: 'row',
    gap: 3,
    padding: 1,
    backgroundColor: '#0f0f0f',
    borderRadius: 4,
    margin: 3,
  },
  preset: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    padding: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  presetActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  presetNote: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 0,
  },
  presetLabel: {
    fontSize: 10,
    color: '#ccc',
    fontWeight: '500',
  },
});