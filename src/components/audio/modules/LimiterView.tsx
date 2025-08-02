/**
 * Interface visuelle du limiteur ultra-compacte
 * Modes Compact et Avancé avec contrôles de limitation dynamique
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

interface LimiterViewProps {
  moduleId: string;
}

export const LimiterView: React.FC<LimiterViewProps> = ({ moduleId }) => {
  const [threshold, setThreshold] = useState(-6);
  const [release, setRelease] = useState(50);
  const [lookAhead, setLookAhead] = useState(5);
  const [outputGain, setOutputGain] = useState(0);
  const [compactMode, setCompactMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const module = audioInterface.getModule(moduleId);
  const { t } = useTranslation();

  useEffect(() => {
    if (!module) return;

    // Charger les valeurs initiales
    setThreshold(module.getParameter('threshold') || -6);
    setRelease(module.getParameter('release') || 50);
    setLookAhead(module.getParameter('lookAhead') || 5);
    setOutputGain(module.getParameter('outputGain') || 0);
  }, [moduleId]);

  const updateParameter = (parameter: string, value: number) => {
    if (!module) return;
    module.setParameter(parameter, value);
  };

  const toggleCompact = () => {
    setCompactMode(!compactMode);
    if (!compactMode) setShowAdvanced(false);
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
    if (!showAdvanced) setCompactMode(false);
  };

  if (!module) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Module non trouvé</Text>
      </View>
    );
  }

  // Mode par défaut - écran de sélection
  if (!compactMode && !showAdvanced) {
    return (
      <View style={[styles.container, styles.containerDefault]}>
        <View style={[styles.header, styles.headerDefault]}>
          <Text style={styles.title}>{t('audio:modules.limiter.title')}</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity style={styles.modeButton} onPress={toggleCompact}>
              <Text style={styles.modeButtonText}>{t('audio:modules.limiter.modes.compact')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modeButton} onPress={toggleAdvanced}>
              <Text style={styles.modeButtonText}>{t('audio:modules.limiter.modes.advanced')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView style={[styles.scrollContainer, styles.scrollContainerDefault]}>
          <View style={styles.defaultLayout}>
            <Text style={styles.modeInstruction}>{t('audio:modules.limiter.display.title')}</Text>
            <View style={styles.modeSelection}>
              <TouchableOpacity style={styles.modeSelectionButton} onPress={toggleCompact}>
                <Text style={styles.modeSelectionText}>{t('audio:modules.limiter.display.compact.title')}</Text>
                <Text style={styles.modeSelectionDesc}>{t('audio:modules.limiter.display.compact.description')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modeSelectionButton} onPress={toggleAdvanced}>
                <Text style={styles.modeSelectionText}>{t('audio:modules.limiter.display.advanced.title')}</Text>
                <Text style={styles.modeSelectionDesc}>{t('audio:modules.limiter.display.advanced.description')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      compactMode && styles.containerCompact
    ]}>
      <View style={[
        styles.header,
        compactMode && styles.headerCompact
      ]}>
        <Text style={styles.title}>🛡️ Limiteur</Text>
        <View style={styles.modeButtons}>
          <TouchableOpacity 
            style={[styles.modeButton, compactMode && styles.modeButtonActive]} 
            onPress={toggleCompact}
          >
            <Text style={[styles.modeButtonText, compactMode && styles.modeButtonTextActive]}>
              {compactMode ? t('audio:modules.limiter.modes.compactActive') : t('audio:modules.limiter.modes.compact')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, showAdvanced && styles.modeButtonActive]} 
            onPress={toggleAdvanced}
          >
            <Text style={[styles.modeButtonText, showAdvanced && styles.modeButtonTextActive]}>
              {showAdvanced ? t('audio:modules.limiter.modes.advancedActive') : t('audio:modules.limiter.modes.advanced')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={[
        styles.scrollContainer,
        compactMode && styles.scrollContainerCompact
      ]}>
        {compactMode ? (
          // Mode Compact
          <View style={styles.compactLayout}>
            <Text style={styles.compactTitle}>{t('audio:modules.limiter.controls.title')}</Text>
            <View style={styles.compactControls}>
              <View style={styles.compactRow}>
                {/* Seuil */}
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>{t('audio:modules.limiter.controls.threshold')}</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={-30}
                    maximumValue={0}
                    value={threshold}
                    onValueChange={(value) => {
                      setThreshold(value);
                      updateParameter('threshold', value);
                    }}
                    minimumTrackTintColor="#ff6b35"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#ff6b35"
                  />
                </View>

                {/* Release */}
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>{t('audio:modules.limiter.controls.release')}</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={1}
                    maximumValue={1000}
                    value={release}
                    onValueChange={(value) => {
                      setRelease(value);
                      updateParameter('release', value);
                    }}
                    minimumTrackTintColor="#4a9eff"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#4a9eff"
                  />
                </View>
              </View>

              <View style={styles.compactRow}>
                {/* Look-ahead */}
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>{t('audio:modules.limiter.controls.lookAhead')}</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={0}
                    maximumValue={10}
                    value={lookAhead}
                    onValueChange={(value) => {
                      setLookAhead(value);
                      updateParameter('lookAhead', value);
                    }}
                    minimumTrackTintColor="#00ff88"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#00ff88"
                  />
                </View>

                {/* Output Gain */}
                <View style={styles.compactControl}>
                  <Text style={styles.compactLabel}>{t('audio:modules.limiter.controls.output')}</Text>
                  <Slider
                    style={styles.compactSlider}
                    minimumValue={-12}
                    maximumValue={12}
                    value={outputGain}
                    onValueChange={(value) => {
                      setOutputGain(value);
                      updateParameter('outputGain', value);
                    }}
                    minimumTrackTintColor="#ff9500"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#ff9500"
                  />
                </View>
              </View>
            </View>
          </View>
        ) : (
          // Mode Avancé
          <View style={styles.advancedLayout}>
            <Text style={styles.advancedTitle}>Contrôles principaux</Text>
            <View style={styles.advancedControls}>
              {/* Threshold */}
              <View style={styles.advancedControl}>
                <View style={styles.advancedControlHeader}>
                  <Text style={styles.advancedControlLabel}>Seuil</Text>
                  <Text style={styles.advancedControlValue}>{threshold.toFixed(1)} dB</Text>
                </View>
                <Slider
                  style={styles.advancedSlider}
                  minimumValue={-30}
                  maximumValue={0}
                  value={threshold}
                  onValueChange={(value) => {
                    setThreshold(value);
                    updateParameter('threshold', value);
                  }}
                  minimumTrackTintColor="#ff6b35"
                  maximumTrackTintColor="#333"
                  thumbTintColor="#ff6b35"
                />
                <Text style={styles.advancedControlDesc}>Niveau maximum autorisé</Text>
              </View>

              {/* Release */}
              <View style={styles.advancedControl}>
                <View style={styles.advancedControlHeader}>
                  <Text style={styles.advancedControlLabel}>Relâchement</Text>
                  <Text style={styles.advancedControlValue}>{release.toFixed(0)} ms</Text>
                </View>
                <Slider
                  style={styles.advancedSlider}
                  minimumValue={1}
                  maximumValue={1000}
                  value={release}
                  onValueChange={(value) => {
                    setRelease(value);
                    updateParameter('release', value);
                  }}
                  minimumTrackTintColor="#4a9eff"
                  maximumTrackTintColor="#333"
                  thumbTintColor="#4a9eff"
                />
                <Text style={styles.advancedControlDesc}>Temps de retour après limitation</Text>
              </View>

              {/* Look-ahead */}
              <View style={styles.advancedControl}>
                <View style={styles.advancedControlHeader}>
                  <Text style={styles.advancedControlLabel}>Anticipation</Text>
                  <Text style={styles.advancedControlValue}>{lookAhead.toFixed(1)} ms</Text>
                </View>
                <Slider
                  style={styles.advancedSlider}
                  minimumValue={0}
                  maximumValue={10}
                  value={lookAhead}
                  onValueChange={(value) => {
                    setLookAhead(value);
                    updateParameter('lookAhead', value);
                  }}
                  minimumTrackTintColor="#00ff88"
                  maximumTrackTintColor="#333"
                  thumbTintColor="#00ff88"
                />
                <Text style={styles.advancedControlDesc}>Délai de prédiction des pics</Text>
              </View>

              {/* Output Gain */}
              <View style={styles.advancedControl}>
                <View style={styles.advancedControlHeader}>
                  <Text style={styles.advancedControlLabel}>Gain de sortie</Text>
                  <Text style={styles.advancedControlValue}>
                    {outputGain > 0 ? '+' : ''}{outputGain.toFixed(1)} dB
                  </Text>
                </View>
                <Slider
                  style={styles.advancedSlider}
                  minimumValue={-12}
                  maximumValue={12}
                  value={outputGain}
                  onValueChange={(value) => {
                    setOutputGain(value);
                    updateParameter('outputGain', value);
                  }}
                  minimumTrackTintColor="#ff9500"
                  maximumTrackTintColor="#333"
                  thumbTintColor="#ff9500"
                />
                <Text style={styles.advancedControlDesc}>Compensation de niveau</Text>
              </View>
            </View>

            {/* Visualisation avancée */}
            <View style={styles.visualSection}>
              <Text style={styles.visualTitle}>📊 Réduction de gain</Text>
              <View style={styles.meterContainer}>
                <View style={styles.meter}>
                  <View style={styles.meterTrack}>
                    <View 
                      style={[
                        styles.meterFill,
                        { width: '0%' } // TODO: Connecter aux données réelles
                      ]} 
                    />
                  </View>
                  <Text style={styles.meterLabel}>0 dB</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Containers principaux
  container: {
    backgroundColor: '#141414',
    padding: 12,
    borderRadius: 12,
  },
  containerCompact: {
    padding: 8,
  },
  containerDefault: {
    padding: 10,
  },

  // Headers
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerCompact: {
    marginBottom: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerDefault: {
    marginBottom: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Mode buttons
  modeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  modeButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#ff6b35',
  },
  modeButtonText: {
    color: '#888',
    fontSize: 9,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },

  // Scroll containers
  scrollContainer: {
    flex: 1,
  },
  scrollContainerCompact: {
    flex: 1,
  },
  scrollContainerDefault: {
    flex: 1,
  },

  // Mode Compact
  compactLayout: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  compactTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  compactControls: {
    gap: 8,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  compactControl: {
    flex: 1,
    alignItems: 'center',
  },
  compactLabel: {
    fontSize: 10,
    color: '#aaa',
    marginBottom: 4,
    fontWeight: '500',
  },
  compactSlider: {
    width: '100%',
    height: 6,
    transform: [{ scaleY: 0.5 }],
  },

  // Mode Avancé
  advancedLayout: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  advancedTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  advancedControls: {
    gap: 6,
  },
  advancedControl: {
    marginBottom: 4,
  },
  advancedControlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  advancedControlLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  advancedControlValue: {
    fontSize: 10,
    fontWeight: '500',
    color: '#ccc',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    minWidth: 45,
    textAlign: 'center',
  },
  advancedControlDesc: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
    lineHeight: 10,
  },
  advancedSlider: {
    height: 16,
    marginVertical: 2,
  },

  // Visualisation
  visualSection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
  },
  visualTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  meterContainer: {
    backgroundColor: '#252525',
    borderRadius: 4,
    padding: 6,
  },
  meter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meterTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#ff6b35',
  },
  meterLabel: {
    fontSize: 9,
    color: '#ccc',
    fontWeight: '500',
    minWidth: 30,
    textAlign: 'right',
  },

  // Mode par défaut - écran de sélection
  defaultLayout: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  modeInstruction: {
    fontSize: 12,
    color: '#888',
    marginBottom: 16,
    textAlign: 'center',
  },
  modeSelection: {
    gap: 12,
    width: '100%',
  },
  modeSelectionButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modeSelectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  modeSelectionDesc: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },

  // Error
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 20,
  },
});