/**
 * Gestionnaire principal du système d'internationalisation
 * Centralise la configuration et l'initialisation d'i18next
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';

import { LanguageDetector } from '../services/LanguageDetector';
import { TranslationLoader } from '../services/TranslationLoader';
import { PersistenceManager } from '../services/PersistenceManager';
import { DEFAULT_I18N_CONFIG, I18N_EVENTS } from '../constants';
import { EventEmitter } from '../utils/EventEmitter';

import type { I18nConfig, SupportedLanguage } from '../types';

/**
 * Gestionnaire principal du système i18n
 */
class I18nManager {
  private static instance: I18nManager;
  private isInitialized = false;
  private eventEmitter = new EventEmitter();
  private persistenceManager = new PersistenceManager();
  private translationLoader = new TranslationLoader();
  private languageDetector = new LanguageDetector();

  private constructor() {}

  /**
   * Instance singleton du gestionnaire
   */
  public static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  /**
   * Initialise le système i18n avec la configuration fournie
   */
  public async init(config: Partial<I18nConfig> = {}): Promise<void> {
    if (this.isInitialized) {
      console.warn('[I18nManager] System already initialized');
      return;
    }

    const finalConfig: I18nConfig = {
      ...DEFAULT_I18N_CONFIG,
      ...config,
    };

    try {
      // Détection de la langue système
      const detectedLanguage = await this.detectSystemLanguage();
      
      // Récupération de la langue sauvegardée
      const savedLanguage = await this.persistenceManager.getStoredLanguage();
      
      // Langue à utiliser (priorité: sauvegardée > détectée > défaut)
      const currentLanguage = savedLanguage || detectedLanguage || finalConfig.defaultLanguage;

      // Chargement des traductions
      const resources = await this.translationLoader.loadLanguageResources(currentLanguage);

      // Configuration d'i18next
      await i18n
        .use(initReactI18next)
        .init({
          lng: currentLanguage,
          fallbackLng: finalConfig.fallbackLanguage,
          supportedLngs: finalConfig.supportedLanguages,
          
          // Configuration des ressources
          resources,
          
          // Configuration de l'interpolation
          interpolation: finalConfig.interpolation,
          
          // Configuration du debug
          debug: finalConfig.debug,
          
          // Configuration des namespaces
          defaultNS: 'common',
          ns: ['common', 'navigation', 'audio', 'forms', 'errors', 'system'],
          
          // Configuration React
          react: {
            useSuspense: false,
          },
          
          // Désactivation des détecteurs automatiques
          detection: {
            order: [], // Pas de détection automatique
          },
        });

      this.isInitialized = true;
      
      // Sauvegarde de la langue actuelle
      await this.persistenceManager.saveLanguage(currentLanguage as SupportedLanguage);
      
      // Émission de l'événement d'initialisation
      this.eventEmitter.emit(I18N_EVENTS.TRANSLATION_LOADED, {
        language: currentLanguage,
        resources,
      });

      console.log(`[I18nManager] Initialized with language: ${currentLanguage}`);
      
    } catch (error) {
      console.error('[I18nManager] Initialization failed:', error);
      this.eventEmitter.emit(I18N_EVENTS.ERROR_OCCURRED, { error });
      throw error;
    }
  }

  /**
   * Change la langue active
   */
  public async changeLanguage(language: SupportedLanguage): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('[I18nManager] System not initialized');
    }

    try {
      // Chargement des ressources pour la nouvelle langue
      const resources = await this.translationLoader.loadLanguageResources(language);
      
      // Ajout des ressources à i18next
      Object.keys(resources).forEach(namespace => {
        i18n.addResourceBundle(language, namespace, resources[namespace], true, true);
      });

      // Changement de langue dans i18next
      await i18n.changeLanguage(language);
      
      // Sauvegarde de la nouvelle langue
      await this.persistenceManager.saveLanguage(language);
      
      // Émission de l'événement de changement
      this.eventEmitter.emit(I18N_EVENTS.LANGUAGE_CHANGED, {
        oldLanguage: i18n.language,
        newLanguage: language,
      });

      console.log(`[I18nManager] Language changed to: ${language}`);
      
    } catch (error) {
      console.error('[I18nManager] Language change failed:', error);
      this.eventEmitter.emit(I18N_EVENTS.ERROR_OCCURRED, { error });
      throw error;
    }
  }

  /**
   * Récupère la langue actuellement active
   */
  public getCurrentLanguage(): SupportedLanguage {
    return (i18n.language || DEFAULT_I18N_CONFIG.defaultLanguage) as SupportedLanguage;
  }

  /**
   * Vérifie si le système est initialisé
   */
  public isReady(): boolean {
    return this.isInitialized && i18n.isInitialized;
  }

  /**
   * Récupère l'instance i18next
   */
  public getI18nInstance() {
    return i18n;
  }

  /**
   * Ajoute un écouteur d'événement
   */
  public addEventListener(event: string, listener: (data?: any) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Supprime un écouteur d'événement
   */
  public removeEventListener(event: string, listener: (data?: any) => void): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * Précharge les traductions pour une langue
   */
  public async preloadLanguage(language: SupportedLanguage): Promise<void> {
    try {
      const resources = await this.translationLoader.loadLanguageResources(language);
      
      Object.keys(resources).forEach(namespace => {
        i18n.addResourceBundle(language, namespace, resources[namespace], true, false);
      });
      
      console.log(`[I18nManager] Preloaded language: ${language}`);
      
    } catch (error) {
      console.warn(`[I18nManager] Failed to preload language ${language}:`, error);
    }
  }

  /**
   * Vide le cache des traductions
   */
  public clearCache(): void {
    this.translationLoader.clearCache();
    console.log('[I18nManager] Translation cache cleared');
  }

  /**
   * Détecte la langue du système
   */
  private async detectSystemLanguage(): Promise<SupportedLanguage | null> {
    try {
      let systemLanguage: string;

      if (Platform.OS === 'ios') {
        systemLanguage = NativeModules.SettingsManager?.settings?.AppleLocale || 
                        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 
                        'en';
      } else {
        systemLanguage = NativeModules.I18nManager?.localeIdentifier || 'en';
      }

      // Extraction du code de langue (ex: "fr-FR" -> "fr")
      const languageCode = systemLanguage.split('-')[0] as SupportedLanguage;
      
      // Vérification si la langue est supportée
      if (DEFAULT_I18N_CONFIG.supportedLanguages.includes(languageCode)) {
        return languageCode;
      }

      return null;
      
    } catch (error) {
      console.warn('[I18nManager] System language detection failed:', error);
      return null;
    }
  }
}

// Instances et fonctions d'exportation
const i18nManager = I18nManager.getInstance();

/**
 * Initialise le système d'internationalisation
 */
export const initI18n = (config?: Partial<I18nConfig>): Promise<void> => {
  return i18nManager.init(config);
};

/**
 * Récupère l'instance i18next configurée
 */
export const getI18nInstance = () => {
  return i18nManager.getI18nInstance();
};

/**
 * Exporte l'instance du gestionnaire pour usage avancé
 */
export { i18nManager as I18nManager };