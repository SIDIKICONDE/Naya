/**
 * Interface visuelle du gate/noise gate
 * Suppression automatique du bruit de fond
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

interface GateViewProps {
  moduleId: string;
}

export const GateView: React.FC<GateViewProps> = ({ moduleId }) => {
  const [threshold, setThreshold] = useState(-40);
  const [ratio, setRatio] = useState(10);
  const [attack, setAttack] = useState(1);
  const [hold, setHold] = useState(10);
  const [release, setRelease] = useState(100);
  const [lookAhead, setLookAhead] = useState(0);
  const [mode, setMode] = useState<'gate' | 'expander'>('gate');

  const module = audioInterface.getModule(moduleId);
  const { t } = useTranslation();

  useEffect(() => {
    if (!module) return;

    // Charger les valeurs initiales
    setThreshold(module.getParameter('threshold') || -40);
    setRatio(module.getParameter('ratio') || 10);
    setAttack(module.getParameter('attack') || 1);
    setHold(module.getParameter('hold') || 10);
    setRelease(module.getParameter('release') || 100);
    setLookAhead(module.getParameter('lookAhead') || 0);
    setMode(module.getParameter('mode') === 1 ? 'expander' : 'gate');
  }, [moduleId]);

  const updateParameter = (parameter: string, value: number) => {
    if (!module) return;
    module.setParameter(parameter, value);
  };

  const handleModeChange = (newMode: 'gate' | 'expander') => {
    setMode(newMode);
    updateParameter('mode', newMode === 'expander' ? 1 : 0);
  };

  if (!module) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Module non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('audio:modules.gate.title')}</Text>
        <Text style={styles.subtitle}>{t('audio:modules.gate.subtitle')}</Text>
      </View>

      {/* Sélecteur de mode */}
      <View style={styles.modeSection}>
        <Text style={styles.sectionTitle}>{t('audio:modules.gate.modes.title')}</Text>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'gate' && styles.modeButtonActive]}
            onPress={() => handleModeChange('gate')}
          >
            <Text style={[styles.modeButtonText, mode === 'gate' && styles.modeButtonTextActive]}>
              {t('audio:modules.gate.modes.gate')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'expander' && styles.modeButtonActive]}
            onPress={() => handleModeChange('expander')}
          >
            <Text style={[styles.modeButtonText, mode === 'expander' && styles.modeButtonTextActive]}>
              {t('audio:modules.gate.modes.expander')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contrôles principaux */}
      <View style={styles.controlsSection}>
        {/* Threshold */}
        <View style={styles.controlGroup}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>{t('audio:modules.gate.controls.threshold.label')}</Text>
            <Text style={styles.controlValue}>{threshold.toFixed(1)} dB</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={-80}
            maximumValue={-10}
            value={threshold}
            onValueChange={(value) => {
              setThreshold(value);
              updateParameter('threshold', value);
            }}
            minimumTrackTintColor="#ff6b35"
            maximumTrackTintColor="#333"
            thumbTintColor="#ff6b35"
          />
          <Text style={styles.controlDescription}>
            {t('audio:modules.gate.controls.threshold.description')}
          </Text>
        </View>

        {/* Ratio */}
        <View style={styles.controlGroup}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>{t('audio:modules.gate.controls.ratio.label')}</Text>
            <Text style={styles.controlValue}>
              {ratio >= 20 ? '∞:1' : `${ratio.toFixed(1)}:1`}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={20}
            value={ratio}
            onValueChange={(value) => {
              setRatio(value);
              updateParameter('ratio', value);
            }}
            minimumTrackTintColor="#4a9eff"
            maximumTrackTintColor="#333"
            thumbTintColor="#4a9eff"
          />
          <Text style={styles.controlDescription}>
            {t('audio:modules.gate.controls.ratio.description')}
          </Text>
        </View>

        {/* Attack */}
        <View style={styles.controlGroup}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>{t('audio:modules.gate.controls.attack.label')}</Text>
            <Text style={styles.controlValue}>{attack.toFixed(1)} ms</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={50}
            value={attack}
            onValueChange={(value) => {
              setAttack(value);
              updateParameter('attack', value);
            }}
            minimumTrackTintColor="#00ff88"
            maximumTrackTintColor="#333"
            thumbTintColor="#00ff88"
          />
          <Text style={styles.controlDescription}>
            {t('audio:modules.gate.controls.attack.description')}
          </Text>
        </View>

        {/* Hold */}
        <View style={styles.controlGroup}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>{t('audio:modules.gate.controls.hold.label')}</Text>
            <Text style={styles.controlValue}>{hold.toFixed(0)} ms</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={2000}
            value={hold}
            onValueChange={(value) => {
              setHold(value);
              updateParameter('hold', value);
            }}
            minimumTrackTintColor="#ff9500"
            maximumTrackTintColor="#333"
            thumbTintColor="#ff9500"
          />
          <Text style={styles.controlDescription}>
            {t('audio:modules.gate.controls.hold.description')}
          </Text>
        </View>

        {/* Release */}
        <View style={styles.controlGroup}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>{t('audio:modules.gate.controls.release.label')}</Text>
            <Text style={styles.controlValue}>{release.toFixed(0)} ms</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={5000}
            value={release}
            onValueChange={(value) => {
              setRelease(value);
              updateParameter('release', value);
            }}
            minimumTrackTintColor="#e91e63"
            maximumTrackTintColor="#333"
            thumbTintColor="#e91e63"
          />
          <Text style={styles.controlDescription}>
            {t('audio:modules.gate.controls.release.description')}
          </Text>
        </View>

        {/* Look-ahead */}
        <View style={styles.controlGroup}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>{t('audio:modules.gate.controls.lookAhead.label')}</Text>
            <Text style={styles.controlValue}>{lookAhead.toFixed(1)} ms</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            value={lookAhead}
            onValueChange={(value) => {
              setLookAhead(value);
              updateParameter('lookAhead', value);
            }}
            minimumTrackTintColor="#9c27b0"
            maximumTrackTintColor="#333"
            thumbTintColor="#9c27b0"
          />
          <Text style={styles.controlDescription}>
            {t('audio:modules.gate.controls.lookAhead.description')}
          </Text>
        </View>
      </View>

      {/* Visualisation */}
      <View style={styles.visualSection}>
        <Text style={styles.sectionTitle}>{t('audio:modules.gate.status.title')}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusLight, { backgroundColor: '#00ff88' }]} />
          <Text style={styles.statusText}>{t('audio:modules.gate.status.open')}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 20,
  },
  modeSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#2196F3',
  },
  modeButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  controlsSection: {
    padding: 20,
  },
  controlGroup: {
    marginBottom: 24,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  controlValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ccc',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  controlDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  slider: {
    height: 40,
    marginVertical: 8,
  },
  visualSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  statusLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});