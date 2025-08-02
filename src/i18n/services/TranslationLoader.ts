/**
 * Service de chargement des traductions
 * Gère le chargement, la mise en cache et la validation des fichiers de traduction
 */

import type { SupportedLanguage, TranslationResource } from '../types';
import { TRANSLATION_NAMESPACES, TIMEOUTS } from '../constants';

/**
 * Cache des traductions chargées
 */
interface TranslationCache {
  [language: string]: {
    [namespace: string]: TranslationResource;
  };
}

/**
 * Service de chargement des traductions
 */
export class TranslationLoader {
  private cache: TranslationCache = {};
  private loadingPromises: Map<string, Promise<TranslationResource>> = new Map();

  /**
   * Charge les ressources de traduction pour une langue donnée
   */
  public async loadLanguageResources(language: SupportedLanguage): Promise<Record<string, TranslationResource>> {
    const resources: Record<string, TranslationResource> = {};

    // Chargement de tous les namespaces
    const namespaces = Object.values(TRANSLATION_NAMESPACES);
    
    const loadPromises = namespaces.map(async (namespace) => {
      try {
        const resource = await this.loadNamespaceResource(language, namespace);
        resources[namespace] = resource;
      } catch (error) {
        console.warn(`[TranslationLoader] Failed to load ${namespace} for ${language}:`, error);
        // Utilisation d'un objet vide en cas d'échec
        resources[namespace] = {};
      }
    });

    await Promise.all(loadPromises);
    return resources;
  }

  /**
   * Charge une ressource spécifique pour un namespace et une langue
   */
  public async loadNamespaceResource(
    language: SupportedLanguage,
    namespace: string
  ): Promise<TranslationResource> {
    const cacheKey = `${language}:${namespace}`;

    // Vérification du cache
    if (this.cache[language]?.[namespace]) {
      return this.cache[language][namespace];
    }

    // Vérification des promesses en cours
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Création de la promesse de chargement
    const loadingPromise = this.performResourceLoad(language, namespace);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const resource = await loadingPromise;
      
      // Mise en cache
      if (!this.cache[language]) {
        this.cache[language] = {};
      }
      this.cache[language][namespace] = resource;

      return resource;
      
    } finally {
      // Nettoyage de la promesse
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Charge physiquement le fichier de traduction
   */
  private async performResourceLoad(
    language: SupportedLanguage,
    namespace: string
  ): Promise<TranslationResource> {
    try {
      // Import dynamique du fichier de traduction
      const resource = await this.importTranslationFile(language, namespace);
      
      // Validation de la ressource
      this.validateResource(resource, language, namespace);
      
      return resource;
      
    } catch (error) {
      console.error(`[TranslationLoader] Error loading ${namespace}/${language}:`, error);
      throw error;
    }
  }

  /**
   * Importe dynamiquement un fichier de traduction
   */
  private async importTranslationFile(
    language: SupportedLanguage,
    namespace: string
  ): Promise<TranslationResource> {
    // Timeout pour éviter les chargements trop longs
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Translation loading timeout for ${language}/${namespace}`));
      }, TIMEOUTS.TRANSLATION_LOAD);
    });

    const loadPromise = this.getTranslationModule(language, namespace);

    const module = await Promise.race([loadPromise, timeoutPromise]);
    return module.default || module;
  }

  /**
   * Récupère le module de traduction via import dynamique
   */
  private async getTranslationModule(
    language: SupportedLanguage,
    namespace: string
  ): Promise<any> {
    try {
      // Import du module de langue complet puis extraction du namespace
      switch (language) {
        case 'fr':
          const frModule = await import('../translations/fr');
          return { default: (frModule as any)[namespace] || {} };
        case 'en':
          const enModule = await import('../translations/en');
          return { default: (enModule as any)[namespace] || {} };
        case 'es':
          const esModule = await import('../translations/es');
          return { default: (esModule as any)[namespace] || {} };
        case 'de':
          const deModule = await import('../translations/de');
          return { default: (deModule as any)[namespace] || {} };
        case 'it':
          const itModule = await import('../translations/it');
          return { default: (itModule as any)[namespace] || {} };
        default:
          throw new Error(`Language not supported: ${language}`);
      }
    } catch (error) {
      // Fallback: retourne un objet vide si le fichier n'existe pas
      console.warn(`[TranslationLoader] Module ${language}/${namespace} not found, using empty resource`);
      return { default: {} };
    }
  }

  /**
   * Valide la structure d'une ressource de traduction
   */
  private validateResource(
    resource: any,
    language: SupportedLanguage,
    namespace: string
  ): void {
    if (!resource || typeof resource !== 'object') {
      throw new Error(`Invalid translation resource for ${language}/${namespace}: not an object`);
    }

    // Validation récursive des clés
    this.validateResourceKeys(resource, `${language}/${namespace}`);
  }

  /**
   * Valide récursivement les clés d'une ressource
   */
  private validateResourceKeys(obj: any, path: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = `${path}.${key}`;
      
      if (typeof value === 'string') {
        // Validation des chaînes de caractères
        if (value.trim() === '') {
          console.warn(`[TranslationLoader] Empty translation at ${currentPath}`);
        }
      } else if (typeof value === 'object' && value !== null) {
        // Validation récursive des objets
        this.validateResourceKeys(value, currentPath);
      } else {
        console.warn(`[TranslationLoader] Invalid value type at ${currentPath}: ${typeof value}`);
      }
    }
  }

  /**
   * Vide le cache des traductions
   */
  public clearCache(): void {
    this.cache = {};
    this.loadingPromises.clear();
  }

  /**
   * Récupère les statistiques du cache
   */
  public getCacheStats(): {
    languages: number;
    namespaces: number;
    totalKeys: number;
  } {
    const languages = Object.keys(this.cache).length;
    let namespaces = 0;
    let totalKeys = 0;

    Object.values(this.cache).forEach(languageCache => {
      namespaces += Object.keys(languageCache).length;
      Object.values(languageCache).forEach(resource => {
        totalKeys += this.countKeys(resource);
      });
    });

    return { languages, namespaces, totalKeys };
  }

  /**
   * Compte récursivement le nombre de clés dans une ressource
   */
  private countKeys(obj: any): number {
    let count = 0;
    
    for (const value of Object.values(obj)) {
      if (typeof value === 'string') {
        count++;
      } else if (typeof value === 'object' && value !== null) {
        count += this.countKeys(value);
      }
    }
    
    return count;
  }
}