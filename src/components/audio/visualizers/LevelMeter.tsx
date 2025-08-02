/**
 * VU-Mètres stéréo professionnels
 * Indicateurs de niveau avec peak hold
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
} from 'react-native';
import { audioInterface } from '../../../audio/AudioInterface';
import { AudioMockData } from './AudioMockData'; // TODO: À supprimer
import { useVisualizerColors, useAudioTheme } from '../../../theme/hooks/useAudioTheme';
import { useTranslation } from '../../../i18n';

interface LevelMeterProps {
  showLabels?: boolean;
}

export const LevelMeter: React.FC<LevelMeterProps> = ({ showLabels = true }) => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState({
    peakLeft: -60,
    peakRight: -60,
    rmsLeft: -60,
    rmsRight: -60,
  });
  
  const visualizerColors = useVisualizerColors();
  const audioTheme = useAudioTheme();
  
  const peakLeftAnim = useRef(new Animated.Value(0)).current;
  const peakRightAnim = useRef(new Animated.Value(0)).current;
  const rmsLeftAnim = useRef(new Animated.Value(0)).current;
  const rmsRightAnim = useRef(new Animated.Value(0)).current;
  
  const [peakHoldLeft, setPeakHoldLeft] = useState(-60);
  const [peakHoldRight, setPeakHoldRight] = useState(-60);
  const peakHoldTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        // TODO: Remplacer par audioInterface.getAudioMetrics() quand disponible
        const audioMetrics = AudioMockData.getAudioMetrics();
        
        // Mettre à jour les métriques
        setMetrics({
          peakLeft: audioMetrics.peak.left,
          peakRight: audioMetrics.peak.right,
          rmsLeft: audioMetrics.rms.left,
          rmsRight: audioMetrics.rms.right,
        });

        // Animer les barres avec moins de transitions
        animateLevel(peakLeftAnim, audioMetrics.peak.left);
        animateLevel(peakRightAnim, audioMetrics.peak.right);
        animateLevel(rmsLeftAnim, audioMetrics.rms.left);
        animateLevel(rmsRightAnim, audioMetrics.rms.right);

        // Peak hold
        updatePeakHold(audioMetrics.peak.left, audioMetrics.peak.right);
      } catch (error) {
        // Valeurs par défaut si pas de données
      }
    }, 80); // Réduit de 50ms à 80ms pour de meilleures performances

    return () => {
      clearInterval(interval);
      if (peakHoldTimer.current) clearTimeout(peakHoldTimer.current as any);
    };
  }, []);

  const animateLevel = (animValue: Animated.Value, dbValue: number) => {
    const normalizedValue = dbToNormalized(dbValue);
    Animated.timing(animValue, {
      toValue: normalizedValue,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const updatePeakHold = (leftPeak: number, rightPeak: number) => {
    if (leftPeak > peakHoldLeft) {
      setPeakHoldLeft(leftPeak);
    }
    if (rightPeak > peakHoldRight) {
      setPeakHoldRight(rightPeak);
    }

    // Reset peak hold après 2 secondes
    if (peakHoldTimer.current) clearTimeout(peakHoldTimer.current);
    peakHoldTimer.current = setTimeout(() => {
      setPeakHoldLeft(-60);
      setPeakHoldRight(-60);
    }, 2000) as any;
  };

  const styles = createStyles(audioTheme, visualizerColors);

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.header}>
          <Text style={styles.title}>{t('audio:visualizers.levelMeter.title')}</Text>
        </View>
      )}

      <View style={styles.metersContainer}>
        {/* Canal gauche */}
        <View style={styles.channelContainer}>
          <Text style={styles.channelLabel}>{t('audio:visualizers.levelMeter.left')}</Text>
          <View style={styles.meterTrack}>
            {/* Échelle dB */}
            <View style={styles.dbScale}>
              {[0, -6, -12, -20, -40].map(db => (
                <View key={db} style={[styles.dbMark, { top: `${dbToPercent(db)}%` }]}>
                  <View style={styles.dbLine} />
                  <Text style={styles.dbText}>{db}</Text>
                </View>
              ))}
            </View>

            {/* Barre RMS */}
            <Animated.View
              style={[
                styles.rmsMeter,
                {
                  height: rmsLeftAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: rmsLeftAnim.interpolate({
                    inputRange: [0, 0.7, 0.9, 1],
                    outputRange: [
                      visualizerColors.rmsNormal,
                      visualizerColors.rmsWarning,
                      visualizerColors.rmsCaution,
                      visualizerColors.rmsAlert
                    ],
                  }),
                },
              ]}
            />

            {/* Barre Peak */}
            <Animated.View
              style={[
                styles.peakMeter,
                {
                  height: peakLeftAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />

            {/* Peak hold */}
            <View
              style={[
                styles.peakHold,
                { bottom: `${dbToPercent(peakHoldLeft)}%` },
              ]}
            />
          </View>
          <Text style={styles.valueText}>{metrics.peakLeft.toFixed(1)}</Text>
        </View>

        {/* Canal droit */}
        <View style={styles.channelContainer}>
          <Text style={styles.channelLabel}>{t('audio:visualizers.levelMeter.right')}</Text>
          <View style={styles.meterTrack}>
            {/* Barre RMS */}
            <Animated.View
              style={[
                styles.rmsMeter,
                {
                  height: rmsRightAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: rmsRightAnim.interpolate({
                    inputRange: [0, 0.7, 0.9, 1],
                    outputRange: [
                      visualizerColors.rmsNormal,
                      visualizerColors.rmsWarning,
                      visualizerColors.rmsCaution,
                      visualizerColors.rmsAlert
                    ],
                  }),
                },
              ]}
            />

            {/* Barre Peak */}
            <Animated.View
              style={[
                styles.peakMeter,
                {
                  height: peakRightAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />

            {/* Peak hold */}
            <View
              style={[
                styles.peakHold,
                { bottom: `${dbToPercent(peakHoldRight)}%` },
              ]}
            />
          </View>
          <Text style={styles.valueText}>{metrics.peakRight.toFixed(1)}</Text>
        </View>
      </View>

      {/* Indicateur de corrélation stéréo */}
      <View style={styles.correlationContainer}>
        <Text style={styles.correlationLabel}>{t('audio:visualizers.levelMeter.phase')}</Text>
        <View style={styles.correlationBar}>
          <View style={[styles.correlationIndicator, { left: '50%' }]} />
        </View>
      </View>
    </View>
  );
};

// Utilitaires
const dbToNormalized = (db: number): number => {
  // Convertir dB en valeur 0-1 (avec -60dB comme minimum)
  return Math.max(0, Math.min(1, (db + 60) / 60));
};

const dbToPercent = (db: number): number => {
  return (1 - dbToNormalized(db)) * 100;
};

const createStyles = (audioTheme: any, visualizerColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.xxs,
    padding: audioTheme.spacing.xxs,
  },
  header: {
    marginBottom: audioTheme.spacing.xxs,
  },
  title: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.text,
    textAlign: 'center',
  },
  metersContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: audioTheme.spacing.xxs,
  },
  channelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  channelLabel: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    fontSize: 8,
    marginBottom: audioTheme.spacing.xxs,
  },
  meterTrack: {
    flex: 1,
    width: 20,
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.xxs,
    borderWidth: 0.5,
    borderColor: audioTheme.colors.buttonInactive,
    position: 'relative',
    overflow: 'hidden',
  },
  dbScale: {
    position: 'absolute',
    left: -15,
    top: 0,
    bottom: 0,
    width: 12,
  },
  dbMark: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dbLine: {
    width: 12,
    height: 0.5,
    backgroundColor: audioTheme.colors.buttonInactive,
  },
  dbText: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    fontSize: 6,
    marginLeft: 1,
  },
  rmsMeter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 1,
  },
  peakMeter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: visualizerColors.peakMeter,
  },
  peakHold: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: visualizerColors.peakHold,
  },
  valueText: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    fontSize: 7,
    marginTop: audioTheme.spacing.xxs,
  },
  correlationContainer: {
    marginTop: audioTheme.spacing.xxs,
    paddingTop: audioTheme.spacing.xxs,
    borderTopWidth: 0.5,
    borderTopColor: audioTheme.colors.buttonInactive,
  },
  correlationLabel: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    fontSize: 7,
    textAlign: 'center',
    marginBottom: audioTheme.spacing.xxs,
  },
  correlationBar: {
    height: 2,
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: 1,
    position: 'relative',
  },
  correlationIndicator: {
    position: 'absolute',
    width: 1,
    height: 4,
    backgroundColor: visualizerColors.correlation,
    top: -1,
    marginLeft: -0.5,
  },
});