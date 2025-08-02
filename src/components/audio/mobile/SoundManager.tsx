/**
 * Gestionnaire de sons mobile optimisé
 * Contrôles audio tactiles et feedback sonore
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { audioInterface } from '../../../audio/AudioInterface';
import { useAudioTheme, useControlColors } from '../../../theme/hooks/useAudioTheme';
import { createControlButtonStyles, createSliderStyles } from '../../../theme/utils/audioStyles';

interface SoundManagerProps {
  compact?: boolean;
  showVolumeControl?: boolean;
  enableHapticFeedback?: boolean;
}

export const SoundManager: React.FC<SoundManagerProps> = ({
  compact = false,
  showVolumeControl = true,
  enableHapticFeedback = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const volumeButtonScale = useRef(new Animated.Value(1)).current;

  // Hook de thème audio
  const audioTheme = useAudioTheme();
  const controlColors = useControlColors();

  const hapticFeedback = useCallback(() => {
    if (enableHapticFeedback && Platform.OS === 'ios') {
      Vibration.vibrate(10);
    }
  }, [enableHapticFeedback]);

  const animateButton = useCallback((animatedValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePlay = useCallback(async () => {
    hapticFeedback();
    animateButton(playButtonScale);
    
    try {
      if (audioInterface) {
        if (isPlaying) {
          await audioInterface.stopProcessing();
        } else {
          await audioInterface.startProcessing();
        }
        setIsPlaying(!isPlaying);
      } else {
        console.log('audioInterface non disponible');
        setIsPlaying(!isPlaying); // Juste pour le feedback UI
      }
    } catch (error) {
      console.error('Erreur audio:', error);
    }
  }, [isPlaying, hapticFeedback, animateButton, playButtonScale]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    hapticFeedback();
    setVolume(newVolume);
    
    // Le contrôle de volume sera implémenté quand la méthode sera disponible
    console.log('Volume changé:', newVolume);
  }, [hapticFeedback]);

  const handleMute = useCallback(() => {
    hapticFeedback();
    animateButton(volumeButtonScale);
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Le mute sera implémenté quand la méthode sera disponible
    console.log('Mute changé:', newMuteState);
  }, [isMuted, hapticFeedback, animateButton, volumeButtonScale]);

  // Styles thématiques
  const controlStyles = createControlButtonStyles(audioTheme.colors);
  const sliderStyles = createSliderStyles(audioTheme.colors, controlColors.play);

  const themedStyles = StyleSheet.create({
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: audioTheme.spacing.sm,
      padding: audioTheme.spacing.sm,
      backgroundColor: audioTheme.colors.knobBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    compactPlayButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: controlColors.play,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: controlColors.play,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 6,
      borderWidth: 2,
      borderColor: audioTheme.colors.knobBackground,
    },
    compactPlayTouch: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    compactPlayIcon: {
      fontSize: 20,
    },
    compactVolumeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isMuted ? controlColors.mute : controlColors.active,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: audioTheme.colors.sliderTrack,
      shadowColor: isMuted ? controlColors.mute : controlColors.active,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    compactVolumeTouch: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    compactVolumeIcon: {
      fontSize: 16,
    },
    container: {
      backgroundColor: audioTheme.colors.knobBackground,
      borderRadius: 16,
      padding: audioTheme.spacing.lg,
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
      shadowColor: audioTheme.colors.spectrumPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    mainControls: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: audioTheme.spacing.lg,
      gap: audioTheme.spacing.md,
    },
    playButtonContainer: {
      shadowColor: controlColors.play,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: controlColors.play,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: audioTheme.colors.knobBackground,
    },
    playIcon: {
      fontSize: 28,
    },
    statusContainer: {
      flex: 1,
      alignItems: 'flex-start',
    },
    statusText: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
      marginBottom: audioTheme.spacing.xs,
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: audioTheme.colors.buttonInactive,
    },
    statusIndicatorActive: {
      backgroundColor: controlColors.play,
    },
    volumeControls: {
      marginBottom: audioTheme.spacing.lg,
    },
    volumeLabel: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.spectrumSecondary,
      marginBottom: audioTheme.spacing.sm,
    },
    volumeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: audioTheme.spacing.md,
    },
    muteButtonContainer: {
      shadowColor: controlColors.mute,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    muteButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isMuted ? controlColors.mute : controlColors.active,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: audioTheme.colors.sliderTrack,
    },
    muteIcon: {
      fontSize: 20,
    },
    volumeValue: {
      ...audioTheme.typography.valueDisplay,
      color: controlColors.play,
      minWidth: 40,
      textAlign: 'center',
    },
    quickControls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: audioTheme.spacing.sm,
    },
  });

  if (compact) {
    return (
      <View style={themedStyles.compactContainer}>
        <Animated.View style={[themedStyles.compactPlayButton, { transform: [{ scale: playButtonScale }] }]}>
          <TouchableOpacity onPress={handlePlay} style={themedStyles.compactPlayTouch}>
            <Text style={themedStyles.compactPlayIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {showVolumeControl && (
          <Animated.View style={[themedStyles.compactVolumeButton, { transform: [{ scale: volumeButtonScale }] }]}>
            <TouchableOpacity onPress={handleMute} style={themedStyles.compactVolumeTouch}>
              <Text style={themedStyles.compactVolumeIcon}>{isMuted ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      {/* Contrôle principal de lecture */}
      <View style={themedStyles.mainControls}>
        <Animated.View style={[themedStyles.playButtonContainer, { transform: [{ scale: playButtonScale }] }]}>
          <TouchableOpacity onPress={handlePlay} style={themedStyles.playButton}>
            <Text style={themedStyles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <View style={themedStyles.statusContainer}>
          <Text style={themedStyles.statusText}>{isPlaying ? 'En lecture' : 'En pause'}</Text>
          <View style={[themedStyles.statusIndicator, isPlaying && themedStyles.statusIndicatorActive]} />
        </View>
      </View>

      {/* Contrôles de volume */}
      {showVolumeControl && (
        <View style={themedStyles.volumeControls}>
          <Text style={themedStyles.volumeLabel}>Volume</Text>
          
          <View style={themedStyles.volumeContainer}>
            <Animated.View style={[themedStyles.muteButtonContainer, { transform: [{ scale: volumeButtonScale }] }]}>
              <TouchableOpacity onPress={handleMute} style={themedStyles.muteButton}>
                <Text style={themedStyles.muteIcon}>{isMuted ? '🔇' : '🔊'}</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <VolumeSlider
              value={isMuted ? 0 : volume}
              onValueChange={handleVolumeChange}
              disabled={isMuted}
            />
            
            <Text style={themedStyles.volumeValue}>{Math.round((isMuted ? 0 : volume) * 100)}%</Text>
          </View>
        </View>
      )}

      {/* Contrôles rapides */}
      <View style={themedStyles.quickControls}>
        <QuickActionButton
          icon="🎵"
          label="Presets"
          onPress={() => {/* Ouvrir presets */}}
          enableHaptic={enableHapticFeedback}
        />
        <QuickActionButton
          icon="⚙️"
          label="Réglages"
          onPress={() => {/* Ouvrir réglages */}}
          enableHaptic={enableHapticFeedback}
        />
        <QuickActionButton
          icon="🎛️"
          label="Effets"
          onPress={() => {/* Ouvrir effets */}}
          enableHaptic={enableHapticFeedback}
        />
      </View>
    </View>
  );
};

// Composant slider de volume tactile
interface VolumeSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({ value, onValueChange, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const audioTheme = useAudioTheme();
  const controlColors = useControlColors();
  const sliderWidth = 200;
  const thumbPosition = value * sliderWidth;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Styles thématiques pour le slider
  const sliderStyles = StyleSheet.create({
    volumeSlider: {
      flex: 1,
      height: 8,
      backgroundColor: audioTheme.colors.sliderTrack,
      borderRadius: 4,
      position: 'relative',
      opacity: disabled ? 0.5 : 1,
      borderWidth: 1,
      borderColor: audioTheme.colors.buttonInactive,
    },
    volumeTrack: {
      height: '100%',
      borderRadius: 4,
      overflow: 'hidden',
    },
    volumeFill: {
      height: '100%',
      backgroundColor: controlColors.play,
      borderRadius: 4,
      shadowColor: controlColors.play,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    volumeThumb: {
      position: 'absolute',
      top: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: controlColors.play,
      marginLeft: -12,
      shadowColor: controlColors.play,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 6,
      borderWidth: 2,
      borderColor: audioTheme.colors.knobBackground,
    },
    volumeThumbActive: {
      transform: [{ scale: 1.3 }],
      shadowOpacity: 0.6,
      shadowRadius: 8,
    },
  });

  // Animation du slider
  useEffect(() => {
    if (isDragging) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isDragging, scaleAnim, glowAnim]);

  return (
    <Animated.View 
      style={[
        sliderStyles.volumeSlider, 
        disabled && { opacity: 0.5 },
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <View style={sliderStyles.volumeTrack}>
        <Animated.View 
          style={[
            sliderStyles.volumeFill, 
            { 
              width: `${value * 100}%`,
              shadowOpacity: glowAnim,
            }
          ]} 
        />
        <Animated.View 
          style={[
            sliderStyles.volumeThumb, 
            { left: thumbPosition },
            isDragging && sliderStyles.volumeThumbActive,
            {
              shadowOpacity: Animated.add(0.4, Animated.multiply(glowAnim, 0.3)),
            }
          ]} 
        />
      </View>
    </Animated.View>
  );
};

// Composant bouton d'action rapide
interface QuickActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  enableHaptic?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ 
  icon, 
  label, 
  onPress, 
  enableHaptic = true 
}) => {
  const audioTheme = useAudioTheme();
  const controlColors = useControlColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Styles thématiques pour le bouton d'action rapide
  const buttonStyles = StyleSheet.create({
    quickActionButton: {
      flex: 1,
      backgroundColor: audioTheme.colors.buttonInactive,
      borderRadius: 12,
      padding: audioTheme.spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
      shadowColor: audioTheme.colors.spectrumPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    quickActionTouch: {
      width: '100%',
      alignItems: 'center',
    },
    quickActionIcon: {
      fontSize: 24,
      marginBottom: audioTheme.spacing.xs,
    },
    quickActionLabel: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.spectrumSecondary,
      textAlign: 'center',
    },
  });

  const handlePress = useCallback(() => {
    if (enableHaptic && Platform.OS === 'ios') {
      Vibration.vibrate(15);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  }, [enableHaptic, scaleAnim, onPress]);

  return (
    <Animated.View style={[buttonStyles.quickActionButton, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} style={buttonStyles.quickActionTouch}>
        <Text style={buttonStyles.quickActionIcon}>{icon}</Text>
        <Text style={buttonStyles.quickActionLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

