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
  return (
    <View style={styles.container}>
      {/* Header avec switch principal */}
      <View style={styles.header}>
        <Text style={styles.title}>Égaliseur Audio</Text>
        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, { opacity: enabled ? 1 : 0.5 }]}>
            {enabled ? 'Activé' : 'Désactivé'}
          </Text>
          <Switch
            value={enabled}
            onValueChange={onToggleEnabled}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={enabled ? '#2E7D32' : '#BDBDBD'}
          />
        </View>
      </View>

      {/* Grille des bandes */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.bandsContainer}
        contentContainerStyle={styles.bandsContent}
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
      <View style={styles.curveIndicator}>
        <Text style={styles.curveText}>
          Courbe de réponse en fréquence
        </Text>
        <View style={styles.curveLine} />
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  bandsContainer: {
    marginBottom: 16,
  },
  bandsContent: {
    paddingHorizontal: 8,
  },
  curveIndicator: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  curveText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  curveLine: {
    height: 2,
    backgroundColor: '#4CAF50',
    width: '80%',
    borderRadius: 1,
  },
});