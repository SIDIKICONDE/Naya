/**
 * Exemples d'utilisation du système i18n
 * Démontre les différentes fonctionnalités disponibles
 */

import React from 'react';
import { View, Text, Button } from 'react-native';
import { 
  useTranslation, 
  useCurrencyFormatter, 
  useDateFormatter
} from '../hooks';
import { useI18nContext } from '../hooks/useI18nContext';

/**
 * Exemple de base avec traductions simples
 */
export const BasicTranslationExample: React.FC = () => {
  const { t } = useTranslation('common');
  
  return (
    <View>
      <Text>{t('actions.save')}</Text>
      <Text>{t('actions.cancel')}</Text>
      <Text>{t('status.loading')}</Text>
    </View>
  );
};

/**
 * Exemple avec namespace spécifique (audio)
 */
export const AudioTranslationExample: React.FC = () => {
  const { t } = useTranslation('audio');
  
  return (
    <View>
      <Text>{t('modules.reverb')}</Text>
      <Text>{t('parameters.gain')}</Text>
      <Text>{t('presets.load')}</Text>
    </View>
  );
};

/**
 * Exemple avec interpolation de variables
 */
export const InterpolationExample: React.FC = () => {
  const { t } = useTranslation('forms');
  
  const userName = 'Jean Dupont';
  const itemCount = 42;
  
  return (
    <View>
      <Text>{t('validation.minLength', { count: 8 })}</Text>
      <Text>{t('validation.maxLength', { count: 100 })}</Text>
    </View>
  );
};

/**
 * Exemple de formatage des devises
 */
export const CurrencyFormattingExample: React.FC = () => {
  const { format, formatCompact, formatAmount } = useCurrencyFormatter();
  
  return (
    <View>
      <Text>Prix normal: {format(1234.56, 'EUR')}</Text>
      <Text>Prix compact: {formatCompact(1000000, 'USD')}</Text>
      <Text>Montant seul: {formatAmount(99.99)}</Text>
    </View>
  );
};

/**
 * Exemple de formatage des dates
 */
export const DateFormattingExample: React.FC = () => {
  const { formatPreset, formatRelative, formatDuration } = useDateFormatter();
  
  const now = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  return (
    <View>
      <Text>Date courte: {formatPreset(now, 'short')}</Text>
      <Text>Date longue: {formatPreset(now, 'long')}</Text>
      <Text>Relatif: {formatRelative(yesterday)}</Text>
      <Text>Durée: {formatDuration(now, nextWeek)}</Text>
    </View>
  );
};

/**
 * Exemple de changement de langue
 */
export const LanguageSwitcherExample: React.FC = () => {
  const { language, setLanguage, isLoading } = useI18nContext();
  
  const handleLanguageChange = async (newLanguage: 'fr' | 'en' | 'es' | 'de' | 'it') => {
    try {
      await setLanguage(newLanguage);
    } catch (error) {
      console.error('Erreur changement de langue:', error);
    }
  };
  
  return (
    <View>
      <Text>Langue actuelle: {language}</Text>
      <Text>Chargement: {isLoading ? 'Oui' : 'Non'}</Text>
      
      <Button 
        title="Français" 
        onPress={() => handleLanguageChange('fr')}
        disabled={language === 'fr' || isLoading}
      />
      <Button 
        title="English" 
        onPress={() => handleLanguageChange('en')}
        disabled={language === 'en' || isLoading}
      />
      <Button 
        title="Español" 
        onPress={() => handleLanguageChange('es')}
        disabled={language === 'es' || isLoading}
      />
    </View>
  );
};

/**
 * Exemple avec gestion d'erreurs
 */
export const ErrorHandlingExample: React.FC = () => {
  const { t, error, missingKeys } = useTranslation('common');
  
  return (
    <View>
      {error && (
        <Text style={{ color: 'red' }}>
          Erreur i18n: {error}
        </Text>
      )}
      
      {missingKeys.length > 0 && (
        <View>
          <Text>Clés manquantes:</Text>
          {missingKeys.map((key, index) => (
            <Text key={index} style={{ color: 'orange' }}>
              - {key}
            </Text>
          ))}
        </View>
      )}
      
      <Text>{t('actions.save')}</Text>
      <Text>{t('key.that.does.not.exist', { defaultValue: 'Valeur par défaut' })}</Text>
    </View>
  );
};

/**
 * Exemple complet combinant plusieurs fonctionnalités
 */
export const CompleteExample: React.FC = () => {
  const { t } = useTranslation('audio');
  const { format: formatCurrency } = useCurrencyFormatter();
  const { formatPreset } = useDateFormatter();
  const { language, setLanguage } = useI18nContext();
  
  const presetPrice = 29.99;
  const lastModified = new Date();
  
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        {t('presets.load')}
      </Text>
      
      <Text>
        {t('modules.reverb')} - {formatCurrency(presetPrice, 'EUR')}
      </Text>
      
      <Text>
        Modifié le {formatPreset(lastModified, 'medium')}
      </Text>
      
      <Text>
        Langue: {language}
      </Text>
      
      <View style={{ marginTop: 10 }}>
        <Button
          title={t('actions.save')}
          onPress={() => {
            // Logique de sauvegarde
            console.log('Preset sauvegardé');
          }}
        />
      </View>
    </View>
  );
};

/**
 * Exemple d'optimisation des performances
 */
export const PerformanceExample: React.FC = () => {
  // Utilisation avec namespace et préfixe pour optimiser
  const { t: tAudio } = useTranslation('audio', { keyPrefix: 'modules' });
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'actions' });
  
  return (
    <View>
      <Text>{tAudio('reverb')}</Text>
      <Text>{tAudio('compressor')}</Text>
      <Text>{tCommon('save')}</Text>
      <Text>{tCommon('cancel')}</Text>
    </View>
  );
};

// Export de tous les exemples pour faciliter les tests
export const I18nExamples = {
  BasicTranslationExample,
  AudioTranslationExample,
  InterpolationExample,
  CurrencyFormattingExample,
  DateFormattingExample,
  LanguageSwitcherExample,
  ErrorHandlingExample,
  CompleteExample,
  PerformanceExample,
};