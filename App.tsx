import React from 'react';
import {
  StatusBar,
  useColorScheme,
} from 'react-native';

import { EqualizerScreen } from './src/screens/EqualizerScreen';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#F0F0F0"
      />
      <EqualizerScreen />
    </>
  );
}

export default App;