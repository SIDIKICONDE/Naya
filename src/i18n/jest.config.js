/**
 * Configuration Jest pour les tests du module i18n
 */

module.exports = {
  preset: 'react-native',
  testMatch: ['**/__tests__/**/*.test.{js,ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/i18n/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/i18n/**/*.{ts,tsx}',
    '!src/i18n/**/*.d.ts',
    '!src/i18n/translations/**/*',
    '!src/i18n/examples/**/*',
    '!src/i18n/__tests__/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};