/**
 * Test avancé de l'application avec le module natif NativeModuleEQ
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import NativeModuleEQ from './specs/NativeModuleEQ';

const { width } = Dimensions.get('window');

function App() {
  const [inputText, setInputText] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [results, setResults] = useState<{ [key: string]: any }>({});

  const testFunction = async (
    functionName: string,
    testFunction: () => Promise<string | number | boolean>,
  ) => {
    try {
      const result = await testFunction();
      setResults(prev => ({ ...prev, [functionName]: result }));
    } catch (error) {
      console.error(`Erreur dans ${functionName}:`, error);
      Alert.alert('Erreur', `Impossible d'exécuter ${functionName}`);
    }
  };

  const handleReverseString = () => {
    if (!inputText.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer du texte');
      return;
    }
    testFunction('reverseString', () => NativeModuleEQ.reverseString(inputText));
  };

  const handleCountCharacters = () => {
    if (!inputText.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer du texte');
      return;
    }
    testFunction('countCharacters', () => NativeModuleEQ.countCharacters(inputText));
  };

  const handleToUpperCase = () => {
    if (!inputText.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer du texte');
      return;
    }
    testFunction('toUpperCase', () => NativeModuleEQ.toUpperCase(inputText));
  };

  const handleToLowerCase = () => {
    if (!inputText.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer du texte');
      return;
    }
    testFunction('toLowerCase', () => NativeModuleEQ.toLowerCase(inputText));
  };

  const handleRemoveSpaces = () => {
    if (!inputText.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer du texte');
      return;
    }
    testFunction('removeSpaces', () => NativeModuleEQ.removeSpaces(inputText));
  };

  const handleIsPalindrome = () => {
    if (!inputText.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer du texte');
      return;
    }
    testFunction('isPalindrome', () => NativeModuleEQ.isPalindrome(inputText));
  };

  const handleGetRandomNumber = () => {
    testFunction('getRandomNumber', () => NativeModuleEQ.getRandomNumber(1, 100));
  };

  const handleCalculateFactorial = () => {
    const num = parseInt(numberInput);
    if (isNaN(num) || num < 0 || num > 20) {
      Alert.alert('Erreur', 'Veuillez entrer un nombre entre 0 et 20');
      return;
    }
    testFunction('calculateFactorial', () => NativeModuleEQ.calculateFactorial(num));
  };

  const clearResults = () => {
    setResults({});
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>🧪 Test Module Natif NativeModuleEQ</Text>
          <Text style={styles.subtitle}>Découvrez toutes les fonctionnalités !</Text>

          {/* Zone de saisie texte */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>📝 Texte à traiter :</Text>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Entrez du texte ici..."
              multiline
            />
          </View>

          {/* Zone de saisie nombre */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>🔢 Nombre pour factorielle :</Text>
            <TextInput
              style={styles.numberInput}
              value={numberInput}
              onChangeText={setNumberInput}
              placeholder="0-20"
              keyboardType="numeric"
            />
          </View>

          {/* Boutons de test */}
          <View style={styles.buttonGrid}>
            <TouchableOpacity style={styles.button} onPress={handleReverseString}>
              <Text style={styles.buttonText}>🔄 Inverser</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleCountCharacters}>
              <Text style={styles.buttonText}>📊 Compter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleToUpperCase}>
              <Text style={styles.buttonText}>⬆️ MAJUSCULES</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleToLowerCase}>
              <Text style={styles.buttonText}>⬇️ minuscules</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleRemoveSpaces}>
              <Text style={styles.buttonText}>🚫 Espaces</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleIsPalindrome}>
              <Text style={styles.buttonText}>🔄 Palindrome</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleGetRandomNumber}>
              <Text style={styles.buttonText}>🎲 Aléatoire</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleCalculateFactorial}>
              <Text style={styles.buttonText}>🧮 Factorielle</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton de nettoyage */}
          <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
            <Text style={styles.clearButtonText}>🗑️ Effacer résultats</Text>
          </TouchableOpacity>

          {/* Affichage des résultats */}
          {Object.keys(results).length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>📋 Résultats :</Text>
              {Object.entries(results).map(([key, value]) => (
                <View key={key} style={styles.resultItem}>
                  <Text style={styles.resultLabel}>{key} :</Text>
                  <Text style={styles.resultValue}>
                    {typeof value === 'boolean' ? (value ? '✅ Oui' : '❌ Non') : String(value)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  numberInput: {
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: (width - 50) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#27ae60',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#27ae60',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export default App;
