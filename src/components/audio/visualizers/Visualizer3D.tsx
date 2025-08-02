/**
 * Visualiseur 3D interactif
 * Représentation spatiale du spectre audio
 */

import React, { useEffect, useRef, useState, ReactElement } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { audioInterface } from '../../../audio/AudioInterface';
import { AudioMockData } from './AudioMockData'; // TODO: À supprimer
import { useAudioTheme, useVisualizerColors } from '../../../theme/hooks/useAudioTheme';
import { useTranslation } from '../../../i18n';

interface Visualizer3DProps {
  fftSize?: number;
  barCount?: number;
  colorMode?: 'spectrum' | 'intensity' | 'phase';
  rotationSpeed?: number;
  sensitivity?: number;
}

export const Visualizer3D: React.FC<Visualizer3DProps> = ({
  fftSize = 1024,
  barCount = 32,
  colorMode: initialColorMode = 'spectrum',
  rotationSpeed = 0.5,
  sensitivity = 1.0,
}) => {
  const audioTheme = useAudioTheme();
  const visualizerColors = useVisualizerColors();
  const { t } = useTranslation();
  const [dimensions, setDimensions] = useState(() => {
    const { width } = Dimensions.get('window');
    return {
      width: width - 32,
      height: 120,
    };
  });

  const [spectrumData, setSpectrumData] = useState<Float32Array[]>([]);
  const [rotation, setRotation] = useState({ x: 30, y: 45 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [colorMode, setColorMode] = useState(initialColorMode);
  
  const animationFrame = useRef<number | undefined>(undefined);
  const rotationAnim = useRef(new Animated.ValueXY({ x: 30, y: 45 })).current;

  // Configuration du geste de rotation
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        setAutoRotate(false);
        const newRotation = {
          x: rotation.x + gestureState.dy * 0.5,
          y: rotation.y + gestureState.dx * 0.5,
        };
        setRotation(newRotation);
        rotationAnim.setValue(newRotation);
      },
      onPanResponderRelease: () => {
        // Réactiver la rotation auto après 3 secondes
        setTimeout(() => setAutoRotate(true), 3000);
      },
    })
  ).current;

  useEffect(() => {
    const historyLength = 32; // Nombre d'échantillons historiques
    const history: Float32Array[] = [];

    const updateSpectrum = () => {
      try {
        // TODO: Remplacer par audioInterface.getSpectrumData(fftSize) quand disponible
        const data = AudioMockData.getSpectrumData(fftSize);
        if (data && data.length > 0) {
          // Ajouter à l'historique
          history.push(new Float32Array(data));
          if (history.length > historyLength) {
            history.shift();
          }
          setSpectrumData([...history]);
        }
      } catch (error) {
        console.error('Erreur spectrum 3D:', error);
      }

      // Rotation automatique
      if (autoRotate) {
        setRotation(prev => ({
          x: prev.x,
          y: prev.y + rotationSpeed,
        }));
      }

      animationFrame.current = requestAnimationFrame(updateSpectrum);
    };

    updateSpectrum();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [fftSize, autoRotate, rotationSpeed]);

  // Projection 3D vers 2D
  const project3D = (x: number, y: number, z: number) => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const distance = 300;

    // Rotation autour de Y
    const rotY = (rotation.y * Math.PI) / 180;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    let newX = x * cosY - z * sinY;
    let newZ = x * sinY + z * cosY;

    // Rotation autour de X
    const rotX = (rotation.x * Math.PI) / 180;
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const newY = y * cosX - newZ * sinX;
    newZ = y * sinX + newZ * cosX;

    // Projection perspective
    const factor = distance / (distance + newZ);
    const projX = centerX + newX * factor;
    const projY = centerY - newY * factor;

    return { x: projX, y: projY, z: newZ, factor };
  };

  // Obtenir la couleur selon le mode
  const getBarColor = (frequency: number, magnitude: number, index: number) => {
    const normalizedMag = Math.min(1, Math.max(0, (magnitude + 90) / 90));
    
    switch (colorMode) {
      case 'spectrum':
        // Couleur basée sur la fréquence
        return normalizedMag > 0.8 ? visualizerColors.visualizer3DAlert :
               normalizedMag > 0.6 ? visualizerColors.visualizer3DCaution :
               normalizedMag > 0.4 ? visualizerColors.visualizer3DWarning :
               visualizerColors.visualizer3DNormal;
        
      case 'intensity':
        // Gradient basé sur l'intensité
        return normalizedMag > 0.8 ? visualizerColors.visualizer3DAlert :
               normalizedMag > 0.5 ? visualizerColors.visualizer3DWarning :
               visualizerColors.visualizer3DNormal;
        
      case 'phase':
        // Couleur basée sur la phase
        const phase = Math.sin(Date.now() * 0.001 + index * 0.5) * 0.5 + 0.5;
        return phase > 0.8 ? visualizerColors.visualizer3DAlert :
               phase > 0.5 ? visualizerColors.visualizer3DWarning :
               visualizerColors.visualizer3DNormal;
        
      default:
        return visualizerColors.visualizer3DNormal;
    }
  };

  // Rendu simplifié des barres en pseudo-3D
  const renderBars = () => {
    if (spectrumData.length === 0) return null;
    
    const bars: ReactElement[] = [];
    const barWidth = dimensions.width / barCount;
    const maxHeight = dimensions.height * 0.8;
    
    // Utiliser seulement les données les plus récentes
    const currentSpectrum = spectrumData[spectrumData.length - 1] || new Float32Array(barCount);
    
    for (let i = 0; i < barCount; i++) {
      const binIndex = Math.floor((i / barCount) * currentSpectrum.length);
      const magnitude = currentSpectrum[binIndex] || -90;
      const normalizedMag = Math.max(0, (magnitude + 90) / 90) * sensitivity;
      const height = normalizedMag * maxHeight;
      
      const x = i * barWidth;
      const y = dimensions.height - height;
      
      // Effet 3D simple avec perspective
      const perspective = 1 - (i / barCount) * 0.3; // Rétrécissement en profondeur
      const offsetY = (i / barCount) * 20; // Décalage vertical pour l'effet de profondeur
      
      bars.push(
        <View
          key={`bar-${i}`}
          style={[
            styles.bar3D,
            {
              position: 'absolute',
              left: x + (i * 2), // Décalage horizontal pour effet 3D
              top: y - offsetY,
              width: barWidth * 0.8 * perspective,
              height: height * perspective,
              backgroundColor: getBarColor(i, magnitude, i),
              opacity: 0.8 + normalizedMag * 0.2,
              transform: [
                { scaleX: perspective },
              ],
            },
          ]}
        />
      );
    }

    return bars;
  };

  const styles = createStyles(audioTheme, visualizerColors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('audio:visualizers.visualizer3d.title')}</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, autoRotate && styles.activeButton]}
            onPress={() => setAutoRotate(!autoRotate)}
          >
            <Text style={styles.controlText}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View 
        style={[styles.viewport, { height: dimensions.height }]}
        {...panResponder.panHandlers}
        onLayout={(e) => {
          const { width } = e.nativeEvent.layout;
          setDimensions(prev => ({ ...prev, width }));
        }}
      >
        {/* Grille de perspective simplifiée */}
        <View style={styles.perspectiveGrid}>
          {[...Array(3)].map((_, i) => (
            <View
              key={`grid-${i}`}
              style={[
                styles.gridLine,
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: (i + 1) * (dimensions.height / 4),
                  height: 1,
                  opacity: 0.2 - i * 0.05,
                },
              ]}
            />
          ))}
        </View>

        {/* Barres 3D */}
        {renderBars()}

        {/* Indicateur simple */}
        <View style={styles.rotationIndicator}>
          <Text style={styles.rotationText}>
            3D {autoRotate ? '↻' : '⏸'}
          </Text>
        </View>
      </View>

      {/* Options de visualisation */}
      <View style={styles.options}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            colorMode === 'spectrum' && styles.selectedOption,
          ]}
          onPress={() => setColorMode('spectrum')}
        >
          <Text style={styles.optionText}>{t('audio:visualizers.visualizer3d.modes.spectrum')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            colorMode === 'intensity' && styles.selectedOption,
          ]}
          onPress={() => setColorMode('intensity')}
        >
          <Text style={styles.optionText}>{t('audio:visualizers.visualizer3d.modes.intensity')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            colorMode === 'phase' && styles.selectedOption,
          ]}
          onPress={() => setColorMode('phase')}
        >
          <Text style={styles.optionText}>{t('audio:visualizers.visualizer3d.modes.phase')}</Text>
        </TouchableOpacity>
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
    backgroundColor: visualizerColors.visualizer3DActive,
    borderColor: visualizerColors.visualizer3DActive,
  },
  controlText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
    fontSize: 16,
  },
  viewport: {
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  perspectiveGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    backgroundColor: visualizerColors.gridLine,
  },
  bar3D: {
    borderRadius: audioTheme.spacing.xxs,
    shadowColor: audioTheme.colors.knobBackground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  rotationIndicator: {
    position: 'absolute',
    bottom: audioTheme.spacing.sm,
    right: audioTheme.spacing.sm,
    backgroundColor: audioTheme.colors.knobBackground,
    paddingHorizontal: audioTheme.spacing.sm,
    paddingVertical: audioTheme.spacing.xxs,
    borderRadius: audioTheme.spacing.xxs,
  },
  rotationText: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    fontFamily: 'monospace',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: audioTheme.spacing.sm,
    marginTop: audioTheme.spacing.md,
  },
  optionButton: {
    paddingHorizontal: audioTheme.spacing.lg,
    paddingVertical: audioTheme.spacing.sm,
    borderRadius: audioTheme.spacing.lg,
    backgroundColor: audioTheme.colors.knobBackground,
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
  },
  selectedOption: {
    backgroundColor: visualizerColors.visualizer3DActive,
    borderColor: visualizerColors.visualizer3DActive,
  },
  optionText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
  },
});