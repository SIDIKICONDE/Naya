/**
 * Hook pour la détection de langue
 * Fournit des fonctionnalités de détection et d'analyse linguistique
 */

import { useState, useEffect, useCallback } from 'react';
import type { SupportedLanguage } from '../types';
import { LanguageDetector } from '../services/LanguageDetector';

/**
 * État de la détection de langue
 */
interface LanguageDetectionState {
  detectedLanguage: SupportedLanguage | null;
  systemLanguage: string;
  systemLocale: string;
  preferredLanguages: SupportedLanguage[];
  confidence: number;
  isDetecting: boolean;
  error: string | null;
}

/**
 * Hook pour la détection de langue système
 */
export const useLanguageDetector = () => {
  const [state, setState] = useState<LanguageDetectionState>({
    detectedLanguage: null,
    systemLanguage: '',
    systemLocale: '',
    preferredLanguages: [],
    confidence: 0,
    isDetecting: false,
    error: null,
  });

  const [detector] = useState(() => new LanguageDetector());

  // Détection initiale au montage
  useEffect(() => {
    detectLanguage();
  }, []);

  // Fonction de détection principale
  const detectLanguage = useCallback(async () => {
    setState(prev => ({ ...prev, isDetecting: true, error: null }));

    try {
      const [detectionResult, preferredLanguages] = await Promise.all([
        detector.detectSystemLanguage(),
        detector.detectPreferredLanguages(),
      ]);

      setState({
        detectedLanguage: detectionResult.detectedLanguage,
        systemLanguage: detectionResult.systemLanguage,
        systemLocale: detectionResult.systemLocale,
        preferredLanguages,
        confidence: detectionResult.confidence,
        isDetecting: false,
        error: null,
      });

    } catch (error) {
      console.error('[useLanguageDetector] Detection failed:', error);
      
      setState(prev => ({
        ...prev,
        isDetecting: false,
        error: error instanceof Error ? error.message : 'Detection failed',
      }));
    }
  }, [detector]);

  // Vérification si une langue est supportée par le système
  const isLanguageSupportedBySystem = useCallback(async (
    language: SupportedLanguage
  ): Promise<boolean> => {
    try {
      return await detector.isLanguageSupportedBySystem(language);
    } catch (error) {
      console.error('[useLanguageDetector] System support check failed:', error);
      return false;
    }
  }, [detector]);

  // Récupération des informations de debug
  const getDebugInfo = useCallback(async () => {
    try {
      return await detector.getDebugInfo();
    } catch (error) {
      console.error('[useLanguageDetector] Debug info failed:', error);
      return null;
    }
  }, [detector]);

  // Reset de l'état
  const reset = useCallback(() => {
    setState({
      detectedLanguage: null,
      systemLanguage: '',
      systemLocale: '',
      preferredLanguages: [],
      confidence: 0,
      isDetecting: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    detectLanguage,
    isLanguageSupportedBySystem,
    getDebugInfo,
    reset,
  };
};