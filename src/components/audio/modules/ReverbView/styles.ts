/**
 * Styles pour le module de réverbération
 * Support thématique complet
 */

import { StyleSheet } from 'react-native';
import { useAudioTheme, useModuleColors } from '../../../../theme/hooks/useAudioTheme';
import { createModuleStyles } from '../../../../theme/utils/audioStyles';

export const createReverbStyles = () => {
  const audioTheme = useAudioTheme();
  const moduleColors = useModuleColors('reverb');
  const themedStyles = createModuleStyles(audioTheme.colors, moduleColors.primary);

  return StyleSheet.create({
    ...themedStyles,
  container: {
    flex: 1,
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.md,
  },
  containerCompact: {
    flex: 0,
    minHeight: 'auto',
    borderRadius: audioTheme.spacing.md,
  },
  containerDefault: {
    flex: 0,
    minHeight: 'auto',
    borderRadius: audioTheme.spacing.md,
  },
  header: {
    paddingHorizontal: audioTheme.spacing.md,
    paddingVertical: audioTheme.spacing.sm,
    backgroundColor: audioTheme.colors.knobBackground,
    borderBottomWidth: 1,
    borderBottomColor: audioTheme.colors.buttonInactive,
    borderTopLeftRadius: audioTheme.spacing.md,
    borderTopRightRadius: audioTheme.spacing.md,
  },
  headerCompact: {
    paddingHorizontal: audioTheme.spacing.xs,
    paddingVertical: audioTheme.spacing.sm,
    marginBottom: audioTheme.spacing.xs,
    borderTopLeftRadius: audioTheme.spacing.md,
    borderTopRightRadius: audioTheme.spacing.md,
  },
  headerDefault: {
    paddingHorizontal: audioTheme.spacing.sm,
    paddingVertical: audioTheme.spacing.xs,
    borderTopLeftRadius: audioTheme.spacing.md,
    borderTopRightRadius: audioTheme.spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...audioTheme.typography.moduleTitle,
    color: audioTheme.colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: audioTheme.spacing.xs,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContainerCompact: {
    flex: 0,
    flexGrow: 0,
  },
  scrollContainerDefault: {
    flex: 0,
    flexGrow: 0,
  },
  modeButton: {
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.xs,
    paddingVertical: audioTheme.spacing.xs,
    paddingHorizontal: audioTheme.spacing.xs,
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
  },
  modeButtonActive: {
    backgroundColor: moduleColors.primary,
    borderColor: moduleColors.primary,
  },
  modeButtonText: {
    ...audioTheme.typography.parameterLabel,
    color: audioTheme.colors.buttonInactive,
    fontSize: 9,
  },
  modeButtonTextActive: {
    color: audioTheme.colors.text,
  },
  
  // Styles mode compact
  compactLayout: {
    padding: audioTheme.spacing.sm,
    margin: audioTheme.spacing.xs,
    borderBottomLeftRadius: audioTheme.spacing.md,
    borderBottomRightRadius: audioTheme.spacing.md,
  },
  compactTypes: {
    flexDirection: 'row',
    gap: audioTheme.spacing.xs,
    marginBottom: audioTheme.spacing.md,
    justifyContent: 'center',
  },
  compactTypeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: audioTheme.colors.knobBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
  },
  compactTypeButtonActive: {
    backgroundColor: moduleColors.primary,
    borderColor: moduleColors.primary,
  },
  compactTypeText: {
    ...audioTheme.typography.moduleTitle,
    fontSize: 14,
    color: audioTheme.colors.text,
  },
  compactTypeTextActive: {
    color: audioTheme.colors.text,
  },
  compactControls: {
    gap: audioTheme.spacing.sm,
  },
  compactRow: {
    flexDirection: 'row',
    gap: audioTheme.spacing.md,
    marginBottom: audioTheme.spacing.sm,
  },
  compactControl: {
    flex: 1,
  },
  compactLabel: {
    ...audioTheme.typography.parameterLabel,
    color: audioTheme.colors.buttonInactive,
    marginBottom: audioTheme.spacing.xs,
  },
  compactSlider: {
    height: 6,
    transform: [{ scaleY: 0.5 }],
  },
  
  // Styles mode avancé
  advancedLayout: {
    padding: audioTheme.spacing.sm,
    borderBottomLeftRadius: audioTheme.spacing.md,
    borderBottomRightRadius: audioTheme.spacing.md,
  },
  advancedVisualContainer: {
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.sm,
    padding: audioTheme.spacing.sm,
    marginBottom: audioTheme.spacing.sm,
    alignItems: 'center',
  },
  advancedTypeSection: {
    paddingHorizontal: audioTheme.spacing.sm,
    paddingVertical: audioTheme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: audioTheme.colors.buttonInactive,
    marginBottom: audioTheme.spacing.xs,
  },
  advancedTypeList: {
    gap: audioTheme.spacing.xs,
  },
  advancedTypeButton: {
    backgroundColor: audioTheme.colors.knobBackground,
    paddingHorizontal: audioTheme.spacing.md,
    paddingVertical: audioTheme.spacing.xs,
    borderRadius: audioTheme.spacing.sm,
    alignItems: 'center',
    minWidth: 65,
  },
  advancedTypeButtonActive: {
    backgroundColor: moduleColors.primary,
  },
  advancedTypeIcon: {
    fontSize: 18,
    marginBottom: audioTheme.spacing.xs,
  },
  advancedTypeName: {
    ...audioTheme.typography.parameterLabel,
    color: audioTheme.colors.text,
    fontSize: 9,
  },
  advancedMainSection: {
    paddingHorizontal: audioTheme.spacing.sm,
    paddingVertical: audioTheme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: audioTheme.colors.buttonInactive,
    marginBottom: audioTheme.spacing.xs,
  },
  advancedMainRow: {
    flexDirection: 'row',
    gap: audioTheme.spacing.sm,
    marginBottom: audioTheme.spacing.sm,
  },
  advancedMainControl: {
    flex: 1,
  },
  advancedMainLabel: {
    ...audioTheme.typography.parameterLabel,
    color: audioTheme.colors.buttonInactive,
    marginBottom: audioTheme.spacing.xs,
  },
  advancedMainValue: {
    ...audioTheme.typography.parameterLabel,
    color: audioTheme.colors.text,
    marginBottom: audioTheme.spacing.xs,
    textAlign: 'center',
    backgroundColor: audioTheme.colors.knobBackground,
    paddingVertical: audioTheme.spacing.xs,
    paddingHorizontal: audioTheme.spacing.xs,
    borderRadius: audioTheme.spacing.xs,
  },
  advancedMainSlider: {
    height: 10,
    transform: [{ scaleY: 0.8 }],
  },
  advancedSection: {
    padding: audioTheme.spacing.sm,
    backgroundColor: audioTheme.colors.knobBackground,
    marginHorizontal: audioTheme.spacing.xs,
    marginVertical: audioTheme.spacing.xs,
    borderRadius: audioTheme.spacing.sm,
  },
  advancedGrid: {
    flexDirection: 'row',
    gap: audioTheme.spacing.xs,
  },
  advancedControl: {
    flex: 1,
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.xs,
    padding: audioTheme.spacing.xs,
  },
  advancedLabel: {
    ...audioTheme.typography.parameterLabel,
    color: audioTheme.colors.buttonInactive,
    marginBottom: audioTheme.spacing.xs,
    textAlign: 'center',
  },
  advancedValue: {
    ...audioTheme.typography.parameterLabel,
    color: audioTheme.colors.text,
    marginBottom: audioTheme.spacing.xs,
    textAlign: 'center',
  },
  advancedSlider: {
    height: 6,
    transform: [{ scaleY: 0.7 }],
  },
  advancedPresetSection: {
    padding: audioTheme.spacing.sm,
    backgroundColor: audioTheme.colors.knobBackground,
    marginHorizontal: audioTheme.spacing.xs,
    marginVertical: audioTheme.spacing.xs,
    borderRadius: audioTheme.spacing.sm,
  },
  advancedPresetList: {
    gap: audioTheme.spacing.xs,
  },
  advancedPresetButton: {
    backgroundColor: audioTheme.colors.moduleBackground,
    paddingHorizontal: audioTheme.spacing.md,
    paddingVertical: audioTheme.spacing.xs,
    borderRadius: audioTheme.spacing.lg,
  },
  advancedPresetButtonText: {
    ...audioTheme.typography.parameterLabel,
    color: audioTheme.colors.text,
    fontSize: 10,
  },
  
  // Styles mode par défaut
  defaultLayout: {
    padding: audioTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderBottomLeftRadius: audioTheme.spacing.md,
    borderBottomRightRadius: audioTheme.spacing.md,
  },
  modeInstruction: {
    ...audioTheme.typography.parameterLabel,
    color: audioTheme.colors.buttonInactive,
    marginBottom: audioTheme.spacing.md,
    textAlign: 'center',
  },
  modeSelection: {
    flexDirection: 'row',
    gap: audioTheme.spacing.sm,
  },
  modeSelectionButton: {
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.xs,
    padding: audioTheme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
    minWidth: 100,
  },
  modeSelectionText: {
    ...audioTheme.typography.moduleTitle,
    color: audioTheme.colors.text,
    marginBottom: audioTheme.spacing.xs,
  },
  modeSelectionDesc: {
    ...audioTheme.typography.parameterLabel,
    color: audioTheme.colors.buttonInactive,
    textAlign: 'center',
  },
  sectionTitle: {
    ...audioTheme.typography.moduleTitle,
    color: audioTheme.colors.text,
    marginBottom: audioTheme.spacing.sm,
  },
  
  // Styles pour la visualisation
  visualization: {
    borderRadius: audioTheme.spacing.sm,
  },
  });
};