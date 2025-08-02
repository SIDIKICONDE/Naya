/**
 * Modal de sauvegarde de preset
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { SaveModalProps } from '../types/index';
import { SAVE_CATEGORIES, DEFAULT_CATEGORY } from '../constants';
import { useAudioTheme } from '../../../../theme/hooks/useAudioTheme';

export const SaveModal: React.FC<SaveModalProps> = ({
  visible, 
  onClose, 
  onSave,
  translations
}) => {
  const audioTheme = useAudioTheme();
  const [presetName, setPresetName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY);

  const handleSave = () => {
    onSave(presetName, selectedCategory);
    setPresetName('');
    setSelectedCategory(DEFAULT_CATEGORY);
  };

  const handleClose = () => {
    setPresetName('');
    setSelectedCategory(DEFAULT_CATEGORY);
    onClose();
  };

  const styles = createStyles(audioTheme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.saveModalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.saveModalContent}>
          <Text style={styles.saveModalTitle}>{translations.title}</Text>
          
          <TextInput
            style={styles.input}
            placeholder={translations.nameLabel}
            placeholderTextColor={audioTheme.colors.buttonInactive}
            value={presetName}
            onChangeText={setPresetName}
            autoFocus
          />

          <View style={styles.categorySelector}>
            <Text style={styles.categorySelectorLabel}>{translations.categoryLabel}:</Text>
            <View style={styles.categorySelectorButtons}>
              {SAVE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categorySelectorButton,
                    selectedCategory === cat && styles.selectedCategorySelectorButton,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={styles.categorySelectorButtonText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.saveModalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmSaveButton} onPress={handleSave}>
              <Text style={styles.confirmSaveButtonText}>{translations.confirm}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (audioTheme: any) => StyleSheet.create({
  saveModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: audioTheme.spacing.lg,
  },
  saveModalContent: {
    width: '90%',
    maxWidth: 320,
    backgroundColor: audioTheme.colors.moduleBackground,
    borderRadius: audioTheme.spacing.md,
    padding: audioTheme.spacing.xl,
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
    shadowColor: audioTheme.colors.knobBackground,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveModalTitle: {
    ...audioTheme.typography.h2,
    color: audioTheme.colors.text,
    marginBottom: audioTheme.spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.sm,
    padding: audioTheme.spacing.md,
    color: audioTheme.colors.text,
    fontSize: 14,
    marginBottom: audioTheme.spacing.lg,
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
  },
  categorySelector: {
    marginBottom: audioTheme.spacing.xl,
  },
  categorySelectorLabel: {
    ...audioTheme.typography.caption,
    color: audioTheme.colors.buttonInactive,
    marginBottom: audioTheme.spacing.sm,
    letterSpacing: 0.3,
  },
  categorySelectorButtons: {
    flexDirection: 'row',
    gap: audioTheme.spacing.xs,
  },
  categorySelectorButton: {
    flex: 1,
    paddingVertical: audioTheme.spacing.sm,
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
  },
  selectedCategorySelectorButton: {
    backgroundColor: audioTheme.colors.primary,
    borderColor: audioTheme.colors.primary,
    shadowColor: audioTheme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categorySelectorButtonText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
    letterSpacing: 0.3,
  },
  saveModalActions: {
    flexDirection: 'row',
    gap: audioTheme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: audioTheme.spacing.sm,
    backgroundColor: audioTheme.colors.knobBackground,
    borderRadius: audioTheme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: audioTheme.colors.buttonInactive,
  },
  cancelButtonText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
  },
  confirmSaveButton: {
    flex: 1,
    paddingVertical: audioTheme.spacing.sm,
    backgroundColor: audioTheme.colors.success,
    borderRadius: audioTheme.spacing.sm,
    alignItems: 'center',
    shadowColor: audioTheme.colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmSaveButtonText: {
    ...audioTheme.typography.button,
    color: audioTheme.colors.text,
    letterSpacing: 0.3,
  },
});