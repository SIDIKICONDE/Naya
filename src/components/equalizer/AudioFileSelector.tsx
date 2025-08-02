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
import { useAudioTheme } from '../../theme/hooks/useAudioTheme';
import { useTranslation } from '../../i18n';

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
  const audioTheme = useAudioTheme();
  const themedStyles = createStyles(audioTheme);
  const { t } = useTranslation();
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
        presentationStyle: 'fullScreen',
      });

      if (result.uri) {
        onFileSelected(result.uri);
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert(
          t('common:error'),
          t('audio:equalizer.errors.fileSelect'),
          [{ text: t('common:ok') }]
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
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>{t('audio:equalizer.audioFile')}</Text>
      
      {/* Bouton de sélection */}
      <TouchableOpacity
        style={[themedStyles.selectButton, loading && themedStyles.selectButtonDisabled]}
        onPress={handleSelectFile}
        disabled={loading}
      >
        <Text style={[themedStyles.selectButtonText, loading && themedStyles.selectButtonTextDisabled]}>
          {loading ? t('audio:equalizer.loading') : t('audio:equalizer.selectFile')}
        </Text>
      </TouchableOpacity>

      {/* Informations du fichier */}
      {currentFile && (
        <View style={themedStyles.fileInfo}>
          <View style={themedStyles.fileHeader}>
            <Text style={themedStyles.fileName} numberOfLines={1}>
              {currentFile.name}
            </Text>
            <View style={themedStyles.fileStatus}>
              <View style={themedStyles.statusDot} />
              <Text style={themedStyles.statusText}>{t('audio:equalizer.fileLoaded')}</Text>
            </View>
          </View>

          <View style={themedStyles.fileDetails}>
            <View style={themedStyles.detailRow}>
              <Text style={themedStyles.detailLabel}>{t('audio:equalizer.duration')}:</Text>
              <Text style={themedStyles.detailValue}>
                {formatDuration(currentFile.duration)}
              </Text>
            </View>

            <View style={themedStyles.detailRow}>
              <Text style={themedStyles.detailLabel}>{t('audio:equalizer.sampleRate')}:</Text>
              <Text style={themedStyles.detailValue}>
                {currentFile.sampleRate.toLocaleString()} {t('audio:units.hz')}
              </Text>
            </View>

            <View style={themedStyles.detailRow}>
              <Text style={themedStyles.detailLabel}>{t('audio:equalizer.channels.title')}:</Text>
              <Text style={themedStyles.detailValue}>
                {currentFile.channels} {currentFile.channels === 1 
                  ? t('audio:equalizer.channels.mono') 
                  : t('audio:equalizer.channels.stereo')}
              </Text>
            </View>

            <View style={themedStyles.detailRow}>
              <Text style={themedStyles.detailLabel}>{t('audio:equalizer.fileSize')}:</Text>
              <Text style={themedStyles.detailValue}>
                {formatFileSize(currentFile.size)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const createStyles = (audioTheme: ReturnType<typeof useAudioTheme>) => StyleSheet.create({
  container: {
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.md,
    padding: audioTheme.spacing.md,
    marginHorizontal: audioTheme.spacing.md,
    marginVertical: audioTheme.spacing.sm,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: audioTheme.typography.moduleTitle.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
    color: audioTheme.colors.text,
    marginBottom: audioTheme.spacing.md,
  },
  selectButton: {
    backgroundColor: audioTheme.colors.moduleBackground,
    paddingVertical: audioTheme.spacing.sm,
    paddingHorizontal: audioTheme.spacing.lg,
    borderRadius: audioTheme.spacing.sm,
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: audioTheme.colors.moduleBackground,
    opacity: 0.5,
  },
  selectButtonText: {
    color: audioTheme.colors.text,
    fontSize: audioTheme.typography.moduleTitle.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
  },
  selectButtonTextDisabled: {
    color: audioTheme.colors.text,
    opacity: 0.5,
  },
  fileInfo: {
    marginTop: audioTheme.spacing.md,
    padding: audioTheme.spacing.md,
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.sm,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: audioTheme.spacing.sm,
  },
  fileName: {
    fontSize: audioTheme.typography.moduleTitle.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
    color: audioTheme.colors.text,
    flex: 1,
    marginRight: audioTheme.spacing.sm,
  },
  fileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: audioTheme.spacing.sm,
    height: audioTheme.spacing.sm,
    borderRadius: audioTheme.spacing.xs,
    backgroundColor: audioTheme.colors.rmsNormal,
    marginRight: audioTheme.spacing.xs,
  },
  statusText: {
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    color: audioTheme.colors.rmsNormal,
    fontWeight: audioTheme.typography.parameterLabel.fontWeight,
  },
  fileDetails: {
    gap: audioTheme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    color: audioTheme.colors.text,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
    color: audioTheme.colors.text,
  },
});