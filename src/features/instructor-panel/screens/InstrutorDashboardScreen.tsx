import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { useAuth } from '../../../core/auth';
import { theme } from '../../../theme';
import { formatCurrency } from '../../../utils/currency';
import {
  useInstructorEarningsOverviewQuery,
  useInstructorScheduleQuery,
  useMyInstructorProfileQuery,
} from '../../instructors';

interface NavigationLike {
  navigate: (screen: string, params?: unknown) => void;
  getParent?: () => NavigationLike | undefined;
}

interface Props {
  navigation: NavigationLike;
}

export const InstrutorDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { usuario } = useAuth();
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: hasProfileError,
    refetch: refetchProfile,
  } = useMyInstructorProfileQuery();
  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    isError: hasScheduleError,
    refetch: refetchSchedule,
  } = useInstructorScheduleQuery();
  const {
    data: earningsData,
    isLoading: isLoadingEarnings,
    isError: hasEarningsError,
    refetch: refetchEarnings,
  } = useInstructorEarningsOverviewQuery();

  const isLoading = isLoadingProfile || isLoadingSchedule || isLoadingEarnings;
  const hasError = hasProfileError || hasScheduleError || hasEarningsError;

  const availabilitySummary = useMemo(() => {
    const availabilities = scheduleData?.availabilities ?? [];
    const activeAvailabilities = availabilities.filter(item => item.active);
    const dayIndexes = new Set(activeAvailabilities.map(item => item.dayIndex));

    const nextAvailableDay = activeAvailabilities[0]?.dayName;

    return {
      activeDays: dayIndexes.size,
      activeSlots: activeAvailabilities.length,
      nextAvailableDay,
      hasAvailability: activeAvailabilities.length > 0,
    };
  }, [scheduleData?.availabilities]);

  const instructorName =
    profile?.primeiroNome ?? usuario?.perfil?.primeiroNome ?? 'Instrutor';

  const handleNavigateToTab = (tabName: string, nestedScreen?: string) => {
    const parentNavigator = navigation.getParent?.();
    if (!parentNavigator) {
      return;
    }

    parentNavigator.navigate(
      tabName,
      nestedScreen ? { screen: nestedScreen } : undefined
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Carregando dashboard do instrutor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasError || !profile || !scheduleData || !earningsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Nao foi possível carregar sua dashboard.</Text>
          <Button
            title="Tentar novamente"
            variant="outline"
            onPress={async () => {
              await Promise.all([
                refetchProfile(),
                refetchSchedule(),
                refetchEarnings(),
              ]);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, {instructorName}
          </Text>
          <Text style={styles.subtitle}>
            Sua visão rápida de disponibilidade, ganhos e pontos ainda pendentes de integração.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{availabilitySummary.activeDays}</Text>
            <Text style={styles.statLabel}>Dias Disponíveis</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatCurrency(earningsData.currentMonthEarnings)}
            </Text>
            <Text style={styles.statLabel}>Ganhos do Mês</Text>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{availabilitySummary.activeSlots}</Text>
            <Text style={styles.statLabel}>Slots Ativos</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatCurrency(earningsData.paymentSummary.totalPending)}
            </Text>
            <Text style={styles.statLabel}>Pagamentos Pendentes</Text>
          </Card>
        </View>

        <Card style={styles.todaySchedule}>
          <Text style={styles.sectionTitle}>Disponibilidade Atual</Text>
          {availabilitySummary.hasAvailability ? (
            <>
              <Text style={styles.infoText}>
                Você está com {availabilitySummary.activeDays} dia(s) e{' '}
                {availabilitySummary.activeSlots} faixa(s) de horário ativos.
              </Text>
              <Text style={styles.helperText}>
                Próximo dia configurado: {availabilitySummary.nextAvailableDay ?? 'Indisponível'}
              </Text>
            </>
          ) : (
            <Text style={styles.noSchedule}>
              Você ainda não configurou sua disponibilidade semanal.
            </Text>
          )}
          <Button
            title="Ver Agenda Completa"
            variant="outline"
            size="sm"
            onPress={() => handleNavigateToTab('Schedule', 'ScheduleScreen')}
            style={styles.scheduleButton}
          />
        </Card>

        <Card style={styles.integrationCard}>
          <Text style={styles.sectionTitle}>Aulas e Agenda</Text>
          <Text style={styles.integrationTitle}>Integração de API pendente</Text>
          <Text style={styles.integrationText}>
            Este bloco já está estruturado para receber aulas de hoje, próxima aula,
            aulas da semana e aulas do mês assim que o backend expuser esses dados.
          </Text>
          <View style={styles.pendingGrid}>
            <View style={styles.pendingChip}>
              <Text style={styles.pendingChipLabel}>Aulas Hoje</Text>
              <Text style={styles.pendingChipValue}>Aguardando API</Text>
            </View>
            <View style={styles.pendingChip}>
              <Text style={styles.pendingChipLabel}>Próxima Aula</Text>
              <Text style={styles.pendingChipValue}>Aguardando API</Text>
            </View>
            <View style={styles.pendingChip}>
              <Text style={styles.pendingChipLabel}>Aulas Semana</Text>
              <Text style={styles.pendingChipValue}>Aguardando API</Text>
            </View>
            <View style={styles.pendingChip}>
              <Text style={styles.pendingChipLabel}>Aulas Mês</Text>
              <Text style={styles.pendingChipValue}>Aguardando API</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionButtons}>
            <Button
              title="Definir Disponibilidade"
              variant="primary"
              onPress={() => handleNavigateToTab('Schedule', 'ScheduleScreen')}
              style={styles.actionButton}
            />
            <Button
              title="Ver Ganhos"
              variant="outline"
              onPress={() => handleNavigateToTab('Earnings', 'EarningsScreen')}
              style={styles.actionButton}
            />
          </View>
        </Card>

        <Card style={styles.recentBookings}>
          <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Total pago:</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(earningsData.paymentSummary.totalPaid)}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>No histórico:</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(earningsData.totalEarnings)}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Registros:</Text>
            <Text style={styles.financialValue}>
              {earningsData.historyCount}
            </Text>
          </View>
        </Card>

        <Card style={styles.recentBookings}>
          <Text style={styles.sectionTitle}>Solicitações Recentes</Text>
          <Text style={styles.noBookings}>
            Este bloco depende da futura integração de aulas e agendamentos.
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
  infoText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  scheduleButton: {
    alignSelf: 'center',
  },
  integrationCard: {
    marginBottom: theme.spacing.lg,
  },
  integrationTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.warning[500],
    marginBottom: theme.spacing.sm,
  },
  integrationText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  pendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  pendingChip: {
    flexBasis: '47%',
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.md,
    backgroundColor: theme.colors.background.secondary,
  },
  pendingChipLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  pendingChipValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
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
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  financialLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  financialValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  noBookings: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    fontStyle: 'italic',
  },
});
