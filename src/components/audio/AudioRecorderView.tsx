import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import NativeAudioRecorder, { AudioRecorderConfig } from '../../specs/NativeAudioRecorder';
import { AudioPresets } from '../../constants/AudioPresets';
import { AudioQualityHelper, AudioUsage, ConfigInfo } from '../../utils/AudioQualityHelper';
import RNFS from 'react-native-fs';

interface AudioRecorderViewProps {
  preset?: keyof typeof AudioPresets;
  onRecordingComplete?: (filePath: string) => void;
  onError?: (error: string) => void;
}

const AudioRecorderView: React.FC<AudioRecorderViewProps> = ({
  preset = 'StudioMax',
  onRecordingComplete,
  onError,
}) => {
  // États
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentConfig, setCurrentConfig] = useState<AudioRecorderConfig>(AudioPresets[preset]);
  const [configInfo, setConfigInfo] = useState<ConfigInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Animations
  const pulseAnimation = useSharedValue(1);
  const levelBarWidth = useSharedValue(0);

  // Initialisation
  useEffect(() => {
    initializeRecorder();
    
    return () => {
      NativeAudioRecorder.cleanup();
    };
  }, []);

  // Mise à jour de l'info de configuration
  useEffect(() => {
    const info = AudioQualityHelper.getConfigInfo(currentConfig);
    setConfigInfo(info);
  }, [currentConfig]);

  // Timer et monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        updateRecordingStats();
      }, 100); // 10 FPS pour les stats
    }

    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Animation de pulsation pour l'enregistrement
  useEffect(() => {
    if (isRecording && !isPaused) {
      pulseAnimation.value = withRepeat(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      pulseAnimation.value = withTiming(1, { duration: 300 });
    }
  }, [isRecording, isPaused]);

  // Animation de la barre de niveau
  useEffect(() => {
    levelBarWidth.value = withTiming(audioLevel * 100, { duration: 50 });
  }, [audioLevel]);

  const initializeRecorder = async () => {
    try {
      const validation = AudioQualityHelper.validateConfig(currentConfig);
      
      if (!validation.isValid) {
        Alert.alert('Configuration invalide', validation.errors.join('\n'));
        return;
      }

      if (validation.warnings.length > 0) {
        console.warn('Avertissements de configuration:', validation.warnings);
      }

      const initialized = NativeAudioRecorder.initialize(currentConfig);
      
      if (initialized) {
        setIsInitialized(true);
        console.log('Enregistreur initialisé avec succès');
      } else {
        throw new Error('Échec de l\'initialisation');
      }
    } catch (error) {
      const errorMsg = `Erreur d'initialisation: ${error}`;
      console.error(errorMsg);
      onError?.(errorMsg);
    }
  };

  const updateRecordingStats = () => {
    try {
      const stats = NativeAudioRecorder.getRecordingStats();
      setRecordingTime(stats.duration);
      
      const level = NativeAudioRecorder.getAudioLevel();
      setAudioLevel(level);
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
    }
  };

  const handleStartStop = useCallback(async () => {
    if (!isInitialized) {
      Alert.alert('Erreur', 'Enregistreur non initialisé');
      return;
    }

    try {
      if (!isRecording) {
        // Démarrer l'enregistrement
        const timestamp = Date.now();
        const filename = `recording_${timestamp}_${currentConfig.sampleRate}Hz_${currentConfig.bitDepth}bit.wav`;
        const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
        
        const started = NativeAudioRecorder.startRecording(path);
        
        if (started) {
          setIsRecording(true);
          setIsPaused(false);
          setRecordingTime(0);
          console.log('Enregistrement démarré:', path);
        } else {
          throw new Error('Impossible de démarrer l\'enregistrement');
        }
      } else {
        // Arrêter l'enregistrement
        const filePath = NativeAudioRecorder.stopRecording();
        setIsRecording(false);
        setIsPaused(false);
        
        // Réinitialiser les valeurs
        setRecordingTime(0);
        setAudioLevel(0);
        
        console.log('Enregistrement terminé:', filePath);
        onRecordingComplete?.(filePath);
        
        // Afficher les informations du fichier
        showRecordingInfo(filePath);
      }
    } catch (error) {
      const errorMsg = `Erreur d'enregistrement: ${error}`;
      console.error(errorMsg);
      onError?.(errorMsg);
      Alert.alert('Erreur', errorMsg);
    }
  }, [isInitialized, isRecording, currentConfig, onRecordingComplete, onError]);

  const handlePauseResume = useCallback(() => {
    try {
      if (isPaused) {
        const resumed = NativeAudioRecorder.resumeRecording();
        if (resumed) {
          setIsPaused(false);
        }
      } else {
        const paused = NativeAudioRecorder.pauseRecording();
        if (paused) {
          setIsPaused(true);
        }
      }
    } catch (error) {
      console.error('Erreur pause/resume:', error);
    }
  }, [isPaused]);

  const changeQuality = (newPreset: keyof typeof AudioPresets) => {
    if (isRecording) {
      Alert.alert('Impossible', 'Arrêtez l\'enregistrement avant de changer la qualité');
      return;
    }

    const newConfig = AudioPresets[newPreset];
    setCurrentConfig(newConfig);
    
    // Reconfigurer l'enregistreur
    try {
      const configured = NativeAudioRecorder.configure(newConfig);
      if (!configured) {
        Alert.alert('Erreur', 'Impossible de changer la configuration');
      }
    } catch (error) {
      console.error('Erreur de reconfiguration:', error);
    }
  };

  const showRecordingInfo = async (filePath: string) => {
    try {
      const fileInfo = await RNFS.stat(filePath);
      const sizeMB = (fileInfo.size / (1024 * 1024)).toFixed(1);
      const duration = recordingTime.toFixed(1);
      
      Alert.alert(
        'Enregistrement terminé',
        `Fichier: ${filePath.split('/').pop()}\n` +
        `Durée: ${duration}s\n` +
        `Taille: ${sizeMB} MB\n` +
        `Qualité: ${currentConfig.sampleRate}Hz/${currentConfig.bitDepth}bit`
      );
    } catch (error) {
      console.error('Erreur info fichier:', error);
    }
  };

  // Styles animés
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const levelBarStyle = useAnimatedStyle(() => ({
    width: `${levelBarWidth.value}%`,
  }));

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = (): string => {
    if (!isInitialized) return 'Initialisation...';
    if (isRecording && isPaused) return 'EN PAUSE';
    if (isRecording) return 'ENREGISTREMENT';
    return 'PRÊT';
  };

  const getStatusColor = (): string => {
    if (!isInitialized) return '#888';
    if (isRecording && isPaused) return '#ff9500';
    if (isRecording) return '#ff3b30';
    return '#34c759';
  };

  if (!configInfo) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* En-tête avec statut */}
      <View style={styles.header}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        <Text style={styles.timeText}>{formatTime(recordingTime)}</Text>
      </View>

      {/* Informations de configuration */}
      <View style={styles.configInfo}>
        <Text style={styles.configTitle}>Configuration actuelle</Text>
        <Text style={styles.configDetail}>
          {currentConfig.sampleRate / 1000}kHz • {currentConfig.bitDepth}bit • {configInfo.channelLayout}
        </Text>
        <Text style={styles.configDetail}>
          Qualité: {configInfo.qualityLevel} • {configInfo.fileSizePerMinute}/min
        </Text>
        <Text style={styles.configDetail}>
          Bande passante: {configInfo.bandwidth}
        </Text>
      </View>

      {/* Visualiseur de niveau audio */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelLabel}>Niveau audio</Text>
        <View style={styles.levelBarBackground}>
          <Animated.View style={[styles.levelBar, levelBarStyle]} />
        </View>
        <Text style={styles.levelValue}>{(audioLevel * 100).toFixed(0)}%</Text>
      </View>

      {/* Boutons de contrôle principaux */}
      <View style={styles.controlsContainer}>
        <Animated.View style={pulseStyle}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              { backgroundColor: isRecording ? '#ff3b30' : '#34c759' }
            ]}
            onPress={handleStartStop}
            disabled={!isInitialized}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? '⏹ STOP' : '⏺ REC'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {isRecording && (
          <TouchableOpacity
            style={[styles.pauseButton, { backgroundColor: isPaused ? '#34c759' : '#ff9500' }]}
            onPress={handlePauseResume}
          >
            <Text style={styles.pauseButtonText}>
              {isPaused ? '▶️ REPRENDRE' : '⏸ PAUSE'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sélecteur de qualité */}
      <View style={styles.qualityContainer}>
        <Text style={styles.qualityTitle}>Qualité d'enregistrement</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.keys(AudioPresets).map((presetKey) => {
            const presetConfig = AudioPresets[presetKey as keyof typeof AudioPresets];
            const isSelected = JSON.stringify(currentConfig) === JSON.stringify(presetConfig);
            
            return (
              <TouchableOpacity
                key={presetKey}
                style={[styles.qualityButton, isSelected && styles.qualityButtonSelected]}
                onPress={() => changeQuality(presetKey as keyof typeof AudioPresets)}
                disabled={isRecording}
              >
                <Text style={[styles.qualityButtonText, isSelected && styles.qualityButtonTextSelected]}>
                  {presetKey}
                </Text>
                <Text style={styles.qualityButtonDetail}>
                  {presetConfig.sampleRate / 1000}kHz/{presetConfig.bitDepth}bit
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '200',
    color: '#fff',
    fontFamily: 'Menlo, monospace',
  },
  configInfo: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  configTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  configDetail: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  levelContainer: {
    marginBottom: 32,
  },
  levelLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  levelBarBackground: {
    height: 8,
    backgroundColor: '#2c2c2e',
    borderRadius: 4,
    marginBottom: 8,
  },
  levelBar: {
    height: '100%',
    backgroundColor: '#34c759',
    borderRadius: 4,
  },
  levelValue: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qualityContainer: {
    marginBottom: 20,
  },
  qualityTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  qualityButton: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  qualityButtonSelected: {
    backgroundColor: '#007aff',
  },
  qualityButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  qualityButtonTextSelected: {
    color: '#fff',
  },
  qualityButtonDetail: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
});

export default AudioRecorderView;