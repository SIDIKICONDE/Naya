/**
 * Mode d'affichage par défaut pour le module de réverbération
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAudioTheme } from '../../../../../theme/hooks/useAudioTheme';
import { createReverbStyles } from '../styles';

interface DefaultModeProps {
  setCompactMode: (value: boolean) => void;
  setShowAdvanced: (value: boolean) => void;
}

export const DefaultMode: React.FC<DefaultModeProps> = ({
  setCompactMode,
  setShowAdvanced,
}) => {
  const audioTheme = useAudioTheme();
  const styles = createReverbStyles();

  return (
    <View style={styles.defaultLayout}>
      <Text style={styles.modeInstruction}>
        Choisissez un mode d'affichage :
      </Text>
      <View style={styles.modeSelection}>
        <TouchableOpacity
          style={styles.modeSelectionButton}
          onPress={() => setCompactMode(true)}
        >
          <Text style={styles.modeSelectionText}>📱 Mode Compact</Text>
          <Text style={styles.modeSelectionDesc}>Interface minimaliste</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeSelectionButton}
          onPress={() => setShowAdvanced(true)}
        >
          <Text style={styles.modeSelectionText}>🎛️ Mode Avancé</Text>
          <Text style={styles.modeSelectionDesc}>Tous les contrôles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};