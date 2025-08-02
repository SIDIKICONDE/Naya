import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

// Import du TurboModule FFmpeg
import NativeFFmpegModule from '../../../specs/NativeFFmpegModule';

interface TestResult {
  name: string;
  success: boolean;
  data?: string;
  error?: string;
}

export const FFmpegTestComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = useCallback((result: TestResult) => {
    setResults(prev => [...prev, result]);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const testFFmpegVersion = useCallback(async () => {
    try {
      const version = await NativeFFmpegModule.getFFmpegVersion();
      addResult({
        name: 'Version FFmpeg',
        success: true,
        data: version,
      });
    } catch (error) {
      addResult({
        name: 'Version FFmpeg',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }, [addResult]);

  const testFFmpegInitialization = useCallback(async () => {
    try {
      const initialized = await NativeFFmpegModule.initializeFFmpeg();
      addResult({
        name: 'Initialisation FFmpeg',
        success: initialized,
        data: initialized ? 'FFmpeg initialisé avec succès' : 'Échec de l\'initialisation',
      });
    } catch (error) {
      addResult({
        name: 'Initialisation FFmpeg',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }, [addResult]);

  const testSupportedFormats = useCallback(async () => {
    try {
      const formats = await NativeFFmpegModule.getSupportedFormats();
      addResult({
        name: 'Formats supportés',
        success: true,
        data: formats,
      });
    } catch (error) {
      addResult({
        name: 'Formats supportés',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }, [addResult]);

  const testAudioEncoding = useCallback(async () => {
    try {
      const success = await NativeFFmpegModule.testAudioEncoding();
      addResult({
        name: 'Test encodage audio',
        success,
        data: success ? 'Tests d\'encodage AAC et MP3 réussis' : 'Échec des tests d\'encodage',
      });
    } catch (error) {
      addResult({
        name: 'Test encodage audio',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }, [addResult]);

  const testAudioInfo = useCallback(async () => {
    try {
      // Test avec un chemin fictif pour démonstration
      const info = await NativeFFmpegModule.getAudioInfo('/test/audio.mp3');
      addResult({
        name: 'Informations audio',
        success: true,
        data: info,
      });
    } catch (error) {
      addResult({
        name: 'Informations audio',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }, [addResult]);

  const testAudioConversion = useCallback(async () => {
    try {
      // Test avec des chemins fictifs pour démonstration
      const success = await NativeFFmpegModule.convertAudioFormat(
        '/input/test.wav',
        '/output/test.aac',
        'aac'
      );
      addResult({
        name: 'Conversion audio',
        success,
        data: success ? 'Test de conversion WAV vers AAC réussi' : 'Échec du test de conversion',
      });
    } catch (error) {
      addResult({
        name: 'Conversion audio',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }, [addResult]);

  const runAllTests = useCallback(async () => {
    setLoading(true);
    clearResults();
    
    // Attendre un peu entre chaque test pour une meilleure expérience utilisateur
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      await testFFmpegVersion();
      await delay(500);
      
      await testFFmpegInitialization();
      await delay(500);
      
      await testSupportedFormats();
      await delay(500);
      
      await testAudioEncoding();
      await delay(500);
      
      await testAudioInfo();
      await delay(500);
      
      await testAudioConversion();
      
      Alert.alert('Tests terminés', 'Tous les tests FFmpeg ont été exécutés. Consultez les résultats ci-dessous.');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite pendant les tests');
    } finally {
      setLoading(false);
    }
  }, [
    testFFmpegVersion,
    testFFmpegInitialization,
    testSupportedFormats,
    testAudioEncoding,
    testAudioInfo,
    testAudioConversion,
    clearResults,
  ]);

  const renderResult = (result: TestResult, index: number) => (
    <View key={index} style={[styles.resultContainer, result.success ? styles.success : styles.error]}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultName}>{result.name}</Text>
        <Text style={[styles.resultStatus, result.success ? styles.successText : styles.errorText]}>
          {result.success ? '✓ Succès' : '✗ Échec'}
        </Text>
      </View>
      
      {result.data && (
        <ScrollView style={styles.resultData} nestedScrollEnabled>
          <Text style={styles.resultDataText}>{result.data}</Text>
        </ScrollView>
      )}
      
      {result.error && (
        <Text style={styles.errorText}>Erreur: {result.error}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tests FFmpeg TurboModule</Text>
      <Text style={styles.subtitle}>
        Test de l'intégration FFmpeg dans React Native Naya
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runAllTests}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Exécuter tous les tests</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Effacer résultats</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Résultats des tests:</Text>
        {results.length === 0 ? (
          <Text style={styles.noResults}>Aucun test exécuté</Text>
        ) : (
          results.map(renderResult)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 32,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  success: {
    borderLeftColor: '#34C759',
  },
  error: {
    borderLeftColor: '#FF3B30',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  successText: {
    color: '#34C759',
  },
  errorText: {
    color: '#FF3B30',
  },
  resultData: {
    maxHeight: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    padding: 8,
  },
  resultDataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 16,
  },
});

export default FFmpegTestComponent;