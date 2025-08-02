/**
 * Métriques système compactes pour le header
 * CPU, Buffer, Latency en format ultra compact
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useAudioTheme } from '../../theme/hooks/useAudioTheme';

interface SystemMetricsProps {
  isProcessing: boolean;
  compact?: boolean;
}

export const SystemMetrics: React.FC<SystemMetricsProps> = ({
  isProcessing,
  compact = true,
}) => {
  const audioTheme = useAudioTheme();
  
  const themedStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: compact ? audioTheme.spacing.sm : audioTheme.spacing.md,
      alignItems: 'center',
    },
    metric: {
      alignItems: 'center',
      minWidth: 32,
    },
    metricLabel: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.buttonInactive,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    metricValue: {
      ...audioTheme.typography.valueDisplay,
      color: audioTheme.colors.spectrumPrimary,
      marginTop: 1,
    },
  });

  return (
    <View style={themedStyles.container}>
      {/* CPU */}
      <View style={themedStyles.metric}>
        <Text style={themedStyles.metricLabel}>CPU</Text>
        <Text style={[
          themedStyles.metricValue,
          { color: isProcessing ? audioTheme.colors.levelMid : audioTheme.colors.buttonInactive }
        ]}>
          {isProcessing ? '12%' : '0%'}
        </Text>
      </View>

      {/* Buffer */}
      <View style={themedStyles.metric}>
        <Text style={themedStyles.metricLabel}>BUF</Text>
        <Text style={themedStyles.metricValue}>512</Text>
      </View>

      {/* Latency */}
      <View style={themedStyles.metric}>
        <Text style={themedStyles.metricLabel}>LAT</Text>
        <Text style={[
          themedStyles.metricValue,
          { color: isProcessing ? audioTheme.colors.levelHigh : audioTheme.colors.buttonInactive }
        ]}>
          {isProcessing ? '8ms' : '--'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  containerCompact: {
    gap: 8,
  },
  metric: {
    alignItems: 'center',
    minWidth: 32,
  },
  metricLabel: {
    color: '#666',
    fontSize: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
});