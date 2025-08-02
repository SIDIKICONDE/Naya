/**
 * Panneau rapide de sons et effets pour mobile
 * Interface glissante avec feedback tactile
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
import { useAudioTheme, useVisualizerColors } from '../../../theme/hooks/useAudioTheme';
import { createModuleStyles } from '../../../theme/utils/audioStyles';

interface QuickSoundPanelProps {
  onSoundPlay?: (soundId: string) => void;
  onEffectApply?: (effectId: string, intensity: number) => void;
  enableHapticFeedback?: boolean;
  panelHeight?: number;
}

interface SoundEffect {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'drum' | 'synth' | 'fx' | 'vocal';
}

// Fonction pour créer les effets sonores avec couleurs thématiques
const createSoundEffects = (audioTheme: ReturnType<typeof useAudioTheme>): SoundEffect[] => {
  const baseColors = {
    drum: {
      kick: audioTheme.colors.levelHigh,
      snare: audioTheme.colors.spectrumPrimary,
      hihat: audioTheme.colors.spectrumSecondary,
      clap: audioTheme.colors.levelMid,
    },
    synth: {
      bass: audioTheme.colors.equalizerColor,
      lead: audioTheme.colors.chorusColor,
      pad: audioTheme.colors.reverbColor,
      arp: audioTheme.colors.delayColor,
    },
    fx: {
      riser: audioTheme.colors.distortionColor,
      drop: audioTheme.colors.gateColor,
      sweep: audioTheme.colors.limiterColor,
      noise: audioTheme.colors.buttonInactive,
    },
    vocal: {
      vocal1: audioTheme.colors.levelLow,
      vocal2: audioTheme.colors.spectrumGradientStart,
      vocal3: audioTheme.colors.spectrumGradientEnd,
      vocal4: audioTheme.colors.knobActive,
    },
  };

  return [
    // Drums
    { id: 'kick', name: 'Kick', icon: '🥁', color: baseColors.drum.kick, category: 'drum' as const },
    { id: 'snare', name: 'Snare', icon: '🔥', color: baseColors.drum.snare, category: 'drum' as const },
    { id: 'hihat', name: 'Hi-Hat', icon: '✨', color: baseColors.drum.hihat, category: 'drum' as const },
    { id: 'clap', name: 'Clap', icon: '👏', color: baseColors.drum.clap, category: 'drum' as const },
    
    // Synth
    { id: 'bass', name: 'Bass', icon: '🎵', color: baseColors.synth.bass, category: 'synth' as const },
    { id: 'lead', name: 'Lead', icon: '⚡', color: baseColors.synth.lead, category: 'synth' as const },
    { id: 'pad', name: 'Pad', icon: '🌊', color: baseColors.synth.pad, category: 'synth' as const },
    { id: 'arp', name: 'Arp', icon: '🎛️', color: baseColors.synth.arp, category: 'synth' as const },
    
    // FX
    { id: 'riser', name: 'Riser', icon: '📈', color: baseColors.fx.riser, category: 'fx' as const },
    { id: 'drop', name: 'Drop', icon: '💥', color: baseColors.fx.drop, category: 'fx' as const },
    { id: 'sweep', name: 'Sweep', icon: '🌀', color: baseColors.fx.sweep, category: 'fx' as const },
    { id: 'noise', name: 'Noise', icon: '📻', color: baseColors.fx.noise, category: 'fx' as const },
    
    // Vocal
    { id: 'vocal1', name: 'Vocal', icon: '🎤', color: baseColors.vocal.vocal1, category: 'vocal' as const },
    { id: 'vocal2', name: 'Chop', icon: '✂️', color: baseColors.vocal.vocal2, category: 'vocal' as const },
    { id: 'vocal3', name: 'Echo', icon: '🔊', color: baseColors.vocal.vocal3, category: 'vocal' as const },
    { id: 'vocal4', name: 'Auto', icon: '🤖', color: baseColors.vocal.vocal4, category: 'vocal' as const },
  ];
};

export const QuickSoundPanel: React.FC<QuickSoundPanelProps> = ({
  onSoundPlay,
  onEffectApply,
  enableHapticFeedback = true,
  panelHeight = 200,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('drum');
  const [pressedSound, setPressedSound] = useState<string | null>(null);
  const [panelPosition] = useState(new Animated.Value(0));
  const [intensity, setIntensity] = useState(0.5);
  
  // Hook de thème audio
  const audioTheme = useAudioTheme();
  const visualizerColors = useVisualizerColors();
  
  // Couleurs de catégories adaptées au thème
  const categoryColors = {
    drum: audioTheme.colors.levelHigh,
    synth: audioTheme.colors.equalizerColor,
    fx: audioTheme.colors.chorusColor,
    vocal: audioTheme.colors.levelLow,
  };

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (enableHapticFeedback && Platform.OS === 'ios') {
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 50;
      Vibration.vibrate(duration);
    }
  }, [enableHapticFeedback]);

  const handleSoundPress = useCallback((soundEffect: SoundEffect) => {
    hapticFeedback('medium');
    setPressedSound(soundEffect.id);
    onSoundPlay?.(soundEffect.id);
    
    // Animation de feedback
    setTimeout(() => setPressedSound(null), 150);
  }, [hapticFeedback, onSoundPlay]);

  const handleSoundHold = useCallback((soundEffect: SoundEffect) => {
    hapticFeedback('heavy');
    onEffectApply?.(soundEffect.id, intensity);
  }, [hapticFeedback, onEffectApply, intensity]);

  const handleIntensityChange = useCallback((newIntensity: number) => {
    const clampedIntensity = Math.max(0, Math.min(1, newIntensity));
    setIntensity(clampedIntensity);
    hapticFeedback('light');
  }, [hapticFeedback]);

  const soundEffects = createSoundEffects(audioTheme);
  const filteredSounds = soundEffects.filter(sound => sound.category === selectedCategory);

  // Styles thématiques
  const themedStyles = StyleSheet.create({
    container: {
      backgroundColor: audioTheme.colors.knobBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: audioTheme.spacing.md,
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
      shadowColor: audioTheme.colors.spectrumPrimary,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      marginBottom: audioTheme.spacing.md,
    },
    title: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
      marginBottom: audioTheme.spacing.sm,
      textAlign: 'center',
    },
    categories: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: audioTheme.spacing.sm,
    },
    categoryButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: 'center',
      shadowColor: audioTheme.colors.spectrumPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    categoryText: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.buttonInactive,
    },
    categoryTextActive: {
      color: '#fff',
    },
    intensitySection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: audioTheme.spacing.md,
      gap: audioTheme.spacing.md,
    },
    intensityLabel: {
      ...audioTheme.typography.parameterLabel,
      color: '#fff',
    },
    intensityContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: audioTheme.spacing.sm,
    },
    intensityTrack: {
      flex: 1,
      height: 8,
      backgroundColor: audioTheme.colors.sliderTrack,
      borderRadius: 4,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: audioTheme.colors.buttonInactive,
    },
    intensityFill: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: 3,
    },
    intensityValue: {
      ...audioTheme.typography.valueDisplay,
      color: '#fff',
      minWidth: 35,
      textAlign: 'right',
    },
    soundGrid: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: audioTheme.spacing.sm,
      justifyContent: 'space-between',
    },
    soundButton: {
      width: '22%',
      aspectRatio: 1,
      borderRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 6,
    },
    soundButtonTouch: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    soundIcon: {
      fontSize: 20,
      marginBottom: 2,
    },
    soundName: {
      ...audioTheme.typography.parameterLabel,
      color: '#fff',
      textAlign: 'center',
    },
    feedbackIndicator: {
      height: 4,
      backgroundColor: audioTheme.colors.sliderTrack,
      borderRadius: 2,
      marginTop: audioTheme.spacing.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: audioTheme.colors.buttonInactive,
    },
    feedbackBar: {
      height: '100%',
      borderRadius: 1.5,
    },
  });

  return (
    <View style={[themedStyles.container, { height: panelHeight }]}>
      {/* Header avec catégories */}
      <View style={themedStyles.header}>
        <Text style={themedStyles.title}>🎵 Sons Rapides</Text>
        <View style={themedStyles.categories}>
          {Object.entries(categoryColors).map(([category, color]) => (
            <TouchableOpacity
              key={category}
              style={[
                themedStyles.categoryButton,
                { borderColor: color },
                selectedCategory === category && { backgroundColor: color },
              ]}
              onPress={() => {
                hapticFeedback('light');
                setSelectedCategory(category);
              }}
            >
              <Text
                style={[
                  themedStyles.categoryText,
                  selectedCategory === category && themedStyles.categoryTextActive,
                ]}
              >
                {category.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contrôle d'intensité */}
      <View style={themedStyles.intensitySection}>
        <Text style={themedStyles.intensityLabel}>Intensité</Text>
        <View style={themedStyles.intensityContainer}>
          <TouchableOpacity 
            style={themedStyles.intensityTrack}
            onPress={() => handleIntensityChange(intensity > 0.5 ? 0.3 : 0.8)}
          >
            <View 
              style={[
                themedStyles.intensityFill, 
                { 
                  height: `${intensity * 100}%`,
                  backgroundColor: categoryColors[selectedCategory as keyof typeof categoryColors],
                }
              ]} 
            />
          </TouchableOpacity>
          <Text style={themedStyles.intensityValue}>{Math.round(intensity * 100)}%</Text>
        </View>
      </View>

      {/* Grille de sons */}
      <View style={themedStyles.soundGrid}>
        {filteredSounds.map((soundEffect) => (
          <SoundButton
            key={soundEffect.id}
            soundEffect={soundEffect}
            isPressed={pressedSound === soundEffect.id}
            onPress={() => handleSoundPress(soundEffect)}
            onLongPress={() => handleSoundHold(soundEffect)}
          />
        ))}
      </View>

      {/* Indicateur de feedback */}
      <View style={themedStyles.feedbackIndicator}>
        <View 
          style={[
            themedStyles.feedbackBar,
            { 
              backgroundColor: categoryColors[selectedCategory as keyof typeof categoryColors],
              opacity: pressedSound ? 1 : 0.3,
            }
          ]} 
        />
      </View>
    </View>
  );
};

// Composant bouton de son individuel
interface SoundButtonProps {
  soundEffect: SoundEffect;
  isPressed: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const SoundButton: React.FC<SoundButtonProps> = ({
  soundEffect,
  isPressed,
  onPress,
  onLongPress,
}) => {
  const audioTheme = useAudioTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Styles thématiques pour le bouton de son
  const buttonStyles = StyleSheet.create({
    soundButton: {
      width: '22%',
      aspectRatio: 1,
      borderRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    soundButtonTouch: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    soundIcon: {
      fontSize: 20,
      marginBottom: 2,
    },
    soundName: {
      ...audioTheme.typography.parameterLabel,
      color: '#fff',
      textAlign: 'center',
    },
  });

  useEffect(() => {
    if (isPressed) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      });
    }
  }, [isPressed, scaleAnim, glowAnim]);

  // Animation de pulsation continue
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    return () => {
      pulseAnimation.stop();
    };
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        buttonStyles.soundButton,
        {
          transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          backgroundColor: soundEffect.color,
          shadowColor: soundEffect.color,
          shadowOpacity: glowAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={buttonStyles.soundButtonTouch}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={500}
      >
        <Text style={buttonStyles.soundIcon}>{soundEffect.icon}</Text>
        <Text style={buttonStyles.soundName}>{soundEffect.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

