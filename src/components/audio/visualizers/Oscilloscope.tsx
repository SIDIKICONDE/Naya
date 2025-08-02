/**
 * Oscilloscope temps réel haute performance
 * Visualisation de forme d'onde avec déclenchement
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Line, G } from 'react-native-svg';
import { audioInterface } from '../../../audio/AudioInterface';
import { AudioMockData } from './AudioMockData'; // TODO: À supprimer
import { useAudioTheme, useVisualizerColors } from '../../../theme/hooks/useAudioTheme';

interface OscilloscopeProps {
  bufferSize?: number;
  timeScale?: number; // ms/div
  voltageScale?: number; // V/div
  triggerLevel?: number;
  triggerMode?: 'auto' | 'normal' | 'single';
  channel?: 'left' | 'right' | 'both';
  displayMode?: 'line' | 'dots' | 'filled';
  showGrid?: boolean;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({
  bufferSize = 2048,
  timeScale = 5,
  voltageScale = 0.5,
  triggerLevel = 0,
  triggerMode = 'auto',
  channel = 'both',
  displayMode = 'line',
  showGrid = true,
}) => {
  const audioTheme = useAudioTheme();
  const visualizerColors = useVisualizerColors();
  const [dimensions, setDimensions] = useState(() => {
    const { width } = Dimensions.get('window');
    return {
      width: width - 32,
      height: 120,
    };
  });

  const [waveformData, setWaveformData] = useState<{
    left: Float32Array;
    right: Float32Array;
  }>({
    left: new Float32Array(bufferSize),
    right: new Float32Array(bufferSize),
  });

  const [isPaused, setIsPaused] = useState(false);
  const animationFrame = useRef<number | undefined>(undefined);
  const lastTriggerTime = useRef<number>(0);

  // Recherche du point de déclenchement
  const findTriggerPoint = (data: Float32Array): number => {
    if (triggerMode === 'auto') {
      return 0; // Déclenchement immédiat
    }

    // Recherche d'un front montant au niveau de déclenchement
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i - 1] <= triggerLevel && data[i] > triggerLevel) {
        return i;
      }
    }

    // Si aucun déclenchement trouvé
    if (triggerMode === 'normal' && Date.now() - lastTriggerTime.current > 100) {
      return 0; // Afficher quand même après timeout
    }

    return -1; // Pas de déclenchement
  };

  useEffect(() => {
    if (isPaused) return;

    const updateWaveform = () => {
      try {
        // TODO: Remplacer par audioInterface.getWaveformData(bufferSize) quand disponible
        const data = AudioMockData.getWaveformData(bufferSize);
        if (data) {
          const triggerPoint = findTriggerPoint(data.left);
          
          if (triggerPoint >= 0) {
            lastTriggerTime.current = Date.now();
            
            // Décaler les données selon le point de déclenchement
            const leftTriggered = new Float32Array(bufferSize);
            const rightTriggered = new Float32Array(bufferSize);
            
            for (let i = 0; i < bufferSize; i++) {
              const sourceIndex = (triggerPoint + i) % bufferSize;
              leftTriggered[i] = data.left[sourceIndex];
              rightTriggered[i] = data.right[sourceIndex];
            }
            
            setWaveformData({
              left: leftTriggered,
              right: rightTriggered,
            });
          }
        }
      } catch (error) {
        console.error('Erreur waveform:', error);
      }

      animationFrame.current = requestAnimationFrame(updateWaveform);
    };

    updateWaveform();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [bufferSize, triggerLevel, triggerMode, isPaused]);

  // Création du path SVG pour la forme d'onde
  const createWaveformPath = (data: Float32Array) => {
    const samplesPerPixel = data.length / dimensions.width;
    let pathData = '';
    
    for (let x = 0; x < dimensions.width; x++) {
      const sampleIndex = Math.floor(x * samplesPerPixel);
      const value = data[sampleIndex] || 0;
      const y = (dimensions.height / 2) - (value * dimensions.height / (2 * voltageScale));
      
      if (x === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
    }
    
    return pathData;
  };

  // Création de la grille
  const createGrid = () => {
    const lines = [];
    const divisions = 10;
    
    // Lignes verticales (temps)
    for (let i = 0; i <= divisions; i++) {
      const x = (i / divisions) * dimensions.width;
      lines.push(
        <Line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={dimensions.height}
          stroke={i === divisions / 2 ? visualizerColors.gridLineMajor : visualizerColors.gridLine}
          strokeWidth={1}
        />
      );
    }
    
    // Lignes horizontales (voltage)
    for (let i = 0; i <= divisions; i++) {
      const y = (i / divisions) * dimensions.height;
      lines.push(
        <Line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={dimensions.width}
          y2={y}
          stroke={i === divisions / 2 ? visualizerColors.gridLineMajor : visualizerColors.gridLine}
          strokeWidth={1}
        />
      );
    }
    
    return lines;
  };

  const styles = createStyles(audioTheme, visualizerColors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Oscilloscope</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isPaused && styles.activeButton]}
            onPress={() => setIsPaused(!isPaused)}
          >
            <Text style={styles.controlText}>{isPaused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View 
        style={[styles.canvasContainer, { height: dimensions.height }]}
        onLayout={(e) => {
          const { width } = e.nativeEvent.layout;
          setDimensions(prev => ({ ...prev, width }));
        }}
      >
        <Svg style={StyleSheet.absoluteFillObject} width={dimensions.width} height={dimensions.height}>
          {/* Grille */}
          {showGrid && (
            <G>
              {createGrid()}
            </G>
          )}

          {/* Ligne de déclenchement */}
          <Line
            x1={0}
            y1={dimensions.height / 2 - (triggerLevel * dimensions.height / (2 * voltageScale))}
            x2={dimensions.width}
            y2={dimensions.height / 2 - (triggerLevel * dimensions.height / (2 * voltageScale))}
            stroke={visualizerColors.triggerLine}
            strokeWidth={1}
            strokeDasharray="5,5"
          />

          {/* Formes d'onde */}
          {(channel === 'left' || channel === 'both') && (
            <Path
              d={createWaveformPath(waveformData.left)}
              stroke={visualizerColors.waveformLeft}
              strokeWidth={2}
              fill="none"
            />
          )}

          {(channel === 'right' || channel === 'both') && (
            <Path
              d={createWaveformPath(waveformData.right)}
              stroke={visualizerColors.waveformRight}
              strokeWidth={2}
              fill="none"
              opacity={channel === 'both' ? 0.7 : 1}
            />
          )}
        </Svg>

        {/* Échelles */}
        <View style={styles.scales}>
          <Text style={styles.scaleText}>{timeScale} ms/div</Text>
          <Text style={styles.scaleText}>{voltageScale} V/div</Text>
        </View>

        {/* Indicateurs de canal */}
        {channel === 'both' && (
          <View style={styles.channelIndicators}>
            <View style={[styles.channelDot, { backgroundColor: visualizerColors.waveformLeft }]} />
            <Text style={styles.channelText}>L</Text>
            <View style={[styles.channelDot, { backgroundColor: visualizerColors.waveformRight, marginLeft: audioTheme.spacing.md }]} />
            <Text style={styles.channelText}>R</Text>
          </View>
        )}
      </View>

      {/* Barre de statut */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          Trig: {triggerMode} @ {triggerLevel.toFixed(2)}V
        </Text>
        <Text style={styles.statusText}>
          {bufferSize} samples @ 48kHz
        </Text>
      </View>
    </View>
  );
};

const createStyles = (audioTheme: any, visualizerColors: any) => StyleSheet.create({
  container: {
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.md,
    padding: audioTheme.spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: audioTheme.spacing.sm,
  },
  title: {
    ...audioTheme.typography.h3,
    color: audioTheme.colors.text,
  },
  controls: {
    flexDirection: 'row',
    gap: audioTheme.spacing.sm,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: audioTheme.colors.knobBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
  },
  activeButton: {
    backgroundColor: visualizerColors.oscilloscopeActive,
    borderColor: visualizerColors.oscilloscopeActive,
  },
  controlText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
  },
  canvasContainer: {
    position: 'relative',
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.sm,
    overflow: 'hidden',
  },
  scales: {
    position: 'absolute',
    top: audioTheme.spacing.sm,
    right: audioTheme.spacing.sm,
    alignItems: 'flex-end',
  },
  scaleText: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: audioTheme.spacing.xxs,
  },
  channelIndicators: {
    position: 'absolute',
    top: audioTheme.spacing.sm,
    left: audioTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: audioTheme.spacing.xxs,
  },
  channelText: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: audioTheme.spacing.sm,
    paddingHorizontal: audioTheme.spacing.xxs,
  },
  statusText: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});