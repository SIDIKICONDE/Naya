/**
 * Interface utilisateur audio professionnelle
 * Design moderne avec contrôles intuitifs
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useAudioTheme } from '../../theme/hooks/useAudioTheme';
import { createModuleStyles } from '../../theme/utils/audioStyles';
import { audioInterface, ModuleType } from '../../audio/AudioInterface';
import { 
  EqualizerView,
  CompressorView,
  ReverbView,
  LimiterView,
  GateView,
  DelayView,
  ChorusView,
  DistortionView
} from './modules';

import { VisualizerPanel } from './visualizers/VisualizerPanel';
import { ModuleRack } from './ModuleRack';
import { PresetManager } from './PresetManager';
import { SystemMetrics } from './SystemMetrics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AudioInterfaceViewProps {
  onClose?: () => void;
}

// Rendu des contrôles spécifiques à chaque module
const renderModuleControls = (moduleId: string, isInitialized: boolean) => {
  const defaultControlsStyle = {
    padding: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
  };
  
  const moduleTypeTextStyle = {
    color: '#666',
    fontSize: 16,
    textAlign: 'center' as const,
  };

  if (!isInitialized) {
    return (
      <View style={defaultControlsStyle}>
        <Text style={moduleTypeTextStyle}>
          Initialisation en cours...
        </Text>
      </View>
    );
  }

  try {
    // Vérification de sécurité pour éviter l'erreur
    if (!audioInterface || typeof audioInterface.getModule !== 'function') {
      return (
        <View style={defaultControlsStyle}>
          <Text style={moduleTypeTextStyle}>
            Interface audio non disponible
          </Text>
        </View>
      );
    }
    
    const module = audioInterface.getModule(moduleId);
    if (!module) return null;

    switch (module.metadata.type) {
      case ModuleType.PARAMETRIC_EQ:
      case ModuleType.GRAPHIC_EQ:
      case ModuleType.MULTIBAND_EQ:
        return <EqualizerView key={moduleId} moduleId={moduleId} />;
      
      case ModuleType.COMPRESSOR:
      case ModuleType.MULTIBAND_COMPRESSOR:
      case ModuleType.DE_ESSER:
        return <CompressorView key={moduleId} moduleId={moduleId} />;
      
      case ModuleType.LIMITER:
        return <LimiterView key={moduleId} moduleId={moduleId} />;
      
      case ModuleType.GATE:
        return <GateView key={moduleId} moduleId={moduleId} />;
      
      case ModuleType.REVERB:
        return <ReverbView key={moduleId} moduleId={moduleId} />;
      
      case ModuleType.DELAY:
        return <DelayView key={moduleId} moduleId={moduleId} />;
      
      case ModuleType.CHORUS:
      case ModuleType.FLANGER:
      case ModuleType.PHASER:
        return <ChorusView key={moduleId} moduleId={moduleId} />;
      
      case ModuleType.DISTORTION:
      case ModuleType.PITCH_SHIFTER:
      case ModuleType.HARMONIZER:
        return <DistortionView key={moduleId} moduleId={moduleId} />;
      
      default:
        return (
          <View style={defaultControlsStyle}>
            <Text style={moduleTypeTextStyle}>
              {module.metadata.name}
            </Text>
          </View>
        );
    }
  } catch (error) {
    console.error('Erreur lors du rendu des contrôles du module:', error);
    return (
      <View style={defaultControlsStyle}>
        <Text style={moduleTypeTextStyle}>
          Erreur de chargement du module
        </Text>
      </View>
    );
  }
};

const AudioInterfaceViewContent: React.FC<AudioInterfaceViewProps> = ({ onClose }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  
  // Hook de thème audio
  const audioTheme = useAudioTheme();

  // Initialisation
  useEffect(() => {
    initializeAudio();
    return () => {
      audioInterface.shutdown();
    };
  }, []);

  // Auto-détection du traitement en cours
  useEffect(() => {
    const interval = setInterval(() => {
      // Détecte si au moins un module est actif et traite de l'audio
      const hasActiveProcessing = activeModules.some(moduleId => {
        // Vérification de sécurité pour éviter l'erreur
        if (!audioInterface || typeof audioInterface.getModule !== 'function') {
          return false;
        }
        const module = audioInterface.getModule(moduleId);
        return module && module.state.enabled && !module.state.bypassed;
      });
      setIsProcessing(hasActiveProcessing && isInitialized);
    }, 100); // Vérification toutes les 100ms

    return () => clearInterval(interval);
  }, [activeModules, isInitialized]);

  const initializeAudio = async () => {
    try {
      console.log('Début de l\'initialisation audio...');
      await audioInterface.initialize({
        sampleRate: 48000,
        bufferSize: 512,
        channels: 2,
      });
      console.log('Initialisation audio réussie');
      setIsInitialized(true);
    } catch (error) {
      console.error('Erreur initialisation audio:', error);
      // En cas d'erreur, on active quand même l'interface pour les tests
      setIsInitialized(true);
    }
  };



  // Ajout de modules
  const addModule = useCallback((type: ModuleType) => {
    if (!isInitialized) {
      console.warn('AudioInterface non initialisée, impossible d\'ajouter un module');
      return;
    }
    try {
      if (!audioInterface || typeof audioInterface.createModule !== 'function') {
        throw new Error('AudioInterface non disponible');
      }
      const moduleId = audioInterface.createModule(type);
      setActiveModules([...activeModules, moduleId]);
      setSelectedModule(moduleId);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du module:', error);
    }
  }, [activeModules, isInitialized]);

  // Suppression de modules
  const removeModule = useCallback((moduleId: string) => {
    if (!isInitialized) {
      console.warn('AudioInterface non initialisée, impossible de supprimer un module');
      return;
    }
    try {
      if (!audioInterface || typeof audioInterface.removeModule !== 'function') {
        throw new Error('AudioInterface non disponible');
      }
      audioInterface.removeModule(moduleId);
      setActiveModules(activeModules.filter(id => id !== moduleId));
      if (selectedModule === moduleId) {
        setSelectedModule(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du module:', error);
    }
  }, [activeModules, selectedModule, isInitialized]);

  // Génération des styles thématiques
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: audioTheme.colors.knobBackground,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: audioTheme.spacing.md,
      backgroundColor: audioTheme.colors.knobBackground,
      borderBottomWidth: 1,
      borderBottomColor: audioTheme.colors.sliderTrack,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    title: {
      ...audioTheme.typography.moduleTitle,
      color: audioTheme.colors.spectrumPrimary,
    },
    visualizers: {
      height: 280,
      backgroundColor: audioTheme.colors.knobBackground,
      borderBottomWidth: 1,
      borderBottomColor: audioTheme.colors.sliderTrack,
      padding: audioTheme.spacing.sm,
    },
    moduleControlSection: {
      flex: 1,
      backgroundColor: audioTheme.colors.knobBackground,
      minHeight: 200,
    },
    presetButton: {
      backgroundColor: audioTheme.colors.buttonInactive,
      paddingHorizontal: audioTheme.spacing.md,
      paddingVertical: audioTheme.spacing.sm,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    buttonText: {
      ...audioTheme.typography.parameterLabel,
      color: '#fff',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: audioTheme.colors.mute,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  });

  return (
    <SafeAreaView style={themedStyles.container}>
      <StatusBar 
        barStyle={audioTheme.isDark ? "light-content" : "dark-content"} 
        backgroundColor={audioTheme.colors.knobBackground} 
      />
      
      {/* Header */}
      <View style={themedStyles.header}>
        <View style={styles.headerLeft}>
          <Text style={themedStyles.title}>Interface Pro</Text>
          <SystemMetrics isProcessing={isProcessing} compact={true} />
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={themedStyles.presetButton}
            onPress={() => setShowPresets(!showPresets)}
          >
            <Text style={themedStyles.buttonText}>Presets</Text>
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity style={themedStyles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Visualiseurs */}
      <View style={themedStyles.visualizers}>
        <VisualizerPanel compact={false} defaultMode="spectrum" />
      </View>



      {/* Zone de contrôle du module sélectionné */}
      <View style={themedStyles.moduleControlSection}>
        <ScrollView style={styles.moduleControlArea} contentContainerStyle={styles.moduleControlContent}>
          {selectedModule && renderModuleControls(selectedModule, isInitialized)}
        </ScrollView>
      </View>

      {/* Bouton flottant d'ajout de modules */}
      <ModuleRack
        onAddModule={addModule}
        disabled={!isInitialized}
      />

      {/* Gestionnaire de presets */}
      {showPresets && (
        <PresetManager
          onClose={() => setShowPresets(false)}
          onLoadPreset={(presetId) => {
            if (isInitialized) {
              try {
                audioInterface.loadPreset(presetId);
                setShowPresets(false);
              } catch (error) {
                console.error('Erreur lors du chargement du preset:', error);
              }
            } else {
              console.warn('AudioInterface non initialisée, impossible de charger le preset');
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

// Export du composant principal
export const AudioInterfaceView: React.FC<AudioInterfaceViewProps> = AudioInterfaceViewContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ff3333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  visualizers: {
    height: 280,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    padding: 8,
  },
  levelMeterFullWidth: {
    flex: 1,
    padding: 8,
  },


  moduleControlSection: {
    flex: 1,
    backgroundColor: '#000',
    minHeight: 200,
  },
  moduleControlArea: {
    flex: 1,
  },
  moduleControlContent: {
    flexGrow: 1,
    padding: 16,
  },
  defaultControls: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  moduleTypeText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});