/**
 * Composant de visualisation spatiale de la réverbération
 */

import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { SpatialVisualizationProps } from '../types';
import { useAudioTheme, useModuleColors } from '../../../../../theme/hooks/useAudioTheme';
import { createReverbStyles } from '../styles';

const VISUALIZATION_SIZE = 160;
const MAX_RADIUS = VISUALIZATION_SIZE * 0.35;
const SOURCE_RADIUS = 6;
const STEREO_WIDTH_MULTIPLIER = 45;

export const SpatialVisualization: React.FC<SpatialVisualizationProps> = ({
  roomSize, 
  damping, 
  wetLevel, 
  width 
}) => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('reverb');
  const styles = createReverbStyles();

  const centerX = VISUALIZATION_SIZE / 2;
  const centerY = VISUALIZATION_SIZE / 2;

  // Calculs optimisés avec useMemo
  const visualData = useMemo(() => {
    const mainRadius = roomSize * MAX_RADIUS;
    const dampingOpacity = Math.max(0.1, 0.4 * (1 - damping));
    const stereoWidth = width * STEREO_WIDTH_MULTIPLIER;
    const gradientOffset = Math.max(30, roomSize * 80);
    
    return {
      mainRadius,
      dampingOpacity,
      stereoWidth,
      gradientOffset,
      // Cercles de réverbération optimisés (seulement 3 au lieu de 4)
      reverbCircles: [0.4, 0.7, 1.0].map(ratio => mainRadius * ratio)
    };
  }, [roomSize, damping, width]);

  return (
    <Svg width={VISUALIZATION_SIZE} height={VISUALIZATION_SIZE} style={styles.visualization}>
      <Defs>
        <RadialGradient id="reverbGradient">
          <Stop offset="0%" stopColor={moduleColors.primary} stopOpacity={wetLevel * 0.8} />
          <Stop offset={`${visualData.gradientOffset}%`} stopColor={audioTheme.colors.spectrumSecondary} stopOpacity={wetLevel * 0.4} />
          <Stop offset="100%" stopColor={audioTheme.colors.moduleBackground} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Fond optimisé */}
      <Rect x={0} y={0} width={VISUALIZATION_SIZE} height={VISUALIZATION_SIZE} fill={audioTheme.colors.moduleBackground} rx={8} />

      {/* Cercles de réverbération optimisés */}
      {visualData.reverbCircles.map((radius, index) => (
        <Circle
          key={index}
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={moduleColors.primary}
          strokeWidth={1.5}
          strokeOpacity={visualData.dampingOpacity * (1 - index * 0.2)}
        />
      ))}

      {/* Zone de réverbération principale */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={visualData.mainRadius}
        fill="url(#reverbGradient)"
      />

      {/* Indicateur de largeur stéréo (en arrière-plan) */}
      <Path
        d={`M ${centerX - visualData.stereoWidth} ${centerY} L ${centerX + visualData.stereoWidth} ${centerY}`}
        stroke={audioTheme.colors.spectrumSecondary}
        strokeWidth={2}
        strokeOpacity={0.6}
        strokeLinecap="round"
      />
      
      {/* Marqueurs stéréo */}
      <Circle cx={centerX - visualData.stereoWidth} cy={centerY} r={2} fill={audioTheme.colors.spectrumSecondary} opacity={0.8} />
      <Circle cx={centerX + visualData.stereoWidth} cy={centerY} r={2} fill={audioTheme.colors.spectrumSecondary} opacity={0.8} />

      {/* Source sonore centrale */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={SOURCE_RADIUS}
        fill={audioTheme.colors.text}
        opacity={0.9}
      />
      <Circle
        cx={centerX}
        cy={centerY}
        r={SOURCE_RADIUS * 0.6}
        fill={moduleColors.primary}
        opacity={0.7}
      />
    </Svg>
  );
};

// Optimisation: Mémoisation du composant pour éviter les re-renders inutiles
export default React.memo(SpatialVisualization);