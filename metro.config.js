const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Configuration Metro minimale et fonctionnelle
 */
const config = {
  // Extensions de base nécessaires
  resolver: {
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
