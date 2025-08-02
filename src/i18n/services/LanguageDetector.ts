/**
 * Détecteur de langue pour React Native
 * Détecte automatiquement la langue du système et les préférences utilisateur
 */

import { NativeModules, Platform } from 'react-native';
import type { SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES, SYSTEM_LOCALES } from '../constants';

/**
 * Informations de détection de langue
 */
interface LanguageDetectionResult {
  detectedLanguage: SupportedLanguage | null;
  systemLanguage: string;
  systemLocale: string;
  supportedBySystem: boolean;
  confidence: number; // 0-1
}

/**
 * Service de détection de langue
 */
export class LanguageDetector {
  /**
   * Détecte la langue préférée du système
   */
  public async detectSystemLanguage(): Promise<LanguageDetectionResult> {
    try {
      const systemInfo = await this.getSystemLanguageInfo();
      const detectedLanguage = this.extractSupportedLanguage(systemInfo.language);
      
      return {
        detectedLanguage,
        systemLanguage: systemInfo.language,
        systemLocale: systemInfo.locale,
        supportedBySystem: detectedLanguage !== null,
        confidence: this.calculateConfidence(systemInfo, detectedLanguage),
      };
      
    } catch (error) {
      console.error('[LanguageDetector] Detection failed:', error);
      
      return {
        detectedLanguage: null,
        systemLanguage: 'unknown',
        systemLocale: 'unknown',
        supportedBySystem: false,
        confidence: 0,
      };
    }
  }

  /**
   * Récupère les informations linguistiques du système
   */
  private async getSystemLanguageInfo(): Promise<{
    language: string;
    locale: string;
    region?: string;
  }> {
    if (Platform.OS === 'ios') {
      return this.getIOSLanguageInfo();
    } else {
      return this.getAndroidLanguageInfo();
    }
  }

  /**
   * Récupère les informations linguistiques sur iOS
   */
  private getIOSLanguageInfo(): {
    language: string;
    locale: string;
    region?: string;
  } {
    try {
      const settingsManager = NativeModules.SettingsManager;
      
      if (!settingsManager) {
        throw new Error('SettingsManager not available');
      }

      // Langue principale
      const primaryLanguage = settingsManager.settings?.AppleLanguages?.[0] || 'en';
      
      // Locale complète
      const locale = settingsManager.settings?.AppleLocale || 
                    settingsManager.settings?.AppleLanguages?.[0] || 
                    'en_US';

      // Extraction de la région
      const region = locale.split('_')[1] || locale.split('-')[1];

      return {
        language: primaryLanguage,
        locale,
        region,
      };
      
    } catch (error) {
      console.warn('[LanguageDetector] iOS detection fallback:', error);
      
      // Fallback pour iOS
      return {
        language: 'en',
        locale: 'en_US',
      };
    }
  }

  /**
   * Récupère les informations linguistiques sur Android
   */
  private getAndroidLanguageInfo(): {
    language: string;
    locale: string;
    region?: string;
  } {
    try {
      const i18nManager = NativeModules.I18nManager;
      
      if (!i18nManager) {
        throw new Error('I18nManager not available');
      }

      const localeIdentifier = i18nManager.localeIdentifier || 'en_US';
      
      // Parsing du locale identifier (ex: "fr_FR", "en_US")
      const parts = localeIdentifier.split('_');
      const language = parts[0] || 'en';
      const region = parts[1];

      return {
        language: localeIdentifier,
        locale: localeIdentifier,
        region,
      };
      
    } catch (error) {
      console.warn('[LanguageDetector] Android detection fallback:', error);
      
      // Fallback pour Android
      return {
        language: 'en',
        locale: 'en_US',
      };
    }
  }

  /**
   * Extrait une langue supportée à partir d'une chaîne de langue
   */
  private extractSupportedLanguage(languageString: string): SupportedLanguage | null {
    if (!languageString) {
      return null;
    }

    // Nettoyage et normalisation
    const cleanLanguage = languageString.toLowerCase().trim();
    
    // Extraction du code de langue principal
    const languageCode = cleanLanguage.split('-')[0].split('_')[0];
    
    // Vérification directe
    if (SUPPORTED_LANGUAGES.includes(languageCode as SupportedLanguage)) {
      return languageCode as SupportedLanguage;
    }

    // Mapping des variantes courantes
    const languageMapping: Record<string, SupportedLanguage> = {
      'fr-fr': 'fr',
      'fr-ca': 'fr',
      'fr-be': 'fr',
      'fr-ch': 'fr',
      'en-us': 'en',
      'en-gb': 'en',
      'en-ca': 'en',
      'en-au': 'en',
      'es-es': 'es',
      'es-mx': 'es',
      'es-ar': 'es',
      'de-de': 'de',
      'de-at': 'de',
      'de-ch': 'de',
      'it-it': 'it',
      'it-ch': 'it',
    };

    const mappedLanguage = languageMapping[cleanLanguage];
    if (mappedLanguage) {
      return mappedLanguage;
    }

    return null;
  }

  /**
   * Calcule le niveau de confiance de la détection
   */
  private calculateConfidence(
    systemInfo: { language: string; locale: string; region?: string },
    detectedLanguage: SupportedLanguage | null
  ): number {
    let confidence = 0;

    // Base: langue détectée
    if (detectedLanguage) {
      confidence += 0.5;
    }

    // Bonus: correspondance exacte avec locale système
    if (detectedLanguage && SYSTEM_LOCALES[detectedLanguage]) {
      const expectedLocale = SYSTEM_LOCALES[detectedLanguage].toLowerCase();
      const systemLocale = systemInfo.locale.toLowerCase();
      
      if (systemLocale.includes(expectedLocale.split('-')[0])) {
        confidence += 0.3;
      }
    }

    // Bonus: région cohérente
    if (systemInfo.region && detectedLanguage) {
      const regionMapping: Record<string, SupportedLanguage[]> = {
        'FR': ['fr'],
        'US': ['en'],
        'GB': ['en'],
        'CA': ['fr', 'en'],
        'ES': ['es'],
        'MX': ['es'],
        'DE': ['de'],
        'AT': ['de'],
        'CH': ['fr', 'de', 'it'],
        'IT': ['it'],
      };

      const expectedLanguages = regionMapping[systemInfo.region.toUpperCase()];
      if (expectedLanguages?.includes(detectedLanguage)) {
        confidence += 0.2;
      }
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Détecte les langues préférées de l'utilisateur (ordre de préférence)
   */
  public async detectPreferredLanguages(): Promise<SupportedLanguage[]> {
    try {
      const preferredLanguages: SupportedLanguage[] = [];
      
      // Récupération de la liste des langues préférées du système
      const systemLanguages = await this.getSystemPreferredLanguages();
      
      // Conversion vers les langues supportées
      for (const lang of systemLanguages) {
        const supportedLang = this.extractSupportedLanguage(lang);
        if (supportedLang && !preferredLanguages.includes(supportedLang)) {
          preferredLanguages.push(supportedLang);
        }
      }

      return preferredLanguages;
      
    } catch (error) {
      console.error('[LanguageDetector] Preferred languages detection failed:', error);
      return [];
    }
  }

  /**
   * Récupère la liste des langues préférées du système
   */
  private async getSystemPreferredLanguages(): Promise<string[]> {
    try {
      if (Platform.OS === 'ios') {
        const settingsManager = NativeModules.SettingsManager;
        return settingsManager?.settings?.AppleLanguages || ['en'];
      } else {
        const i18nManager = NativeModules.I18nManager;
        const locale = i18nManager?.localeIdentifier || 'en_US';
        return [locale];
      }
    } catch (error) {
      console.warn('[LanguageDetector] System languages fallback:', error);
      return ['en'];
    }
  }

  /**
   * Vérifie si le système supporte une langue donnée
   */
  public async isLanguageSupportedBySystem(language: SupportedLanguage): Promise<boolean> {
    try {
      const systemLanguages = await this.getSystemPreferredLanguages();
      
      return systemLanguages.some(systemLang => {
        const extractedLang = this.extractSupportedLanguage(systemLang);
        return extractedLang === language;
      });
      
    } catch (error) {
      console.error('[LanguageDetector] System support check failed:', error);
      return false;
    }
  }

  /**
   * Récupère des informations de debug sur la détection
   */
  public async getDebugInfo(): Promise<{
    platform: string;
    detectionResult: LanguageDetectionResult;
    preferredLanguages: SupportedLanguage[];
    systemModules: {
      settingsManager: boolean;
      i18nManager: boolean;
    };
  }> {
    const detectionResult = await this.detectSystemLanguage();
    const preferredLanguages = await this.detectPreferredLanguages();

    return {
      platform: Platform.OS,
      detectionResult,
      preferredLanguages,
      systemModules: {
        settingsManager: !!NativeModules.SettingsManager,
        i18nManager: !!NativeModules.I18nManager,
      },
    };
  }
}