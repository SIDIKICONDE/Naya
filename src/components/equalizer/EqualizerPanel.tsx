/**
 * EqualizerPanel.tsx
 * Panneau principal contenant toutes les bandes de l'égaliseur
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { EqualizerBand } from './EqualizerBand';
import { EqualizerBand as BandType } from './types';
import { useAudioTheme } from '../../theme/hooks/useAudioTheme';
import { useTranslation } from '../../i18n';

interface EqualizerPanelProps {
  bands: BandType[];
  enabled: boolean;
  onBandChange: (bandIndex: number, gain: number) => void;
  onToggleEnabled: (enabled: boolean) => void;
}

export const EqualizerPanel: React.FC<EqualizerPanelProps> = ({
  bands,
  enabled,
  onBandChange,
  onToggleEnabled,
}) => {
  const audioTheme = useAudioTheme();
  const themedStyles = createStyles(audioTheme);
  const { t } = useTranslation();
  return (
    <View style={themedStyles.container}>
      {/* Header avec switch principal */}
      <View style={themedStyles.header}>
        <Text style={themedStyles.title}>{t('audio:equalizer.title')}</Text>
        <View style={themedStyles.switchContainer}>
          <Text style={[themedStyles.switchLabel, { opacity: enabled ? 1 : 0.5 }]}>
            {enabled ? t('audio:equalizer.enabled') : t('audio:equalizer.disabled')}
          </Text>
          <Switch
            value={enabled}
            onValueChange={onToggleEnabled}
            trackColor={{ 
              false: audioTheme.colors.moduleBackground, 
              true: audioTheme.colors.rmsNormal 
            }}
            thumbColor={enabled ? audioTheme.colors.rmsNormal : audioTheme.colors.text}
          />
        </View>
      </View>

      {/* Grille des bandes */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={themedStyles.bandsContainer}
        contentContainerStyle={themedStyles.bandsContent}
      >
        {bands.map((band, index) => (
          <EqualizerBand
            key={band.id}
            band={band}
            onGainChange={(gain) => onBandChange(index, gain)}
            disabled={!enabled}
          />
        ))}
      </ScrollView>

      {/* Indicateur de courbe EQ */}
      <View style={themedStyles.curveIndicator}>
        <Text style={themedStyles.curveText}>
          {t('audio:equalizer.frequencyResponse')}
        </Text>
        <View style={themedStyles.curveLine} />
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: audioTheme.spacing.lg,
  },
  title: {
    fontSize: audioTheme.typography.moduleTitle.fontSize,
    fontWeight: audioTheme.typography.moduleTitle.fontWeight,
    color: audioTheme.colors.text,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: audioTheme.spacing.sm,
  },
  switchLabel: {
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    color: audioTheme.colors.text,
    fontWeight: audioTheme.typography.parameterLabel.fontWeight,
  },
  bandsContainer: {
    marginBottom: audioTheme.spacing.md,
  },
  bandsContent: {
    paddingHorizontal: audioTheme.spacing.sm,
  },
  curveIndicator: {
    alignItems: 'center',
    paddingTop: audioTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: audioTheme.colors.moduleBackground,
  },
  curveText: {
    fontSize: audioTheme.typography.parameterLabel.fontSize,
    color: audioTheme.colors.text,
    opacity: 0.7,
    marginBottom: audioTheme.spacing.sm,
  },
  curveLine: {
    height: 2,
    backgroundColor: audioTheme.colors.rmsNormal,
    width: '80%',
    borderRadius: 1,
  },
});