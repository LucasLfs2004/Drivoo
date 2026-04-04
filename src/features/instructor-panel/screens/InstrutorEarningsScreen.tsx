import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { theme } from '../../../theme';
import { formatCurrency } from '../../../utils/currency';
import { useInstructorEarningsOverviewQuery } from '../../instructors';

dayjs.locale('pt-br');

const SCREEN_WIDTH = Dimensions.get('window').width;

const statusColors = {
  paid: theme.colors.success[500],
  pending: theme.colors.warning[500],
  failed: theme.colors.semantic.error,
  unknown: theme.colors.text.secondary,
} as const;

const statusLabels = {
  paid: 'Pago',
  pending: 'Pendente',
  failed: 'Falhou',
  unknown: 'Sem status',
} as const;

const chartAxisTextStyle = {
  color: theme.colors.text.secondary,
  fontSize: 12,
} as const;

export const InstrutorEarningsScreen: React.FC = () => {
  const { data, isLoading, isError, refetch } = useInstructorEarningsOverviewQuery();

  const trendPoints = useMemo(() => data?.trend.points ?? [], [data?.trend.points]);
  const hasTrendData = trendPoints.length > 0;

  const chartMaxValue = useMemo(() => {
    if (!hasTrendData) {
      return 100;
    }

    return Math.max(...trendPoints.map(point => point.value), 0) * 1.2 || 100;
  }, [hasTrendData, trendPoints]);

  const barData = useMemo(
    () =>
      trendPoints.map(point => ({
        value: point.value,
        label: point.label,
        frontColor: theme.colors.primary[500],
        spacing: 2,
      })),
    [trendPoints]
  );

  const lineData = useMemo(
    () =>
      trendPoints.map(point => ({
        value: point.value,
        dataPointText: formatCurrency(point.value),
      })),
    [trendPoints]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Carregando ganhos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Nao foi possível carregar seus ganhos.</Text>
          <Button title="Tentar novamente" variant="outline" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Ganhos</Text>
          <Text style={styles.subtitle}>
            Acompanhe seus rendimentos e pagamentos com base nos dados reais da API.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {formatCurrency(data.currentMonthEarnings)}
            </Text>
            <Text style={styles.summaryLabel}>Este Mês</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {formatCurrency(data.totalEarnings)}
            </Text>
            <Text style={styles.summaryLabel}>Total em Histórico</Text>
          </Card>
        </View>

        <Card style={styles.summaryDetailsCard}>
          <Text style={styles.sectionTitle}>Resumo de Pagamentos</Text>
          <View style={styles.payoutInfo}>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Pagamentos listados:</Text>
              <Text style={styles.payoutValue}>{data.paymentSummary.totalCount}</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Total pago:</Text>
              <Text style={styles.payoutValue}>
                {formatCurrency(data.paymentSummary.totalPaid)}
              </Text>
            </View>
            <View style={[styles.payoutRow, styles.payoutTotal]}>
              <Text style={styles.payoutTotalLabel}>Total pendente:</Text>
              <Text style={styles.payoutTotalValue}>
                {formatCurrency(data.paymentSummary.totalPending)}
              </Text>
            </View>
          </View>
          <Text style={styles.payoutNote}>
            O backend ainda não expõe saldo para saque ou taxa de plataforma nesta área.
          </Text>
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Ganhos por Período</Text>
          {hasTrendData ? (
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
                yAxisTextStyle={chartAxisTextStyle}
                noOfSections={4}
                maxValue={chartMaxValue}
                isAnimated
                animationDuration={800}
              />
            </View>
          ) : (
            <Text style={styles.emptyChartText}>
              Ainda não há dados suficientes para montar o gráfico de ganhos.
            </Text>
          )}
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Tendência de Ganhos</Text>
          {hasTrendData ? (
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
                yAxisTextStyle={chartAxisTextStyle}
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
          ) : (
            <Text style={styles.emptyChartText}>
              A API ainda não entregou uma série histórica suficiente para esta visualização.
            </Text>
          )}
        </Card>

        <Card style={styles.recentPayments}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pagamentos Recentes</Text>
            <Text style={styles.sectionMeta}>
              {data.historyCount} registro(s) no histórico
            </Text>
          </View>
          {data.recentPayments.length > 0 ? (
            <View style={styles.paymentsList}>
              {data.recentPayments.slice(0, 5).map(payment => (
                <View key={payment.id} style={styles.paymentItem}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentStudent}>{payment.description}</Text>
                    <Text style={styles.paymentDate}>
                      {payment.date
                        ? dayjs(payment.date).format('DD/MM/YYYY')
                        : 'Data indisponível'}
                    </Text>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${statusColors[payment.status]}20` },
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
              ))}
            </View>
          ) : (
            <Text style={styles.noPayments}>
              Nenhum pagamento recente retornado pelo backend.
            </Text>
          )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.semantic.error,
    textAlign: 'center',
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
  summaryDetailsCard: {
    marginBottom: theme.spacing.lg,
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
  emptyChartText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    fontStyle: 'italic',
  },
  recentPayments: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionMeta: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
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
    paddingRight: theme.spacing.md,
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
  payoutInfo: {
    marginBottom: theme.spacing.md,
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
  payoutNote: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
