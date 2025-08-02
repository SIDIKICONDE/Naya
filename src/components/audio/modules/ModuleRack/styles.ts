/**
 * Styles pour le ModuleRack
 * Support thématique complet
 */

import { StyleSheet } from 'react-native';
import { useAudioTheme, useModuleColors } from '../../../../theme/hooks/useAudioTheme';
import { createModuleStyles } from '../../../../theme/utils/audioStyles';

export const createRackStyles = () => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('equalizer');
  const themedStyles = createModuleStyles(audioTheme.colors, moduleColors.primary);

  return StyleSheet.create({
    ...themedStyles,
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      pointerEvents: 'box-none',
    },
    floatingButton: {
      position: 'absolute',
      bottom: audioTheme.spacing.lg,
      right: audioTheme.spacing.lg,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: moduleColors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: audioTheme.colors.knobBackground,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 6,
      zIndex: 1001,
    },
    floatingButtonText: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
      fontSize: 18,
    },
    disabledButton: {
      backgroundColor: audioTheme.colors.buttonInactive,
      opacity: 0.6,
    },
    disabledText: {
      color: audioTheme.colors.buttonInactive,
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: audioTheme.colors.knobBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: audioTheme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: audioTheme.colors.buttonInactive,
    },
    modalTitle: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
      fontSize: 20,
    },
    modalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: audioTheme.colors.buttonInactive,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseText: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
      fontSize: 18,
    },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: audioTheme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: audioTheme.colors.buttonInactive,
      borderLeftWidth: 4,
    },
    categoryName: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
      fontSize: 16,
    },
    categoryArrow: {
      color: audioTheme.colors.buttonInactive,
      fontSize: 24,
    },
    backButton: {
      padding: audioTheme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: audioTheme.colors.buttonInactive,
    },
    backButtonText: {
      ...audioTheme.typography.moduleTitle,
      color: moduleColors.primary,
      fontSize: 16,
    },
    moduleTypeItem: {
      padding: audioTheme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: audioTheme.colors.buttonInactive,
    },
    moduleTypeName: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
      fontSize: 16,
    },
  });
};