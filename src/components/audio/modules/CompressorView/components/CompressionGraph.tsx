/**
 * Graphique de visualisation de la courbe de compression
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Circle } from 'react-native-svg';
import { generateCompressionCurve } from '../utils';
import { getThemedGraphConfig, getThemedCompactGraphConfig } from '../constants';
import { useAudioTheme } from '../../../../../theme/hooks/useAudioTheme';

interface CompressionGraphProps {
  threshold: number;
  ratio: number;
  knee: number;
  compact?: boolean;
}

export const CompressionGraph: React.FC<CompressionGraphProps> = ({
  threshold,
  ratio,
  knee,
  compact = false,
}) => {
  const audioTheme = useAudioTheme();
  const config = compact ? getThemedCompactGraphConfig(audioTheme.colors) : getThemedGraphConfig(audioTheme.colors);
  const { width, height, gridLines, strokeWidth, gridColor, lineColor, curveColor, thresholdColor } = config;

  const curvePath = generateCompressionCurve(threshold, ratio, knee, width, height);

  // Styles thématiques
  const styles = StyleSheet.create({
    graphContainer: {
      backgroundColor: audioTheme.colors.knobBackground,
      borderRadius: 8,
      padding: audioTheme.spacing.md,
      marginBottom: audioTheme.spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    compactContainer: {
      padding: audioTheme.spacing.sm,
      marginBottom: audioTheme.spacing.sm,
      borderRadius: 6,
    },
    graph: {
      backgroundColor: audioTheme.colors.buttonInactive,
      borderRadius: 6,
    },
    compactGraph: {
      borderRadius: 4,
    },
  });

  return (
    <View style={[styles.graphContainer, compact && styles.compactContainer]}>
      <Svg width={width} height={height} style={[styles.graph, compact && styles.compactGraph]}>
        {/* Grille */}
        {gridLines.map(db => {
          const pos = ((db + 60) / 60) * width;
          const yPos = height - pos;
          return (
            <React.Fragment key={db}>
              {/* Ligne verticale */}
              <Line
                x1={pos}
                y1={0}
                x2={pos}
                y2={height}
                stroke={gridColor}
                strokeWidth={1}
              />
              {/* Ligne horizontale */}
              <Line
                x1={0}
                y1={yPos}
                x2={width}
                y2={yPos}
                stroke={gridColor}
                strokeWidth={1}
              />
              {/* Étiquette axe X (bas) */}
              <SvgText
                x={pos}
                y={height - 2}
                fill={audioTheme.colors.buttonInactive}
                fontSize="8"
                textAnchor="middle"
                alignmentBaseline="baseline"
              >
                {db}
              </SvgText>
              {/* Étiquette axe Y (gauche) */}
              <SvgText
                x={3}
                y={yPos}
                fill={audioTheme.colors.buttonInactive}
                fontSize="8"
                textAnchor="start"
                alignmentBaseline="central"
              >
                {db}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Ligne 1:1 (pas de compression) */}
        <Line
          x1={0}
          y1={height}
          x2={width}
          y2={0}
          stroke={lineColor}
          strokeWidth={1}
          strokeDasharray="5,5"
        />

        {/* Courbe de compression */}
        <Path
          d={curvePath}
          fill="none"
          stroke={curveColor}
          strokeWidth={strokeWidth}
        />

        {/* Point de seuil */}
        <Circle
          cx={((threshold + 60) / 60) * width}
          cy={height - ((threshold + 60) / 60) * height}
          r={5}
          fill={thresholdColor}
          stroke={audioTheme.colors.knobBackground}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
};