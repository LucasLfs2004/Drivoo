import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation';
import { linking } from './src/navigation/linking';
import { theme } from './src/themes';
import { STRIPE_PUBLISHABLE_KEY } from './src/services/stripeService';
import { queryClient } from './src/services/queries/queryClient';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.com.drivoo"
        urlScheme="drivoo"
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NavigationContainer linking={linking}>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.colors.background.primary}
              />
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </QueryClientProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}

export default App;