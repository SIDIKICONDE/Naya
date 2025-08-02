/**
 * Configuration des tests pour le module i18n
 */

// Mock pour AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock pour React Native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
    },
    NativeModules: {
      ...RN.NativeModules,
      SettingsManager: {
        settings: {
          AppleLanguages: ['fr-FR'],
          AppleLocale: 'fr_FR',
        },
      },
      I18nManager: {
        localeIdentifier: 'fr_FR',
        isRTL: false,
      },
    },
  };
});

// Mock pour i18next
jest.mock('i18next', () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockResolvedValue(undefined),
  changeLanguage: jest.fn().mockResolvedValue(undefined),
  t: jest.fn((key: string) => key),
  language: 'fr',
  isInitialized: true,
  addResourceBundle: jest.fn(),
  getResourceBundle: jest.fn(() => ({})),
}));

// Mock pour react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'fr',
      changeLanguage: jest.fn(),
    },
    ready: true,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Polyfill pour Intl si nécessaire
if (!globalThis.Intl) {
  globalThis.Intl = require('intl');
}

// Configuration globale des timeouts
jest.setTimeout(10000);