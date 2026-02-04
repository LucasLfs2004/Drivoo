import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { theme } from '../../themes';

export const InstrutorEarningsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Ganhos</Text>
          <Text style={styles.subtitle}>
            Acompanhe seus rendimentos
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>R$ 0,00</Text>
            <Text style={styles.summaryLabel}>Este Mês</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>R$ 0,00</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Ganhos por Mês</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>
              Gráfico de ganhos aparecerá aqui
            </Text>
          </View>
        </Card>

        <Card style={styles.recentPayments}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pagamentos Recentes</Text>
            <Button
              title="Ver Todos"
              variant="ghost"
              size="sm"
            />
          </View>
          <Text style={styles.noPayments}>
            Nenhum pagamento recebido ainda
          </Text>
        </Card>

        <Card style={styles.payoutCard}>
          <Text style={styles.sectionTitle}>Saque</Text>
          <Text style={styles.payoutText}>
            Disponível para saque: R$ 0,00
          </Text>
          <Button
            title="Solicitar Saque"
            variant="primary"
            disabled
            style={styles.payoutButton}
          />
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
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success[500],
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
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
  recentPayments: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  noPayments: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    fontStyle: 'italic',
  },
  payoutCard: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  payoutText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  payoutButton: {
    minWidth: 200,
  },
});