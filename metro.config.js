const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration optimisée pour TurboModules et performances
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // 🚀 Configuration des résolveurs
  resolver: {
    // Extensions de fichiers supportées
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'cpp', 'h', 'mm'],
    
    // Extensions d'assets
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'ttf', 'otf', 'woff', 'woff2'],
    
    // Alias pour faciliter les imports
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@specs': path.resolve(__dirname, 'specs'),
      '@native': path.resolve(__dirname, 'src/native'),
    },
    
    // Plateformes supportées
    platforms: ['ios', 'android', 'native', 'web'],
  },

  // 📁 Configuration des dossiers à surveiller
  watchFolders: [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'specs'),
  ],

  // ⚡ Optimisations des transformations
  transformer: {
    // Support des nouveaux formats JS
    unstable_allowRequireContext: true,
    
    // Options Babel optimisées
    babelTransformerPath: require.resolve('@react-native/metro-babel-transformer'),
    
    // Optimisations pour les gros projets
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },

  // 🗂️ Configuration du cache
  cacheStores: [
    {
      name: 'FileStore',
      options: {
        root: path.join(__dirname, 'node_modules/.cache/metro'),
      },
    },
  ],

  // 🎯 Optimisations de performance
  server: {
    port: 8081,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Cache les assets statiques
        if (req.url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|ttf|otf|woff|woff2)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        return middleware(req, res, next);
      };
    },
  },

  // 🚫 Exclusions pour optimiser les performances
  resolver: {
    ...config.resolver,
    blockList: [
      // Ignorer les dossiers de build
      /ios\/build\/.*/,
      /android\/build\/.*/,
      /android\/app\/build\/.*/,
      
      // Ignorer les caches
      /node_modules\/.*\/build\/.*/,
      /\.git\/.*/,
      
      // Ignorer les fichiers temporaires
      /.*\/tmp\/.*/,
      /.*\/temp\/.*/,
      
      // Ignorer les tests dans la production
      /__tests__\/.*/,
      /.*\.test\.(js|jsx|ts|tsx)$/,
      /.*\.spec\.(js|jsx|ts|tsx)$/,
    ],
  },

  // 🏗️ Support pour TurboModules C++
  unstable_enablePackageExports: true,
  unstable_enableSymlinks: false,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
