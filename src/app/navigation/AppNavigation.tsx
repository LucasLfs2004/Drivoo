import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { linking } from './linking';
import { RootNavigator } from './RootNavigator';

export const AppNavigation: React.FC = () => {
  return (
    <NavigationContainer linking={linking}>
      <RootNavigator />
    </NavigationContainer>
  );
};
