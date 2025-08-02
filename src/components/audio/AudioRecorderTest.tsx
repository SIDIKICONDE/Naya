import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import NativeAudioRecorder from '../../specs/NativeAudioRecorder';
import { AudioPresets } from '../../constants/AudioPresets';

const AudioRecorderTest: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStats, setRecordingStats] = useState<any>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [supportedFormats, setSupportedFormats] = useState<string[]>([]);

  useEffect(() => {
    initializeRecorder();
    loadSupportedFormats();
  }, []);

  const initializeRecorder = async () => {
    try {
      // Initialiser avec un preset Studio haute qualité
      const success = NativeAudioRecorder.initialize(AudioPresets.StudioMax);
      setIsInitialized(success);
      
      if (success) {
        Alert.alert('Succès', 'Moteur audio C++ initialisé avec succès !');
      } else {
        Alert.alert('Erreur', 'Échec de l\'initialisation du moteur audio');
      }
    } catch (error) {
      console.error('Erreur d\'initialisation:', error);
      Alert.alert('Erreur', `Initialisation échouée: ${error}`);
    }
  };

  const loadSupportedFormats = async () => {
    try {
      const formats = NativeAudioRecorder.getSupportedFormats();
      setSupportedFormats(formats);
    } catch (error) {
      console.error('Erreur formats:', error);
    }
  };

  const startRecording = async () => {
    try {
      const outputPath = `/tmp/test_recording_${Date.now()}.wav`;
      const success = NativeAudioRecorder.startRecording(outputPath);
      
      if (success) {
        setIsRecording(true);
        startMonitoring();
        Alert.alert('Enregistrement', 'Enregistrement démarré !');
      } else {
        Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur démarrage:', error);
      Alert.alert('Erreur', `Démarrage échoué: ${error}`);
    }
  };

  const stopRecording = async () => {
    try {
      const filePath = NativeAudioRecorder.stopRecording();
      setIsRecording(false);
      stopMonitoring();
      Alert.alert('Enregistrement terminé', `Fichier sauvé: ${filePath}`);
    } catch (error) {
      console.error('Erreur arrêt:', error);
      Alert.alert('Erreur', `Arrêt échoué: ${error}`);
    }
  };

  const startMonitoring = () => {
    const interval = setInterval(() => {
      try {
        const stats = NativeAudioRecorder.getRecordingStats();
        const level = NativeAudioRecorder.getAudioLevel();
        
        setRecordingStats(stats);
        setAudioLevel(level);
      } catch (error) {
        console.error('Erreur monitoring:', error);
      }
    }, 100); // Mise à jour 10x par seconde

    // Stocker l'interval pour le nettoyer
    (global as any).audioMonitorInterval = interval;
  };

  const stopMonitoring = () => {
    if ((global as any).audioMonitorInterval) {
      clearInterval((global as any).audioMonitorInterval);
      (global as any).audioMonitorInterval = null;
    }
  };

  const testConfig = async () => {
    try {
      // Tester une configuration ultra haute qualité
      const ultraConfig = {
        sampleRate: 384000,  // 384 kHz - qualité DXD
        channels: 2,         // Stéréo
        bitDepth: 32,        // 32-bit float
        bufferSize: 16384    // Buffer large
      };

      const success = NativeAudioRecorder.configure(ultraConfig);
      Alert.alert(
        'Test Configuration', 
        success ? 'Configuration 384kHz/32bit réussie !' : 'Configuration échouée'
      );
    } catch (error) {
      Alert.alert('Erreur Config', `${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎤 Test Moteur Audio C++</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>État</Text>
        <Text style={styles.status}>
          Initialisé: {isInitialized ? '✅' : '❌'}
        </Text>
        <Text style={styles.status}>
          Enregistrement: {isRecording ? '🔴 ACTIF' : '⚪ ARRÊTÉ'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contrôles</Text>
        <TouchableOpacity 
          style={[styles.button, !isInitialized && styles.buttonDisabled]}
          onPress={startRecording}
          disabled={!isInitialized || isRecording}
        >
          <Text style={styles.buttonText}>🎙️ Démarrer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.stopButton]}
          onPress={stopRecording}
          disabled={!isRecording}
        >
          <Text style={styles.buttonText}>⏹️ Arrêter</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={testConfig}
        >
          <Text style={styles.buttonText}>⚙️ Test 384kHz</Text>
        </TouchableOpacity>
      </View>

      {recordingStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques Temps Réel</Text>
          <Text style={styles.stat}>
            Durée: {recordingStats.duration.toFixed(1)}s
          </Text>
          <Text style={styles.stat}>
            Taille: {(recordingStats.size / 1024 / 1024).toFixed(2)} MB
          </Text>
          <Text style={styles.stat}>
            Buffer: {recordingStats.bufferLevel.toFixed(1)}%
          </Text>
          <Text style={styles.stat}>
            Niveau Audio: {(audioLevel * 100).toFixed(1)}%
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Formats Supportés</Text>
        {supportedFormats.map((format, index) => (
          <Text key={index} style={styles.format}>• {format}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration Actuelle</Text>
        <Text style={styles.config}>Sample Rate: 192kHz (Studio Max)</Text>
        <Text style={styles.config}>Channels: 2 (Stéréo)</Text>
        <Text style={styles.config}>Bit Depth: 32-bit float</Text>
        <Text style={styles.config}>Buffer: 8192 échantillons</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  status: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stat: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  format: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  config: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 3,
  },
});

export default AudioRecorderTest;