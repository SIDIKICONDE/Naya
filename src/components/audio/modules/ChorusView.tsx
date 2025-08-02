/**
 * Interface visuelle du chorus
 * Effet de modulation et enrichissement harmonique
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { audioInterface } from '../../../audio/AudioInterface';
import { useTranslation } from '../../../i18n';

interface ChorusViewProps {
  moduleId: string;
}

const getChorusTypes = (t: (key: string) => string) => [
  { 
    id: 'classic', 
    name: t('audio:modules.chorus.types.classic'), 
    color: '#4a9eff',
    params: { rate: 1.2, depth: 40, wetLevel: 35, dryLevel: 80, delay: 5, feedback: 10, voices: 2, spread: 50 }
  },
  { 
    id: 'ensemble', 
    name: t('audio:modules.chorus.types.ensemble'), 
    color: '#00ff88',
    params: { rate: 0.8, depth: 60, wetLevel: 50, dryLevel: 70, delay: 8, feedback: 15, voices: 4, spread: 80 }
  },
  { 
    id: 'vintage', 
    name: t('audio:modules.chorus.types.vintage'), 
    color: '#ff9500',
    params: { rate: 2.0, depth: 70, wetLevel: 40, dryLevel: 75, delay: 12, feedback: 25, voices: 2, spread: 60 }
  },
  { 
    id: 'modern', 
    name: t('audio:modules.chorus.types.modern'), 
    color: '#e91e63',
    params: { rate: 3.5, depth: 55, wetLevel: 45, dryLevel: 65, delay: 4, feedback: 8, voices: 6, spread: 90 }
  },
];

export const ChorusView: React.FC<ChorusViewProps> = ({ moduleId }) => {
  const [rate, setRate] = useState(0.5);
  const [depth, setDepth] = useState(50);
  const [feedback, setFeedback] = useState(15);
  const [wetLevel, setWetLevel] = useState(40);
  const [dryLevel, setDryLevel] = useState(70);
  const [delay, setDelay] = useState(7);
  const [voices, setVoices] = useState(2);
  const [spread, setSpread] = useState(60);
  const [chorusType, setChorusType] = useState('classic');
  const [compactMode, setCompactMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const module = audioInterface.getModule(moduleId);
  const { t } = useTranslation();
  const CHORUS_TYPES = getChorusTypes(t);

  useEffect(() => {
    if (!module) return;

    // Charger les valeurs initiales
    setRate(module.getParameter('rate') || 0.5);
    setDepth(module.getParameter('depth') || 50);
    setFeedback(module.getParameter('feedback') || 15);
    setWetLevel(module.getParameter('wetLevel') || 40);
    setDryLevel(module.getParameter('dryLevel') || 70);
    setDelay(module.getParameter('delay') || 7);
    setVoices(module.getParameter('voices') || 2);
    setSpread(module.getParameter('spread') || 60);
    
    const typeIndex = module.getParameter('type') || 0;
    setChorusType(CHORUS_TYPES[typeIndex]?.id || 'classic');
  }, [moduleId]);

  const updateParameter = (parameter: string, value: number) => {
    if (!module) return;
    module.setParameter(parameter, value);
  };

  const handleTypeChange = (typeId: string) => {
    setChorusType(typeId);
    const typeIndex = CHORUS_TYPES.findIndex(t => t.id === typeId);
    const selectedType = CHORUS_TYPES[typeIndex];
    
    if (selectedType) {
      // Appliquer tous les paramètres du type
      const params = selectedType.params;
      
      // Mettre à jour l'état local
      setRate(params.rate);
      setDepth(params.depth);
      setWetLevel(params.wetLevel);
      setDryLevel(params.dryLevel);
      setDelay(params.delay);
      setFeedback(params.feedback);
      setVoices(params.voices);
      setSpread(params.spread);
      
      // Mettre à jour le module audio
      updateParameter('type', typeIndex);
      updateParameter('rate', params.rate);
      updateParameter('depth', params.depth);
      updateParameter('wetLevel', params.wetLevel);
      updateParameter('dryLevel', params.dryLevel);
      updateParameter('delay', params.delay);
      updateParameter('feedback', params.feedback);
      updateParameter('voices', params.voices);
      updateParameter('spread', params.spread);
    }
  };

  if (!module) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Module non trouvé</Text>
      </View>
    );
  }

  const selectedType = CHORUS_TYPES.find(t => t.id === chorusType) || CHORUS_TYPES[0];

  return (
    <View style={styles.container}>
      {/* Header compact */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{t('audio:modules.chorus.title')}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.modeButton, compactMode && styles.modeButtonActive]}
              onPress={() => setCompactMode(!compactMode)}
            >
              <Text style={[styles.modeButtonText, compactMode && styles.modeButtonTextActive]}>
                {compactMode ? t('audio:modules.chorus.modes.compactActive') : t('audio:modules.chorus.modes.compact')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, showAdvanced && styles.modeButtonActive]}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text style={[styles.modeButtonText, showAdvanced && styles.modeButtonTextActive]}>
                {showAdvanced ? t('audio:modules.chorus.modes.advancedActive') : t('audio:modules.chorus.modes.advanced')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {compactMode ? (
          /* Mode compact */
          <View style={styles.compactLayout}>
            {/* Types en ligne */}
            <View style={styles.compactTypes}>
              {CHORUS_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.compactTypeButton,
                    chorusType === type.id && { backgroundColor: type.color }
                  ]}
                  onPress={() => handleTypeChange(type.id)}
                >
                  <Text style={[
                    styles.compactTypeText,
                    chorusType === type.id && styles.compactTypeTextActive
                  ]}>
                    {type.name[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Contrôles principaux compacts */}
            <View style={styles.compactControls}>
              {/* Rate & Depth */}
              <View style={styles.compactRow}>
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>{t('audio:modules.chorus.controls.rate')}</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={0.1}
                    maximumValue={5.0}
                    value={rate}
                    onValueChange={(value) => {
                      setRate(value);
                      updateParameter('rate', value);
                    }}
                    minimumTrackTintColor={selectedType.color}
                    maximumTrackTintColor="#333"
                    thumbTintColor={selectedType.color}
                  />
                </View>
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>{t('audio:modules.chorus.controls.depth')}</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={depth}
                    onValueChange={(value) => {
                      setDepth(value);
                      updateParameter('depth', value);
                    }}
                    minimumTrackTintColor={selectedType.color}
                    maximumTrackTintColor="#333"
                    thumbTintColor={selectedType.color}
                  />
                </View>
              </View>

              {/* Wet & Dry */}
              <View style={styles.compactRow}>
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>{t('audio:modules.chorus.controls.wet')}</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={wetLevel}
                    onValueChange={(value) => {
                      setWetLevel(value);
                      updateParameter('wetLevel', value);
                    }}
                    minimumTrackTintColor="#e91e63"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#e91e63"
                  />
                </View>
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>{t('audio:modules.chorus.controls.dry')}</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={dryLevel}
                    onValueChange={(value) => {
                      setDryLevel(value);
                      updateParameter('dryLevel', value);
                    }}
                    minimumTrackTintColor="#9c27b0"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#9c27b0"
                  />
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Mode normal */
          <>
            {/* Type de chorus */}
            <View style={styles.typeSection}>
              <Text style={styles.sectionTitle}>Type de chorus</Text>
              <View style={styles.typeGrid}>
                {CHORUS_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeButton,
                      { borderColor: type.color },
                      chorusType === type.id && { backgroundColor: type.color }
                    ]}
                    onPress={() => handleTypeChange(type.id)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      chorusType === type.id && styles.typeButtonTextActive
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Contrôles LFO en mode normal */}
            <View style={styles.normalSection}>
              <Text style={styles.sectionTitle}>Contrôles</Text>
              
              {/* Rate & Depth */}
              <View style={styles.normalRow}>
                <View style={styles.normalControl}>
                  <Text style={styles.normalLabel}>Vitesse</Text>
                  <Text style={styles.normalValue}>{rate.toFixed(2)} Hz</Text>
                  <Slider
                    style={styles.normalSlider}
                    minimumValue={0.1}
                    maximumValue={5.0}
                    value={rate}
                    onValueChange={(value) => {
                      setRate(value);
                      updateParameter('rate', value);
                    }}
                    minimumTrackTintColor={selectedType.color}
                    maximumTrackTintColor="#333"
                    thumbTintColor={selectedType.color}
                  />
                </View>
                
                <View style={styles.normalControl}>
                  <Text style={styles.normalLabel}>Profondeur</Text>
                  <Text style={styles.normalValue}>{depth.toFixed(0)}%</Text>
                  <Slider
                    style={styles.normalSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={depth}
                    onValueChange={(value) => {
                      setDepth(value);
                      updateParameter('depth', value);
                    }}
                    minimumTrackTintColor={selectedType.color}
                    maximumTrackTintColor="#333"
                    thumbTintColor={selectedType.color}
                  />
                </View>
              </View>

              {/* Wet & Dry */}
              <View style={styles.normalRow}>
                <View style={styles.normalControl}>
                  <Text style={styles.normalLabel}>Niveau Wet</Text>
                  <Text style={styles.normalValue}>{wetLevel.toFixed(0)}%</Text>
                  <Slider
                    style={styles.normalSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={wetLevel}
                    onValueChange={(value) => {
                      setWetLevel(value);
                      updateParameter('wetLevel', value);
                    }}
                    minimumTrackTintColor="#e91e63"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#e91e63"
                  />
                </View>
                
                <View style={styles.normalControl}>
                  <Text style={styles.normalLabel}>Niveau Dry</Text>
                  <Text style={styles.normalValue}>{dryLevel.toFixed(0)}%</Text>
                  <Slider
                    style={styles.normalSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={dryLevel}
                    onValueChange={(value) => {
                      setDryLevel(value);
                      updateParameter('dryLevel', value);
                    }}
                    minimumTrackTintColor="#9c27b0"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#9c27b0"
                  />
                </View>
              </View>
            </View>

            {/* Contrôles avancés en mode normal */}
            {showAdvanced && (
              <>
                {/* Contrôles avancés - LFO */}
                <View style={styles.advancedSection}>
                  <Text style={styles.sectionTitle}>Avancé</Text>
                  
                  {/* Delay, Feedback, Voices, Spread */}
                  <View style={styles.advancedGrid}>
                    <View style={styles.advancedControl}>
                      <Text style={styles.advancedLabel}>{t('audio:modules.chorus.controls.delay')}</Text>
                      <Text style={styles.advancedValue}>{delay.toFixed(1)}ms</Text>
                      <Slider
                        style={styles.advancedSlider}
                        minimumValue={1}
                        maximumValue={20}
                        value={delay}
                        onValueChange={(value) => {
                          setDelay(value);
                          updateParameter('delay', value);
                        }}
                        minimumTrackTintColor="#ff6b35"
                        maximumTrackTintColor="#333"
                        thumbTintColor="#ff6b35"
                      />
                    </View>
                    
                    <View style={styles.advancedControl}>
                      <Text style={styles.advancedLabel}>{t('audio:modules.chorus.controls.feedback')}</Text>
                      <Text style={styles.advancedValue}>{feedback.toFixed(0)}%</Text>
                      <Slider
                        style={styles.advancedSlider}
                        minimumValue={0}
                        maximumValue={50}
                        value={feedback}
                        onValueChange={(value) => {
                          setFeedback(value);
                          updateParameter('feedback', value);
                        }}
                        minimumTrackTintColor="#4a9eff"
                        maximumTrackTintColor="#333"
                        thumbTintColor="#4a9eff"
                      />
                    </View>
                    
                    <View style={styles.advancedControl}>
                      <Text style={styles.advancedLabel}>{t('audio:modules.chorus.controls.voices')}</Text>
                      <Text style={styles.advancedValue}>{voices.toFixed(0)}</Text>
                      <Slider
                        style={styles.advancedSlider}
                        minimumValue={1}
                        maximumValue={8}
                        step={1}
                        value={voices}
                        onValueChange={(value) => {
                          setVoices(value);
                          updateParameter('voices', value);
                        }}
                        minimumTrackTintColor="#00ff88"
                        maximumTrackTintColor="#333"
                        thumbTintColor="#00ff88"
                      />
                    </View>
                    
                    <View style={styles.advancedControl}>
                      <Text style={styles.advancedLabel}>{t('audio:modules.chorus.controls.spread')}</Text>
                      <Text style={styles.advancedValue}>{spread.toFixed(0)}%</Text>
                      <Slider
                        style={styles.advancedSlider}
                        minimumValue={0}
                        maximumValue={100}
                        value={spread}
                        onValueChange={(value) => {
                          setSpread(value);
                          updateParameter('spread', value);
                        }}
                        minimumTrackTintColor="#ff9500"
                        maximumTrackTintColor="#333"
                        thumbTintColor="#ff9500"
                      />
                    </View>
                  </View>
                </View>
              </>
            )}
          </>
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
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
  scrollContainer: {
    flex: 1,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 20,
  },
  // Styles mode compact
  compactLayout: {
    padding: 10,
  },
  compactTypes: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
    justifyContent: 'center',
  },
  compactTypeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  compactTypeText: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
  },
  compactTypeTextActive: {
    color: '#fff',
  },
  compactControls: {
    gap: 8,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 8,
  },
  compactControl: {
    flex: 1,
  },
  compactLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactSlider: {
    height: 6,
    transform: [{ scaleY: 0.5 }],
  },
  // Styles mode normal
  typeSection: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeButton: {
    flex: 0.48,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  typeButtonText: {
    color: '#ccc',
    fontSize: 11,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  // Styles mode normal
  normalSection: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  normalRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  normalControl: {
    flex: 1,
  },
  normalLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  normalValue: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  normalSlider: {
    height: 10,
    transform: [{ scaleY: 0.8 }],
  },
  // Styles contrôles avancés
  advancedSection: {
    padding: 12,
    backgroundColor: '#1a1a1a',
    margin: 8,
    borderRadius: 8,
  },
  advancedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  advancedControl: {
    flex: 0.48,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 8,
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
});