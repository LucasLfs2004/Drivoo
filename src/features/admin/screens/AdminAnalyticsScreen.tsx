import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../shared/ui/base/Card';
import { theme } from '../../../theme';

export const AdminAnalyticsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>
            Visão geral da plataforma
          </Text>
        </View>

        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>0</Text>
            <Text style={styles.metricLabel}>Usuários Ativos</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>0</Text>
            <Text style={styles.metricLabel}>Instrutores</Text>
          </Card>
        </View>

        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>0</Text>
            <Text style={styles.metricLabel}>Aulas Hoje</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>R$ 0</Text>
            <Text style={styles.metricLabel}>Receita Mês</Text>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Crescimento de Usuários</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>
              Gráfico de crescimento aparecerá aqui
            </Text>
          </View>
        </Card>

        <Card style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <Text style={styles.noActivity}>
            Nenhuma atividade recente
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
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  metricValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.xs,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  recentActivity: {
    marginBottom: theme.spacing.lg,
  },
  noActivity: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    fontStyle: 'italic',
  },
});