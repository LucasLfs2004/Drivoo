import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../shared/ui/base/Card';
import { Button } from '../../shared/ui/base/Button';
import { theme } from '../../themes';

export const AdminUsersScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Usuários</Text>
          <Text style={styles.subtitle}>
            Gerencie alunos da plataforma
          </Text>
        </View>

        <Card style={styles.filtersCard}>
          <View style={styles.filterButtons}>
            <Button
              title="Todos"
              variant="primary"
              size="sm"
              style={styles.filterButton}
            />
            <Button
              title="Ativos"
              variant="outline"
              size="sm"
              style={styles.filterButton}
            />
            <Button
              title="Inativos"
              variant="outline"
              size="sm"
              style={styles.filterButton}
            />
          </View>
        </Card>

        <View style={styles.usersSection}>
          <Card style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum usuário encontrado</Text>
            <Text style={styles.emptyMessage}>
              Os usuários aparecerão aqui quando se registrarem
            </Text>
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
  filtersCard: {
    marginBottom: theme.spacing.lg,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
  },
  usersSection: {
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
  },
});