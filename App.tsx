/**
 * Application audio professionnelle
 * Interface audio complète et fonctionnelle avec support du thème système
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme/providers/ThemeProvider';
import { AudioInterfaceView } from './src/components/audio/AudioInterfaceView';
import FFmpegTestComponent from './src/components/audio/FFmpegTestComponent';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <>
      <StatusBar
        barStyle={theme.colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <FFmpegTestComponent />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;