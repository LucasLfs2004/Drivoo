import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation';
import { linking } from './src/navigation/linking';
import { theme } from './src/themes';
import { STRIPE_PUBLISHABLE_KEY } from './src/services/stripeService';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.com.drivoo"
        urlScheme="drivoo"
      >
        <AuthProvider>
          <NavigationContainer linking={linking}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor={theme.colors.background.primary}
            />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}

export default App;