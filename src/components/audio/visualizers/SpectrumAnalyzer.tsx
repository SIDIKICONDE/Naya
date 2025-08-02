/**
 * Analyseur de spectre FFT professionnel
 * Visualisation en temps réel avec optimisations mobile
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { audioInterface } from '../../../audio/AudioInterface';
import { AudioMockData } from './AudioMockData'; // TODO: À supprimer
import { useAudioTheme, useVisualizerColors } from '../../../theme/hooks/useAudioTheme';

interface SpectrumAnalyzerProps {
  fftSize?: number;
  minFrequency?: number;
  maxFrequency?: number;
  minDecibels?: number;
  maxDecibels?: number;
  smoothingTimeConstant?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  colorScheme?: 'classic' | 'gradient' | 'heat';
}

export const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  fftSize = 2048,
  minFrequency = 20,
  maxFrequency = 20000,
  minDecibels = -90,
  maxDecibels = -10,
  smoothingTimeConstant = 0.8,
  showGrid = true,
  showLabels = true,
  colorScheme = 'gradient',
}) => {
  const audioTheme = useAudioTheme();
  const visualizerColors = useVisualizerColors();
  const [dimensions, setDimensions] = useState(() => {
    const { width } = Dimensions.get('window');
    return {
      width: width - 32,
      height: 100,
    };
  });

  const [spectrumData, setSpectrumData] = useState<Float32Array>(
    new Float32Array(fftSize / 2)
  );

  const animationFrame = useRef<number | undefined>(undefined);

  // Calcul des fréquences logarithmiques
  const frequencyBins = useMemo(() => {
    const bins = [];
    const logMin = Math.log10(minFrequency);
    const logMax = Math.log10(maxFrequency);
    const binCount = Math.floor(dimensions.width / 3); // 3px par barre

    for (let i = 0; i < binCount; i++) {
      const logFreq = logMin + (i / (binCount - 1)) * (logMax - logMin);
      bins.push(Math.pow(10, logFreq));
    }
    return bins;
  }, [dimensions.width, minFrequency, maxFrequency]);

  useEffect(() => {
    const updateSpectrum = () => {
      try {
        // TODO: Remplacer par audioInterface.getSpectrumData(fftSize) quand disponible
        const data = AudioMockData.getSpectrumData(fftSize);
        if (data && data.length > 0) {
          setSpectrumData(data);
        }
      } catch (error) {
        console.error('Erreur spectrum:', error);
      }

      animationFrame.current = requestAnimationFrame(updateSpectrum);
    };

    updateSpectrum();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [fftSize]);

  // Fonction pour obtenir la magnitude à une fréquence donnée
  const getMagnitudeAtFrequency = (frequency: number): number => {
    const nyquist = 24000; // Moitié de 48kHz
    const binIndex = Math.round((frequency / nyquist) * spectrumData.length);
    
    if (binIndex < 0 || binIndex >= spectrumData.length) return minDecibels;
    
    return spectrumData[binIndex];
  };

  // Création des barres de spectre
  const renderSpectrumBars = () => {
    const barWidth = Math.max(2, dimensions.width / frequencyBins.length);
    const barGap = Math.max(1, barWidth * 0.1);
    
    return frequencyBins.map((freq, i) => {
      const magnitude = getMagnitudeAtFrequency(freq);
      const normalizedMag = Math.max(0, (magnitude - minDecibels) / (maxDecibels - minDecibels));
      const height = normalizedMag * dimensions.height;
      
      const x = i * (barWidth + barGap);
      
      // Couleur basée sur l'intensité
      let backgroundColor = visualizerColors.spectrumNormal;
      if (colorScheme === 'gradient') {
        backgroundColor = normalizedMag > 0.8 ? visualizerColors.spectrumAlert :
                         normalizedMag > 0.6 ? visualizerColors.spectrumCaution :
                         normalizedMag > 0.4 ? visualizerColors.spectrumWarning :
                         visualizerColors.spectrumNormal;
      } else if (colorScheme === 'heat') {
        backgroundColor = normalizedMag > 0.8 ? visualizerColors.spectrumAlert :
                         normalizedMag > 0.6 ? visualizerColors.spectrumCaution :
                         normalizedMag > 0.4 ? visualizerColors.spectrumWarning :
                         visualizerColors.spectrumNormal;
      }
      
      return (
        <View
          key={`bar-${i}`}
          style={{
            position: 'absolute',
            left: x,
            bottom: 0,
            width: barWidth,
            height: Math.max(1, height),
            backgroundColor,
            opacity: 0.8 + normalizedMag * 0.2,
          }}
        />
      );
    });
  };

  // Génération des couleurs selon le schéma
  const getColor = () => {
    switch (colorScheme) {
      case 'classic':
        return visualizerColors.spectrumNormal;
      case 'gradient':
        return {
          colors: [
            visualizerColors.spectrumNormal,
            visualizerColors.spectrumWarning,
            visualizerColors.spectrumCaution,
            visualizerColors.spectrumAlert
          ],
          positions: [0, 0.3, 0.7, 1],
        };
      case 'heat':
        return {
          colors: [
            visualizerColors.spectrumBackground,
            visualizerColors.spectrumNormal,
            visualizerColors.spectrumWarning,
            visualizerColors.spectrumCaution,
            visualizerColors.spectrumAlert
          ],
          positions: [0, 0.25, 0.5, 0.75, 1],
        };
      default:
        return visualizerColors.spectrumNormal;
    }
  };

  const styles = createStyles(audioTheme, visualizerColors);

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.header}>
          <Text style={styles.title}>Analyseur de Spectre</Text>
          <Text style={styles.subtitle}>{fftSize} points FFT</Text>
        </View>
      )}

      <View 
        style={[styles.canvasContainer, { height: dimensions.height }]}
        onLayout={(e) => {
          const { width } = e.nativeEvent.layout;
          setDimensions(prev => ({ ...prev, width }));
        }}
      >
        <View style={StyleSheet.absoluteFillObject}>
          {/* Grille de fond */}
          {showGrid && (
            <>
              {/* Lignes horizontales (dB) */}
              {[-80, -60, -40, -20, 0].map((db) => {
                const y = ((db - minDecibels) / (maxDecibels - minDecibels)) * dimensions.height;
                return (
                  <View
                    key={`db-${db}`}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: y,
                      height: 1,
                      backgroundColor: visualizerColors.gridLine,
                    }}
                  />
                );
              })}
              
              {/* Lignes verticales (fréquences) */}
              {[100, 1000, 10000].map((freq) => {
                const x = frequencyBins.findIndex(f => f >= freq) * (dimensions.width / frequencyBins.length);
                return (
                  <View
                    key={`freq-${freq}`}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      backgroundColor: visualizerColors.gridLine,
                    }}
                  />
                );
              })}
            </>
          )}

          {/* Barres du spectre */}
          {renderSpectrumBars()}
        </View>

        {/* Labels */}
        {showLabels && (
          <>
            {/* Labels dB */}
            <View style={styles.dbLabels}>
              {[-80, -60, -40, -20].map((db) => {
                const y = ((db - minDecibels) / (maxDecibels - minDecibels)) * dimensions.height;
                return (
                  <Text
                    key={`label-${db}`}
                    style={[
                      styles.dbLabel,
                      { bottom: y - 6 }
                    ]}
                  >
                    {db}
                  </Text>
                );
              })}
            </View>

            {/* Labels fréquences */}
            <View style={styles.freqLabels}>
              {[100, 1000, 10000].map((freq) => {
                const x = frequencyBins.findIndex(f => f >= freq) * (dimensions.width / frequencyBins.length);
                return (
                  <Text
                    key={`freq-label-${freq}`}
                    style={[
                      styles.freqLabel,
                      { left: x - 20 }
                    ]}
                  >
                    {freq >= 1000 ? `${freq/1000}k` : freq}
                  </Text>
                );
              })}
            </View>
          </>
        )}
      </View>

      {/* Barre de statut */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {minFrequency}Hz - {maxFrequency/1000}kHz
        </Text>
        <Text style={styles.statusText}>
          Peak: -12.3 dB
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
    marginBottom: audioTheme.spacing.sm,
  },
  title: {
    ...audioTheme.typography.h3,
    color: audioTheme.colors.text,
  },
  subtitle: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    marginTop: audioTheme.spacing.xxs,
  },
  canvasContainer: {
    position: 'relative',
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.sm,
    overflow: 'hidden',
  },
  dbLabels: {
    position: 'absolute',
    left: audioTheme.spacing.xxs,
    top: 0,
    bottom: 0,
  },
  dbLabel: {
    position: 'absolute',
    color: audioTheme.colors.buttonInactive,
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  freqLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: audioTheme.spacing.xxs,
  },
  freqLabel: {
    position: 'absolute',
    color: audioTheme.colors.buttonInactive,
    fontSize: 9,
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