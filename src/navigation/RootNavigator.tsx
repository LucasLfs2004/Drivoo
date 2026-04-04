import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../core/auth';
import { AuthStackNavigator } from './AuthStackNavigator';
import { AlunoTabNavigator } from './AlunoTabNavigator';
import { InstrutorTabNavigator } from './InstrutorTabNavigator';
import { AdminDrawerNavigator } from './AdminDrawerNavigator';
import { theme } from '../theme';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, carregando, usuario, needsOnboarding } = useAuth();

  // Show loading screen while checking authentication
  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // If not authenticated, show auth stack
  if (!isAuthenticated || needsOnboarding || !usuario) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      </Stack.Navigator>
    );
  }

  // If authenticated, show appropriate navigator based on user role
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuario.papel === 'aluno' && (
        <Stack.Screen name="AlunoTabs" component={AlunoTabNavigator} />
      )}
      {usuario.papel === 'instrutor' && (
        <Stack.Screen name="InstrutorTabs" component={InstrutorTabNavigator} />
      )}
      {usuario.papel === 'admin' && (
        <Stack.Screen name="AdminDrawer" component={AdminDrawerNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
});
