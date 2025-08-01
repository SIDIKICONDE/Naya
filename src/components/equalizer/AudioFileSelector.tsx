/**
 * AudioFileSelector.tsx
 * Composant pour sélectionner et afficher les informations du fichier audio
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { AudioFileInfo } from './types';

interface AudioFileSelectorProps {
  currentFile?: AudioFileInfo;
  onFileSelected: (filePath: string) => void;
  loading?: boolean;
}

export const AudioFileSelector: React.FC<AudioFileSelectorProps> = ({
  currentFile,
  onFileSelected,
  loading = false,
}) => {
  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.audio,
          'audio/wav',
          'audio/mp3',
          'audio/aac',
          'audio/flac',
          'audio/ogg',
        ],
      });

      if (result.uri) {
        onFileSelected(result.uri);
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert(
          'Erreur',
          'Impossible de sélectionner le fichier audio',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fichier Audio</Text>
      
      {/* Bouton de sélection */}
      <TouchableOpacity
        style={[styles.selectButton, loading && styles.selectButtonDisabled]}
        onPress={handleSelectFile}
        disabled={loading}
      >
        <Text style={[styles.selectButtonText, loading && styles.selectButtonTextDisabled]}>
          {loading ? 'Chargement...' : 'Sélectionner un fichier'}
        </Text>
      </TouchableOpacity>

      {/* Informations du fichier */}
      {currentFile && (
        <View style={styles.fileInfo}>
          <View style={styles.fileHeader}>
            <Text style={styles.fileName} numberOfLines={1}>
              {currentFile.name}
            </Text>
            <View style={styles.fileStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Chargé</Text>
            </View>
          </View>

          <View style={styles.fileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Durée:</Text>
              <Text style={styles.detailValue}>
                {formatDuration(currentFile.duration)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Échantillonnage:</Text>
              <Text style={styles.detailValue}>
                {currentFile.sampleRate.toLocaleString()} Hz
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Canaux:</Text>
              <Text style={styles.detailValue}>
                {currentFile.channels} {currentFile.channels === 1 ? 'Mono' : 'Stéréo'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Taille:</Text>
              <Text style={styles.detailValue}>
                {formatFileSize(currentFile.size)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  selectButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectButtonTextDisabled: {
    color: '#757575',
  },
  fileInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  fileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  fileDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});