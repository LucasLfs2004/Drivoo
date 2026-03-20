import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../shared/ui/base/Card';
import { Button } from '../../shared/ui/base/Button';
import { useAuth } from '../../core/auth';
import { theme } from '../../themes';

export const InstrutorDashboardScreen: React.FC = () => {
  const { usuario } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, Instrutor {usuario?.perfil?.primeiroNome}! 👨‍🏫
          </Text>
          <Text style={styles.subtitle}>
            Gerencie suas aulas e alunos
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Aulas Hoje</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>R$ 0</Text>
            <Text style={styles.statLabel}>Ganhos Mês</Text>
          </Card>
        </View>

        <Card style={styles.todaySchedule}>
          <Text style={styles.sectionTitle}>Agenda de Hoje</Text>
          <Text style={styles.noSchedule}>
            Nenhuma aula agendada para hoje
          </Text>
          <Button
            title="Ver Agenda Completa"
            variant="outline"
            size="sm"
            style={styles.scheduleButton}
          />
        </Card>

        <Card style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionButtons}>
            <Button
              title="Definir Disponibilidade"
              variant="primary"
              style={styles.actionButton}
            />
            <Button
              title="Ver Ganhos"
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </Card>

        <Card style={styles.recentBookings}>
          <Text style={styles.sectionTitle}>Solicitações Recentes</Text>
          <Text style={styles.noBookings}>
            Nenhuma solicitação pendente
          </Text>
        </Card>
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
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  todaySchedule: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  noSchedule: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  scheduleButton: {
    alignSelf: 'center',
  },
  quickActions: {
    marginBottom: theme.spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  recentBookings: {
    marginBottom: theme.spacing.lg,
  },
  noBookings: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    fontStyle: 'italic',
  },
});