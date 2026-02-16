import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { theme } from '../../themes';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AlunoTabParamList } from '../../types/navigation';

type NavigationProp = BottomTabNavigationProp<AlunoTabParamList>;

export const AlunoBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleSearchInstructorsPress = () => {
    navigation.navigate('Search', { screen: 'SearchScreen' });
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Aulas</Text>
          <Text style={styles.subtitle}>
            Gerencie seus agendamentos
          </Text>
        </View>

        <View style={styles.tabsContainer}>
          <Button
            title="Próximas"
            variant="primary"
            size="sm"
            style={styles.tabButton}
          />
          <Button
            title="Concluídas"
            variant="outline"
            size="sm"
            style={styles.tabButton}
          />
          <Button
            title="Canceladas"
            variant="outline"
            size="sm"
            style={styles.tabButton}
          />
        </View>

        <View style={styles.bookingsSection}>
          <Card style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhuma aula agendada</Text>
            <Text style={styles.emptyMessage}>
              Que tal agendar sua primeira aula?
            </Text>
            <Button
              title="Buscar Instrutores"
              variant="primary"
              style={styles.searchButton}
              onPress={handleSearchInstructorsPress}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  tabButton: {
    flex: 1,
  },
  bookingsSection: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  searchButton: {
    minWidth: 200,
  },
});