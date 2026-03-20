import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '../../core/auth';
import { queryClient } from '../../services/queries/queryClient';
import { STRIPE_PUBLISHABLE_KEY } from '../../services/stripeService';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.com.drivoo"
        urlScheme="drivoo"
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
};
