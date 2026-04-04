import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginScreen,
  RegisterScreen,
  OnboardingScreen,
  ForgotPasswordScreen,
} from '../features/auth';
import { useAuth } from '../core/auth';
import type { AuthStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStackNavigator: React.FC = () => {
  const { isAuthenticated, needsOnboarding } = useAuth();

  return (
    <Stack.Navigator
      key={needsOnboarding ? 'onboarding' : 'auth'}
      initialRouteName={isAuthenticated && needsOnboarding ? 'Onboarding' : 'Login'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
