/**
 * Header du compresseur avec titre, bouton power et VU-mètres
 */

import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { getThemedControlColors } from '../constants';
import { useAudioTheme, useModuleColors } from '../../../../../theme/hooks/useAudioTheme';
import { useTranslation } from '../../../../../i18n';

interface CompressorHeaderProps {
  isActive: boolean;
  gainReduction: number;
  gainReductionAnim: Animated.Value;
  threshold: number;
  onToggleActive: () => void;
  showPresets?: boolean;
  onTogglePresets?: () => void;
}

export const CompressorHeader: React.FC<CompressorHeaderProps> = ({
  isActive,
  gainReduction,
  gainReductionAnim,
  threshold,
  onToggleActive,
  showPresets = false,
  onTogglePresets,
}) => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('compressor');
  const CONTROL_COLORS = getThemedControlColors(audioTheme.colors);
  const { t } = useTranslation();

  // Styles thématiques 
  const styles = StyleSheet.create({
    header: {
      marginBottom: audioTheme.spacing.sm,
    },
    titleSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: audioTheme.spacing.sm,
    },
    title: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
    },
    powerButton: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: CONTROL_COLORS.inactive,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    powerButtonActive: {
      backgroundColor: CONTROL_COLORS.active,
      borderColor: CONTROL_COLORS.active,
    },
    powerButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold' as const,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: audioTheme.spacing.sm,
    },
    presetButton: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: audioTheme.colors.buttonInactive,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    presetButtonActive: {
      backgroundColor: moduleColors.primary,
      borderColor: moduleColors.primary,
    },
    presetButtonText: {
      fontSize: 10,
      color: audioTheme.colors.spectrumSecondary,
    },
    presetButtonTextActive: {
      color: '#fff',
    },
    metersContainer: {
      flexDirection: 'row',
      gap: audioTheme.spacing.sm,
    },
    grMeter: {
      flex: 1,
      backgroundColor: audioTheme.colors.knobBackground,
      borderRadius: 4,
      padding: 4,
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    grMeterContainer: {
      position: 'relative',
      height: 12,
      backgroundColor: audioTheme.colors.sliderTrack,
      borderRadius: 2,
      marginVertical: 2,
    },
    grScale: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 2,
    },
    grTick: {
      width: 1,
      height: 4,
      backgroundColor: audioTheme.colors.buttonInactive,
    },
    levelMeter: {
      backgroundColor: audioTheme.colors.knobBackground,
      borderRadius: 4,
      padding: 4,
      minWidth: 40,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    levelLabel: {
      color: audioTheme.colors.levelLow,
      fontSize: 8,
      fontWeight: '600' as const,
    },
    levelValue: {
      ...audioTheme.typography.valueDisplay,
      fontSize: 9,
      marginTop: 1,
    },
    grLabel: {
      color: CONTROL_COLORS.gainReduction,
      fontSize: 8,
      fontWeight: '600' as const,
    },
    grBar: {
      height: 3,
      backgroundColor: CONTROL_COLORS.gainReduction,
      borderRadius: 1.5,
      flex: 1,
    },
    grValue: {
      ...audioTheme.typography.valueDisplay,
      fontSize: 8,
      minWidth: 40,
      textAlign: 'right',
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>{t('audio:modules.compressor.title')}</Text>
        <View style={styles.headerButtons}>
          {onTogglePresets && (
            <TouchableOpacity
              style={[styles.presetButton, showPresets && styles.presetButtonActive]}
              onPress={onTogglePresets}
            >
              <Text style={[styles.presetButtonText, showPresets && styles.presetButtonTextActive]}>
                🎛️
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.powerButton, isActive && styles.powerButtonActive]}
            onPress={onToggleActive}
          >
            <Text style={styles.powerButtonText}>
              {isActive ? '●' : '○'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.metersContainer}>
        {/* Gain Reduction Meter */}
        <View style={styles.grMeter}>
          <Text style={styles.grLabel}>{t('audio:modules.compressor.meters.gainReduction')}</Text>
          <View style={styles.grMeterContainer}>
            <Animated.View
              style={[
                styles.grBar,
                {
                  width: gainReductionAnim.interpolate({
                    inputRange: [0, 20],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: gainReduction > 10 
                    ? CONTROL_COLORS.gainReductionHigh 
                    : CONTROL_COLORS.gainReduction,
                },
              ]}
            />
            <View style={styles.grScale}>
              {[0, 5, 10, 15, 20].map((val) => (
                <View key={val} style={styles.grTick} />
              ))}
            </View>
          </View>
          <Text style={styles.grValue}>-{gainReduction.toFixed(1)} dB</Text>
        </View>
        
        {/* Input/Output Level */}
        <View style={styles.levelMeter}>
          <Text style={styles.levelLabel}>{t('audio:modules.compressor.meters.inputOutput')}</Text>
          <Text style={styles.levelValue}>
            {threshold > -30 ? `${(threshold + 12).toFixed(0)}` : '0'} dB
          </Text>
        </View>
      </View>
    </View>
  );
};