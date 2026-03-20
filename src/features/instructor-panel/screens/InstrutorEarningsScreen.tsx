import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { theme } from '../../../theme';
import { formatCurrency } from '../../../utils/currency';

dayjs.locale('pt-br');

interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  studentName: string;
  status: 'pending' | 'completed' | 'failed';
}

interface MonthlyEarnings {
  month: string;
  value: number;
  label: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

// Mock data para demonstração
const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: '1',
    date: dayjs().subtract(2, 'day').toDate(),
    amount: 150,
    studentName: 'Maria Silva',
    status: 'completed',
  },
  {
    id: '2',
    date: dayjs().subtract(5, 'day').toDate(),
    amount: 200,
    studentName: 'João Santos',
    status: 'completed',
  },
  {
    id: '3',
    date: dayjs().subtract(7, 'day').toDate(),
    amount: 150,
    studentName: 'Ana Costa',
    status: 'completed',
  },
  {
    id: '4',
    date: dayjs().subtract(10, 'day').toDate(),
    amount: 180,
    studentName: 'Pedro Oliveira',
    status: 'completed',
  },
];

const generateMonthlyData = (): MonthlyEarnings[] => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = dayjs().subtract(i, 'month');
    const value = Math.floor(Math.random() * 2000) + 500;
    months.push({
      month: date.format('MMM'),
      value,
      label: date.format('MMM'),
    });
  }
  return months;
};

export const InstrutorEarningsScreen: React.FC = () => {
  const [payments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [monthlyData] = useState<MonthlyEarnings[]>(generateMonthlyData());

  const currentMonthEarnings = payments
    .filter(p =>
      dayjs(p.date).isSame(dayjs(), 'month') && p.status === 'completed'
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const totalEarnings = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const availableForPayout = totalEarnings * 0.85; // 85% após taxa da plataforma

  const barData = monthlyData.map(item => ({
    value: item.value,
    label: item.label,
    frontColor: theme.colors.primary[500],
    spacing: 2,
  }));

  const lineData = monthlyData.map(item => ({
    value: item.value,
    dataPointText: formatCurrency(item.value),
  }));

  const renderPaymentItem = (payment: PaymentRecord) => {
    const statusColors = {
      completed: theme.colors.success[500],
      pending: theme.colors.warning[500],
      failed: theme.colors.semantic.error,
    };

    const statusLabels = {
      completed: 'Concluído',
      pending: 'Pendente',
      failed: 'Falhou',
    };

    return (
      <View key={payment.id} style={styles.paymentItem}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentStudent}>{payment.studentName}</Text>
          <Text style={styles.paymentDate}>
            {dayjs(payment.date).format('DD/MM/YYYY')}
          </Text>
        </View>
        <View style={styles.paymentRight}>
          <Text style={styles.paymentAmount}>
            {formatCurrency(payment.amount)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[payment.status] + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusColors[payment.status] },
              ]}
            >
              {statusLabels[payment.status]}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Ganhos</Text>
          <Text style={styles.subtitle}>
            Acompanhe seus rendimentos e histórico
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {formatCurrency(currentMonthEarnings)}
            </Text>
            <Text style={styles.summaryLabel}>Este Mês</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalEarnings)}
            </Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Ganhos por Mês</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={barData}
              width={SCREEN_WIDTH - theme.spacing.lg * 4}
              height={220}
              barWidth={32}
              spacing={24}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{
                color: theme.colors.text.secondary,
                fontSize: 12,
              }}
              noOfSections={4}
              maxValue={Math.max(...monthlyData.map(d => d.value)) * 1.2}
              isAnimated
              animationDuration={800}
            />
          </View>
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Tendência de Ganhos</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={lineData}
              width={SCREEN_WIDTH - theme.spacing.lg * 4}
              height={200}
              spacing={60}
              color={theme.colors.primary[500]}
              thickness={3}
              startFillColor={theme.colors.primary[50]}
              endFillColor={theme.colors.primary[50]}
              startOpacity={0.4}
              endOpacity={0.1}
              initialSpacing={10}
              noOfSections={4}
              yAxisColor={theme.colors.border.light}
              xAxisColor={theme.colors.border.light}
              yAxisTextStyle={{
                color: theme.colors.text.secondary,
                fontSize: 12,
              }}
              hideDataPoints={false}
              dataPointsColor={theme.colors.primary[500]}
              dataPointsRadius={6}
              textShiftY={-8}
              textShiftX={-10}
              textFontSize={10}
              textColor={theme.colors.text.secondary}
              isAnimated
              animationDuration={1000}
            />
          </View>
        </Card>

        <Card style={styles.recentPayments}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pagamentos Recentes</Text>
          </View>
          {payments.length > 0 ? (
            <View style={styles.paymentsList}>
              {payments.slice(0, 5).map(renderPaymentItem)}
            </View>
          ) : (
            <Text style={styles.noPayments}>
              Nenhum pagamento recebido ainda
            </Text>
          )}
        </Card>

        <Card style={styles.payoutCard}>
          <Text style={styles.sectionTitle}>Saque Disponível</Text>
          <View style={styles.payoutInfo}>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Total de ganhos:</Text>
              <Text style={styles.payoutValue}>
                {formatCurrency(totalEarnings)}
              </Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Taxa da plataforma (15%):</Text>
              <Text style={styles.payoutValue}>
                -{formatCurrency(totalEarnings * 0.15)}
              </Text>
            </View>
            <View style={[styles.payoutRow, styles.payoutTotal]}>
              <Text style={styles.payoutTotalLabel}>Disponível:</Text>
              <Text style={styles.payoutTotalValue}>
                {formatCurrency(availableForPayout)}
              </Text>
            </View>
          </View>
          <Button
            title="Solicitar Saque"
            variant="primary"
            disabled={availableForPayout === 0}
            style={styles.payoutButton}
          />
          <Text style={styles.payoutNote}>
            Os saques são processados em até 2 dias úteis
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
  chartContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
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
  paymentsList: {
    gap: theme.spacing.sm,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentStudent: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  paymentDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success[500],
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borders.radius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  noPayments: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    fontStyle: 'italic',
  },
  payoutCard: {
    marginBottom: theme.spacing.xl,
  },
  payoutInfo: {
    marginBottom: theme.spacing.lg,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  payoutLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  payoutValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  payoutTotal: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  payoutTotalLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  payoutTotalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success[500],
  },
  payoutButton: {
    marginBottom: theme.spacing.md,
  },
  payoutNote: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});