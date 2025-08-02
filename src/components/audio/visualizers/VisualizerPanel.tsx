/**
 * Panneau principal des visualiseurs
 * Interface unifiée pour tous les modes de visualisation
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LevelMeter } from './LevelMeter';
import { SpectrumAnalyzer } from './SpectrumAnalyzer';
import { Oscilloscope } from './Oscilloscope';
import { Visualizer3D } from './Visualizer3D';
import { useAudioTheme, useVisualizerColors } from '../../../theme/hooks/useAudioTheme';
import { useTranslation } from '../../../i18n';

type VisualizerMode = 'levels' | 'spectrum' | 'oscilloscope' | '3d';

interface VisualizerPanelProps {
  compact?: boolean;
  defaultMode?: VisualizerMode;
}

export const VisualizerPanel: React.FC<VisualizerPanelProps> = ({
  compact = false,
  defaultMode = 'spectrum',
}) => {
  const audioTheme = useAudioTheme();
  const visualizerColors = useVisualizerColors();
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState<VisualizerMode>(defaultMode);
  type ColorScheme = 'classic' | 'gradient' | 'heat';
  const [settings, setSettings] = useState<{
    fftSize: number;
    showGrid: boolean;
    showLabels: boolean;
    colorScheme: ColorScheme;
  }>({
    fftSize: 2048,
    showGrid: true,
    showLabels: !compact,
    colorScheme: 'gradient',
  });

  const modes: Array<{
    id: VisualizerMode;
    label: string;
    icon: string;
  }> = [
    { id: 'levels', label: t('audio:visualizers.modes.levels'), icon: '│' },
    { id: 'spectrum', label: t('audio:visualizers.modes.spectrum'), icon: '▁▃▅▇' },
    { id: 'oscilloscope', label: t('audio:visualizers.modes.oscilloscope'), icon: '∿' },
    { id: '3d', label: t('audio:visualizers.modes.3d'), icon: '◈' },
  ];

  const renderVisualizer = () => {
    switch (activeMode) {
      case 'levels':
        return <LevelMeter showLabels={settings.showLabels} />;
      
      case 'spectrum':
        return (
          <SpectrumAnalyzer
            fftSize={settings.fftSize}
            showGrid={settings.showGrid}
            showLabels={settings.showLabels}
            colorScheme={settings.colorScheme}
          />
        );
      
      case 'oscilloscope':
        return (
          <Oscilloscope
            bufferSize={settings.fftSize}
            showGrid={settings.showGrid}
          />
        );
      
      case '3d':
        return (
          <Visualizer3D
            fftSize={settings.fftSize}
            colorMode="spectrum"
          />
        );
      
      default:
        return null;
    }
  };

  const styles = createStyles(audioTheme, visualizerColors);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Sélecteur de mode */}
      <View style={styles.modeSelector}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeButton,
              activeMode === mode.id && styles.activeModeButton,
            ]}
            onPress={() => setActiveMode(mode.id)}
          >
            <Text style={styles.modeIcon}>{mode.icon}</Text>
            {!compact && (
              <Text style={[
                styles.modeLabel,
                activeMode === mode.id && styles.activeModeLabel,
              ]}>
                {mode.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Zone de visualisation */}
      <View style={styles.visualizerContainer}>
        {renderVisualizer()}
      </View>

      {/* Contrôles rapides */}
      {!compact && (
        <View style={styles.quickControls}>
          <TouchableOpacity
            style={[
              styles.quickControl,
              settings.showGrid && styles.activeControl,
            ]}
            onPress={() => setSettings(prev => ({ ...prev, showGrid: !prev.showGrid }))}
          >
            <Text style={styles.controlIcon}>⊞</Text>
            <Text style={styles.controlLabel}>{t('audio:visualizers.controls.grid')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickControl,
              settings.showLabels && styles.activeControl,
            ]}
            onPress={() => setSettings(prev => ({ ...prev, showLabels: !prev.showLabels }))}
          >
            <Text style={styles.controlIcon}>Aa</Text>
            <Text style={styles.controlLabel}>{t('audio:visualizers.controls.labels')}</Text>
          </TouchableOpacity>

          {activeMode === 'spectrum' && (
            <TouchableOpacity
              style={styles.quickControl}
              onPress={() => {
                const schemes = ['classic', 'gradient', 'heat'] as const;
                const currentIndex = schemes.indexOf(settings.colorScheme);
                const nextIndex = (currentIndex + 1) % schemes.length;
                setSettings(prev => ({ ...prev, colorScheme: schemes[nextIndex] }));
              }}
            >
              <Text style={styles.controlIcon}>🎨</Text>
              <Text style={styles.controlLabel}>{t('audio:visualizers.controls.color')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.quickControl}
            onPress={() => {
              const sizes = [512, 1024, 2048, 4096];
              const currentIndex = sizes.indexOf(settings.fftSize);
              const nextIndex = (currentIndex + 1) % sizes.length;
              setSettings(prev => ({ ...prev, fftSize: sizes[nextIndex] }));
            }}
          >
            <Text style={styles.controlIcon}>⚡</Text>
            <Text style={styles.controlLabel}>{settings.fftSize}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const createStyles = (audioTheme: any, visualizerColors: any) => StyleSheet.create({
  container: {
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.sm,
    padding: audioTheme.spacing.sm,
    gap: audioTheme.spacing.xs,
  },
  containerCompact: {
    padding: audioTheme.spacing.xxs,
    gap: audioTheme.spacing.xxs,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.xs,
    padding: audioTheme.spacing.xxs,
    gap: 1,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: audioTheme.spacing.xxs,
    paddingHorizontal: audioTheme.spacing.xs,
    borderRadius: audioTheme.spacing.xxs,
    gap: audioTheme.spacing.xxs,
  },
  activeModeButton: {
    backgroundColor: audioTheme.colors.knobBackground,
    borderWidth: 0.5,
    borderColor: visualizerColors.panelActive,
  },
  modeIcon: {
    color: audioTheme.colors.buttonInactive,
    fontSize: 12,
  },
  modeLabel: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
  },
  activeModeLabel: {
    color: visualizerColors.panelActive,
  },
  visualizerContainer: {
    minHeight: 120,
  },
  quickControls: {
    flexDirection: 'row',
    gap: audioTheme.spacing.xxs,
    justifyContent: 'center',
  },
  quickControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: audioTheme.spacing.xxs,
    paddingHorizontal: audioTheme.spacing.xs,
    paddingVertical: audioTheme.spacing.xxs,
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.sm,
    borderWidth: 0.5,
    borderColor: audioTheme.colors.knobBackground,
  },
  activeControl: {
    backgroundColor: audioTheme.colors.knobBackground,
    borderColor: visualizerColors.panelActive,
  },
  controlIcon: {
    color: audioTheme.colors.text,
    fontSize: 10,
  },
  controlLabel: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
  },
});