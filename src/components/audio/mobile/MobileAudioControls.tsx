/**
 * Contrôles audio mobiles ultra-compacts
 * Interface tactile optimisée pour smartphones
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useAudioTheme, useControlColors } from '../../../theme/hooks/useAudioTheme';
import { createControlButtonStyles, createSliderStyles } from '../../../theme/utils/audioStyles';

const { width: screenWidth } = Dimensions.get('window');

interface MobileAudioControlsProps {
  onVolumeChange?: (volume: number) => void;
  onPlayPause?: (isPlaying: boolean) => void;
  onEffectToggle?: (effectType: string) => void;
  compact?: boolean;
}

export const MobileAudioControls: React.FC<MobileAudioControlsProps> = ({
  onVolumeChange,
  onPlayPause,
  onEffectToggle,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  
  const audioTheme = useAudioTheme();
  const controlColors = useControlColors();
  
  const volumeAnimation = useRef(new Animated.Value(0.7)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;

  const handlePlayPause = useCallback(() => {
    Animated.sequence([
      Animated.timing(playButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(playButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    onPlayPause?.(newPlayState);
  }, [isPlaying, onPlayPause, playButtonScale]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    onVolumeChange?.(clampedVolume);
    
    Animated.timing(volumeAnimation, {
      toValue: clampedVolume,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [onVolumeChange, volumeAnimation]);

  const handleEffectToggle = useCallback((effectType: string) => {
    const newActiveEffect = activeEffect === effectType ? null : effectType;
    setActiveEffect(newActiveEffect);
    onEffectToggle?.(effectType);
  }, [activeEffect, onEffectToggle]);

  // Styles thématiques
  const controlStyles = createControlButtonStyles(audioTheme.colors);
  const sliderStyles = createSliderStyles(audioTheme.colors, controlColors.play);

  const themedStyles = StyleSheet.create({
    compactContainer: {
      backgroundColor: audioTheme.colors.knobBackground,
      borderRadius: 20,
      padding: audioTheme.spacing.sm,
      margin: 4,
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    compactControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: audioTheme.spacing.sm,
    },
    compactPlayButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: controlColors.play,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: controlColors.play,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    compactPlayTouch: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    compactPlayIcon: {
      fontSize: 18,
    },
    compactEffects: {
      flexDirection: 'row',
      gap: 4,
    },
    compactEffectButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: audioTheme.colors.buttonInactive,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    compactEffectButtonActive: {
      backgroundColor: controlColors.active,
      borderColor: controlColors.active,
    },
    compactEffectIcon: {
      fontSize: 12,
    },
    container: {
      flex: 1,
      backgroundColor: audioTheme.colors.knobBackground,
    },
    mobileControls: {
      flex: 1,
      padding: audioTheme.spacing.md,
    },
    mobileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: audioTheme.spacing.lg,
    },
    mobileTitle: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
    },
    statusDot: {
      padding: 4,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: audioTheme.colors.buttonInactive,
    },
    statusActive: {
      backgroundColor: controlColors.play,
    },
    playControlSection: {
      alignItems: 'center',
      marginBottom: audioTheme.spacing.xl,
    },
    playButtonLarge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: controlColors.play,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: audioTheme.spacing.md,
      shadowColor: controlColors.play,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    playButtonTouch: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButtonIcon: {
      fontSize: 32,
    },
    playStatusText: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.spectrumSecondary,
      textAlign: 'center',
    },
    volumeSection: {
      marginBottom: audioTheme.spacing.lg,
    },
    sectionTitle: {
      ...audioTheme.typography.parameterLabel,
      color: '#fff',
      marginBottom: audioTheme.spacing.md,
    },
    volumePercentage: {
      ...audioTheme.typography.valueDisplay,
      color: controlColors.play,
      textAlign: 'center',
      marginTop: audioTheme.spacing.sm,
    },
    effectsSection: {
      marginBottom: audioTheme.spacing.md,
    },
    effectsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: audioTheme.spacing.sm,
    },
    effectButton: {
      width: (screenWidth - 64) / 3 - 4,
      aspectRatio: 1,
      backgroundColor: audioTheme.colors.buttonInactive,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    effectButtonActive: {
      backgroundColor: controlColors.active,
      borderColor: controlColors.active,
    },
    effectIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    effectLabel: {
      ...audioTheme.typography.parameterLabel,
      color: '#fff',
      textAlign: 'center',
    },

  });

  if (compact) {
    return (
      <View style={themedStyles.compactContainer}>
        <View style={themedStyles.compactControls}>
          {/* Bouton Play/Pause compact */}
          <Animated.View style={[themedStyles.compactPlayButton, { transform: [{ scale: playButtonScale }] }]}>
            <TouchableOpacity onPress={handlePlayPause} style={themedStyles.compactPlayTouch}>
              <Text style={themedStyles.compactPlayIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Volume compact */}
          <CompactVolumeControl
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />

          {/* Effets compacts */}
          <View style={themedStyles.compactEffects}>
            {['🎛️', '🎵', '⚡'].map((icon, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  themedStyles.compactEffectButton,
                  activeEffect === `effect${index}` && themedStyles.compactEffectButtonActive
                ]}
                onPress={() => handleEffectToggle(`effect${index}`)}
              >
                <Text style={themedStyles.compactEffectIcon}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.mobileControls}>
        {/* Header mobile */}
        <View style={themedStyles.mobileHeader}>
          <Text style={themedStyles.mobileTitle}>🎵 Audio Mobile</Text>
          <View style={themedStyles.statusDot}>
            <View style={[themedStyles.statusIndicator, isPlaying && themedStyles.statusActive]} />
          </View>
        </View>

        {/* Contrôle principal de lecture */}
        <View style={themedStyles.playControlSection}>
          <Animated.View style={[themedStyles.playButtonLarge, { transform: [{ scale: playButtonScale }] }]}>
            <TouchableOpacity onPress={handlePlayPause} style={themedStyles.playButtonTouch}>
              <Text style={themedStyles.playButtonIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={themedStyles.playStatusText}>
            {isPlaying ? 'En cours de lecture' : 'Appuyez pour jouer'}
          </Text>
        </View>

        {/* Contrôle de volume tactile */}
        <View style={themedStyles.volumeSection}>
          <Text style={themedStyles.sectionTitle}>Volume</Text>
          <TouchVolumeSlider
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
          <Text style={themedStyles.volumePercentage}>{Math.round(volume * 100)}%</Text>
        </View>

        {/* Effets et presets */}
        <View style={themedStyles.effectsSection}>
          <Text style={themedStyles.sectionTitle}>Effets Rapides</Text>
          <View style={themedStyles.effectsGrid}>
            {[
              { icon: '🎛️', label: 'EQ', type: 'equalizer' },
              { icon: '🔊', label: 'Comp', type: 'compressor' },
              { icon: '🌊', label: 'Rev', type: 'reverb' },
              { icon: '⏰', label: 'Del', type: 'delay' },
              { icon: '🎵', label: 'Cho', type: 'chorus' },
              { icon: '🛡️', label: 'Lim', type: 'limiter' },
            ].map((effect) => (
              <TouchableOpacity
                key={effect.type}
                style={[
                  themedStyles.effectButton,
                  activeEffect === effect.type && themedStyles.effectButtonActive
                ]}
                onPress={() => handleEffectToggle(effect.type)}
              >
                <Text style={themedStyles.effectIcon}>{effect.icon}</Text>
                <Text style={themedStyles.effectLabel}>{effect.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// Composant volume compact tactile
interface CompactVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const CompactVolumeControl: React.FC<CompactVolumeControlProps> = ({
  volume,
  onVolumeChange,
}) => {
  const audioTheme = useAudioTheme();
  const controlColors = useControlColors();

  const volumeStyles = StyleSheet.create({
    compactVolumeContainer: {
      flex: 1,
      marginHorizontal: audioTheme.spacing.sm,
    },
    compactVolumeTrack: {
      height: 4,
      backgroundColor: audioTheme.colors.sliderTrack,
      borderRadius: 2,
      marginBottom: 2,
    },
    compactVolumeFill: {
      height: '100%',
      backgroundColor: controlColors.play,
      borderRadius: 2,
    },
    compactVolumeText: {
      ...audioTheme.typography.parameterLabel,
      color: '#fff',
      fontSize: 8,
      textAlign: 'center',
    },
  });

  return (
    <View style={volumeStyles.compactVolumeContainer}>
      <View style={volumeStyles.compactVolumeTrack}>
        <View style={[volumeStyles.compactVolumeFill, { width: `${volume * 100}%` }]} />
      </View>
      <Text style={volumeStyles.compactVolumeText}>{Math.round(volume * 100)}</Text>
    </View>
  );
};

// Composant slider de volume tactile
interface TouchVolumeSliderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const TouchVolumeSlider: React.FC<TouchVolumeSliderProps> = ({
  volume,
  onVolumeChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<View>(null);
  const audioTheme = useAudioTheme();
  const controlColors = useControlColors();

  const sliderStyles = StyleSheet.create({
    touchSliderContainer: {
      marginVertical: audioTheme.spacing.sm,
    },
    touchSliderTrack: {
      height: 6,
      backgroundColor: audioTheme.colors.sliderTrack,
      borderRadius: 3,
      position: 'relative',
    },
    touchSliderFill: {
      height: '100%',
      backgroundColor: controlColors.play,
      borderRadius: 3,
    },
    touchSliderThumb: {
      position: 'absolute',
      top: -6,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: controlColors.play,
      marginLeft: -9,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    touchSliderThumbActive: {
      transform: [{ scale: 1.3 }],
    },
    volumeIndicators: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: audioTheme.spacing.sm,
    },
    volumeIndicator: {
      width: 3,
      height: 12,
      backgroundColor: audioTheme.colors.sliderTrack,
      borderRadius: 1.5,
    },
    volumeIndicatorActive: {
      backgroundColor: controlColors.play,
    },
  });

  const handleTouch = useCallback((event: any) => {
    const { locationX } = event.nativeEvent;
    const sliderWidth = screenWidth - 64; // Padding total
    const newVolume = Math.max(0, Math.min(1, locationX / sliderWidth));
    onVolumeChange(newVolume);
  }, [onVolumeChange]);

  return (
    <View style={sliderStyles.touchSliderContainer}>
      <View
        ref={sliderRef}
        style={sliderStyles.touchSliderTrack}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouch}
      >
        <View style={[sliderStyles.touchSliderFill, { width: `${volume * 100}%` }]} />
        <View 
          style={[
            sliderStyles.touchSliderThumb,
            { left: `${volume * 100}%` },
            isDragging && sliderStyles.touchSliderThumbActive
          ]}
        />
      </View>
      
      {/* Indicateurs visuels */}
      <View style={sliderStyles.volumeIndicators}>
        {[0, 0.25, 0.5, 0.75, 1].map((level, index) => (
          <View
            key={index}
            style={[
              sliderStyles.volumeIndicator,
              volume >= level && sliderStyles.volumeIndicatorActive
            ]}
          />
        ))}
      </View>
    </View>
  );
};

