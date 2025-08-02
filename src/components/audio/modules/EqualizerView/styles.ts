/**
 * Styles pour l'EqualizerView
 * Support thématique complet
 */

import { StyleSheet } from 'react-native';
import { useAudioTheme, useModuleColors } from '../../../../theme/hooks/useAudioTheme';
import { createModuleStyles } from '../../../../theme/utils/audioStyles';

export const createEqualizerStyles = () => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('equalizer');
  const themedStyles = createModuleStyles(audioTheme.colors, moduleColors.primary);

  return StyleSheet.create({
    ...themedStyles,
    container: {
      ...themedStyles.container,
      paddingHorizontal: audioTheme.spacing.md,
      paddingVertical: audioTheme.spacing.sm,
      paddingTop: audioTheme.spacing.xs,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: audioTheme.spacing.xs,
      paddingVertical: audioTheme.spacing.xs,
    },
    title: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
    },
    headerControls: {
      flexDirection: 'row',
      gap: audioTheme.spacing.xs,
    },
    bypassButton: {
      paddingHorizontal: audioTheme.spacing.sm,
      paddingVertical: audioTheme.spacing.xs,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: audioTheme.colors.buttonInactive,
      backgroundColor: 'transparent',
    },
    bypassActive: {
      backgroundColor: moduleColors.primary,
      borderColor: moduleColors.primary,
    },
    bypassText: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.buttonInactive,
    },
    bypassTextActive: {
      color: audioTheme.colors.spectrumPrimary,
    },
    resetButton: {
      paddingHorizontal: audioTheme.spacing.md,
      paddingVertical: audioTheme.spacing.sm,
      borderRadius: 4,
      backgroundColor: audioTheme.colors.buttonInactive,
    },
    resetText: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.spectrumPrimary,
    },
    responseGraph: {
      alignItems: 'center',
      marginBottom: audioTheme.spacing.lg,
    },
    graphSvg: {
      borderRadius: 8,
    },
    frequencyLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 340,
      marginTop: audioTheme.spacing.xs,
    },
    freqLabel: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.buttonInactive,
    },
    bandSelector: {
      marginBottom: audioTheme.spacing.xs,
      alignItems: 'center',
    },
    bandButton: {
      paddingHorizontal: audioTheme.spacing.sm,
      paddingVertical: audioTheme.spacing.xs,
      marginRight: audioTheme.spacing.xs,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: audioTheme.colors.buttonInactive,
      backgroundColor: audioTheme.colors.knobBackground,
      alignItems: 'center',
      minWidth: 45,
    },
    bandButtonActive: {
      borderColor: moduleColors.primary,
      backgroundColor: moduleColors.primary,
    },
    bandButtonDisabled: {
      borderColor: audioTheme.colors.buttonInactive,
      backgroundColor: audioTheme.colors.knobBackground,
    },
    bandButtonText: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.spectrumSecondary,
    },
    bandButtonTextActive: {
      color: audioTheme.colors.spectrumPrimary,
    },
    bandButtonTextDisabled: {
      color: audioTheme.colors.buttonInactive,
    },
    bandGainText: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.buttonInactive,
      marginTop: 0,
      fontSize: 7,
    },
    bandControls: {
      backgroundColor: audioTheme.colors.knobBackground,
      padding: audioTheme.spacing.sm,
      borderRadius: 3,
      marginBottom: audioTheme.spacing.xs,
    },
    controlsTitle: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
      marginBottom: audioTheme.spacing.xs,
      textAlign: 'center',
    },
    controlGroup: {
      marginBottom: audioTheme.spacing.sm,
    },
    controlLabel: {
      ...audioTheme.typography.parameterLabel,
      color: audioTheme.colors.spectrumSecondary,
      marginBottom: audioTheme.spacing.xs,
    },
    sliderContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    slider: {
      width: '100%',
      height: 24,
    },
    valueText: {
      ...audioTheme.typography.parameterLabel,
      color: moduleColors.primary,
      minWidth: 50,
      textAlign: 'right',
      fontSize: 10,
      fontWeight: '600' as const,
    },
    bandActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: audioTheme.spacing.xs,
    },
    actionButton: {
      paddingHorizontal: audioTheme.spacing.md,
      paddingVertical: audioTheme.spacing.xs,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: moduleColors.primary,
      backgroundColor: 'transparent',
    },
    actionButtonDisabled: {
      borderColor: audioTheme.colors.buttonInactive,
      backgroundColor: audioTheme.colors.knobBackground,
    },
    actionText: {
      ...audioTheme.typography.parameterLabel,
      color: moduleColors.primary,
    },
    actionTextDisabled: {
      color: audioTheme.colors.buttonInactive,
    },
    globalControls: {
      backgroundColor: audioTheme.colors.knobBackground,
      padding: audioTheme.spacing.lg,
      borderRadius: 8,
    },
  });
};