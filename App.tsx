import React from 'react';
import { StatusBar } from 'react-native';

import { AppNavigation } from './src/app/navigation';
import { AppProviders } from './src/app/providers';
import { theme } from './src/theme';

function App(): React.JSX.Element {
  return (
    <AppProviders>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.primary}
      />
      <AppNavigation />
    </AppProviders>
  );
}

export default App;
