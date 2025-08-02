/**
 * CompressorView refactorisé - Architecture modulaire
 * Interface professionnelle pour le compresseur audio
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useCompressorState } from './hooks/useCompressorState';
import {
  CompressorHeader,
  CompressorControls,
  CompressionGraph,
  CompressorPresets,
} from './components';
import type { CompressorViewProps } from './types';
import { useModuleColors, useAudioTheme } from '../../../../theme/hooks/useAudioTheme';
import { createModuleStyles } from '../../../../theme/utils/audioStyles';
import { useTranslation } from '../../../../i18n';

export const CompressorView: React.FC<CompressorViewProps> = ({ moduleId }) => {
  const {
    state,
    gainReductionAnim,
    updateParameter,
    applyPreset,
    toggleActive,
    toggleAdvanced,
    toggleCompact,
    togglePresets,
  } = useCompressorState(moduleId);

  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('compressor');
  const themedStyles = createModuleStyles(audioTheme.colors, moduleColors.primary);
  const { t } = useTranslation();
  
  // Animation pour la section avancée
  const advancedOpacity = React.useRef(new Animated.Value(0)).current;
  
  // Effet d'animation pour la section avancée
  React.useEffect(() => {
    Animated.timing(advancedOpacity, {
      toValue: state.showAdvanced ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [state.showAdvanced, advancedOpacity]);

  // Styles thématiques spécifiques au CompressorView
  const localStyles = StyleSheet.create({
    compactLayout: {
      flexDirection: 'row',
      gap: audioTheme.spacing.sm,
      marginBottom: audioTheme.spacing.md,
      alignItems: 'flex-start',
    },
    compactGraph: {
      flex: 0.3,
      minWidth: 100,
      maxWidth: 120,
    },
    compactControls: {
      flex: 0.7,
      paddingLeft: audioTheme.spacing.sm,
    },
    bottomSection: {
      gap: audioTheme.spacing.sm,
    },
    modeButtons: {
      flexDirection: 'row',
      gap: audioTheme.spacing.xs,
    },
    modeButton: {
      backgroundColor: audioTheme.colors.buttonInactive,
      borderRadius: 4,
      paddingVertical: 4,
      paddingHorizontal: 6,
      flex: 1,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
      shadowColor: moduleColors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    modeButtonActive: {
      backgroundColor: moduleColors.primary,
      borderColor: moduleColors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    modeButtonText: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.spectrumSecondary,
      fontSize: 9,
    },
    modeButtonTextActive: {
      color: '#fff',
    },
    advancedToggle: {
      backgroundColor: audioTheme.colors.buttonInactive,
      borderRadius: 4,
      paddingVertical: 4,
      paddingHorizontal: 6,
      flex: 1,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    advancedToggleText: {
      color: moduleColors.primary,
      fontSize: 9,
      fontWeight: '600' as const,
    },
    advancedControls: {
      backgroundColor: audioTheme.colors.knobBackground,
      borderRadius: 8,
      padding: audioTheme.spacing.md,
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    advancedTitle: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
      marginBottom: audioTheme.spacing.sm,
    },
    advancedDescription: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.spectrumSecondary,
      lineHeight: 16,
    },
  });

  return (
    <View style={themedStyles.container}>
      {/* Header avec contrôles de base */}
      <CompressorHeader
        isActive={state.isActive}
        gainReduction={state.gainReduction}
        gainReductionAnim={gainReductionAnim}
        threshold={state.threshold}
        onToggleActive={toggleActive}
        showPresets={state.showPresets}
        onTogglePresets={togglePresets}
      />

      {/* Layout conditionnel selon le mode */}
      {state.compactMode ? (
        // Mode compact : graphique et contrôles côte à côte
        <View style={localStyles.compactLayout}>
          <View style={localStyles.compactGraph}>
            <CompressionGraph
              threshold={state.threshold}
              ratio={state.ratio}
              knee={state.knee}
              compact={true}
            />
          </View>
          <View style={localStyles.compactControls}>
            <CompressorControls
              state={state}
              onUpdateParameter={updateParameter}
              compact={true}
            />
          </View>
        </View>
      ) : (
        // Mode normal : layout vertical
        <>
          <CompressionGraph
            threshold={state.threshold}
            ratio={state.ratio}
            knee={state.knee}
            compact={false}
          />
          <CompressorControls
            state={state}
            onUpdateParameter={updateParameter}
          />
        </>
      )}

      {/* Section avancée */}
      <View style={localStyles.bottomSection}>
        {/* Boutons de mode */}
        <View style={localStyles.modeButtons}>
          <TouchableOpacity
            style={[localStyles.modeButton, state.compactMode && localStyles.modeButtonActive]}
            onPress={toggleCompact}
          >
            <Text style={[localStyles.modeButtonText, state.compactMode && localStyles.modeButtonTextActive]}>
              {state.compactMode ? t('audio:modules.compressor.modes.compactActive') : t('audio:modules.compressor.modes.compact')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[localStyles.advancedToggle, state.showAdvanced && localStyles.modeButtonActive]}
            onPress={toggleAdvanced}
          >
            <Text style={[localStyles.advancedToggleText, state.showAdvanced && localStyles.modeButtonTextActive]}>
              {state.showAdvanced ? t('audio:modules.compressor.modes.advancedExpanded') : t('audio:modules.compressor.modes.advancedCollapsed')}
            </Text>
          </TouchableOpacity>
        </View>

        {state.showAdvanced && (
          <Animated.View 
            style={[
              localStyles.advancedControls,
              { opacity: advancedOpacity }
            ]}
          >
            <Text style={localStyles.advancedTitle}>{t('audio:modules.compressor.advanced.title')}</Text>
            <Text style={localStyles.advancedDescription}>
              {t('audio:modules.compressor.advanced.description')}
            </Text>
          </Animated.View>
        )}

        {/* Presets intelligents - Modal */}
        <CompressorPresets 
          visible={state.showPresets}
          onApplyPreset={applyPreset}
          onClose={togglePresets}
        />
      </View>
    </View>
  );
};