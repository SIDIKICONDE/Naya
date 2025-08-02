/**
 * Carte d'affichage d'un preset
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import type { PresetCardProps } from '../types';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';

export const PresetCard: React.FC<PresetCardProps> = ({
  preset, 
  onLoad, 
  onDelete 
}) => {
  const audioTheme = useAudioTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWaveform, setShowWaveform] = useState(false);
  const waveAnimation = new Animated.Value(0);

  const handlePreview = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setShowWaveform(true);
      
      // Animation de waveform
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Arrêter après 3 secondes
      setTimeout(() => {
        setIsPlaying(false);
        setShowWaveform(false);
        waveAnimation.stopAnimation();
      }, 3000);
    } else {
      setIsPlaying(false);
      setShowWaveform(false);
      waveAnimation.stopAnimation();
    }
  };

  const styles = createStyles(audioTheme);

  return (
    <TouchableOpacity style={styles.presetCard} onPress={onLoad}>
      <View style={styles.presetInfo}>
        <View style={styles.presetHeader}>
          <Text style={styles.presetName}>{preset.name}</Text>
          <TouchableOpacity 
            style={styles.previewButton} 
            onPress={handlePreview}
          >
            <Text style={styles.previewIcon}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.presetCategory}>{preset.category}</Text>
        
        {/* Waveform de prévisualisation */}
        {showWaveform && (
          <View style={styles.waveformContainer}>
            {[...Array(12)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: waveAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, Math.random() * 12 + 2],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.presetActions}>
        <TouchableOpacity style={styles.loadButton} onPress={onLoad}>
          <Text style={styles.loadButtonText}>Charger</Text>
        </TouchableOpacity>
        
        {preset.category === 'User' && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (audioTheme: any) => StyleSheet.create({
  presetCard: {
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.sm,
    padding: audioTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
    borderLeftWidth: 3,
    borderLeftColor: audioTheme.colors.primary,
    shadowColor: audioTheme.colors.knobBackground,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  presetInfo: {
    flex: 1,
    paddingRight: audioTheme.spacing.sm,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: audioTheme.spacing.xxs,
  },
  presetName: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
    letterSpacing: 0.3,
    flex: 1,
  },
  previewButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: audioTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: audioTheme.spacing.sm,
  },
  previewIcon: {
    fontSize: 10,
  },
  presetCategory: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: audioTheme.spacing.xxs,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    height: 16,
    marginTop: audioTheme.spacing.xxs,
  },
  waveformBar: {
    width: 2,
    backgroundColor: audioTheme.colors.primary,
    borderRadius: 1,
    minHeight: 2,
  },
  presetActions: {
    flexDirection: 'row',
    gap: audioTheme.spacing.xs,
    alignItems: 'center',
  },
  loadButton: {
    backgroundColor: audioTheme.colors.success,
    paddingHorizontal: audioTheme.spacing.md,
    paddingVertical: audioTheme.spacing.xs,
    borderRadius: audioTheme.spacing.md,
    shadowColor: audioTheme.colors.success,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  loadButtonText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
    letterSpacing: 0.3,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: audioTheme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: audioTheme.colors.error,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonText: {
    fontSize: 12,
  },
});