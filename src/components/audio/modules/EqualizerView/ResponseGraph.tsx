/**
 * Graphique de la courbe de réponse EQ
 */

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Line, Circle, Rect } from 'react-native-svg';
import type { ResponseGraphProps } from './types';
import { generateResponseCurve, generateIndividualBandCurve, getFrequencyPosition, getBandColor } from './utils';
import { useAudioTheme, useModuleColors } from '../../../../theme/hooks/useAudioTheme';
import { createEqualizerStyles } from './styles';

export const ResponseGraph: React.FC<ResponseGraphProps> = ({
  bands,
  selectedBand,
  showIndividualCurves = true,
}) => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('equalizer');
  const styles = createEqualizerStyles();

  return (
    <View style={styles.responseGraph}>
      <Svg width={340} height={140} style={styles.graphSvg}>
        {/* Grille de fond */}
        <Rect 
          width="340" 
          height="140" 
          fill={audioTheme.colors.knobBackground} 
          stroke={audioTheme.colors.buttonInactive} 
          strokeWidth="1"
        />
        
        {/* Lignes de grille horizontales (gain) */}
        {[-12, -6, 0, 6, 12].map(gain => {
          const y = 70 - (gain / 24) * 140;
          return (
            <Line
              key={`gain-${gain}`}
              x1="0" y1={y}
              x2="340" y2={y}
              stroke={gain === 0 ? audioTheme.colors.spectrumSecondary : audioTheme.colors.buttonInactive}
              strokeWidth={gain === 0 ? "2" : "1"}
            />
          );
        })}
        
        {/* Lignes de grille verticales (fréquences) */}
        {[50, 100, 500, 1000, 5000, 10000].map(freq => {
          const x = getFrequencyPosition(freq);
          return (
            <Line
              key={`freq-${freq}`}
              x1={x} y1="0"
              x2={x} y2="140"
              stroke={audioTheme.colors.buttonInactive}
              strokeWidth="1"
            />
          );
        })}

        {/* Courbes individuelles de chaque bande */}
        {showIndividualCurves && bands.map(band => {
          if (!band.enabled || band.gain === 0) return null;
          const bandColor = getBandColor(band.id, false, audioTheme.colors);
          
          return (
            <Path
              key={`band-curve-${band.id}`}
              d={generateIndividualBandCurve(band)}
              stroke={bandColor}
              strokeWidth="1.5"
              strokeDasharray="4,2"
              fill="none"
              opacity="0.7"
            />
          );
        })}

        {/* Courbe de réponse globale */}
        <Path
          d={generateResponseCurve(bands)}
          stroke={moduleColors.primary}
          strokeWidth="3"
          fill="none"
        />

        {/* Points des bandes */}
        {bands.map(band => {
          if (!band.enabled) return null;
          const x = getFrequencyPosition(band.frequency);
          const y = 70 - (band.gain / 24) * 140;
          const isSelected = band.id === selectedBand;
          const bandColor = getBandColor(band.id, isSelected, audioTheme.colors);
          
          return (
            <Circle
              key={band.id}
              cx={x}
              cy={Math.max(5, Math.min(135, y))}
              r={isSelected ? "6" : "4"}
              fill={bandColor}
              stroke={audioTheme.colors.spectrumPrimary}
              strokeWidth="1"
            />
          );
        })}
      </Svg>

      {/* Labels de fréquences */}
      <View style={styles.frequencyLabels}>
        {[50, 100, 500, '1k', '5k', '10k'].map((freq, index) => (
          <Text key={index} style={styles.freqLabel}>{freq}</Text>
        ))}
      </View>
    </View>
  );
};