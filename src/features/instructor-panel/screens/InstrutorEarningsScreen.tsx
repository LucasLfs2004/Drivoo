import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  DollarSign,
  MapPin,
  RefreshCcw,
  Settings,
  TrendingUp,
  User,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../shared/ui/layout/Card';
import { Button } from '../../../shared/ui/primitives/Button';
import { theme } from '../../../theme';
import type { InstrutorEarningsStackParamList } from '../../../types/navigation';
import { formatCurrency } from '../../../utils/currency';
import {
  type InstructorFinancialRecentLesson,
  useInstructorFinancialSummaryQuery,
} from '../../instructors';

dayjs.locale('pt-br');

const SCREEN_WIDTH = Dimensions.get('window').width;
const DATE_FORMAT = 'YYYY-MM-DD';

const chartAxisTextStyle = {
  color: theme.colors.text.secondary,
  fontSize: 12,
} as const;

const statusBarColors = [
  theme.colors.primary[400],
  '#8B5CF6',
  theme.colors.success[500],
  theme.colors.semantic.error,
  theme.colors.warning[500],
  theme.colors.secondary[500],
];

type DatePickerTarget = 'start' | 'end';

type Props = NativeStackScreenProps<InstrutorEarningsStackParamList, 'EarningsScreen'>;

const buildDefaultPeriod = () => ({
  startDate: dayjs().subtract(29, 'day').format(DATE_FORMAT),
  endDate: dayjs().format(DATE_FORMAT),
});

const formatPeriodDate = (date: string) =>
  dayjs(date).isValid() ? dayjs(date).format('DD/MM/YYYY') : 'Selecionar';

export const InstrutorEarningsScreen: React.FC<Props> = ({ navigation }) => {
  const [period, setPeriod] = useState(buildDefaultPeriod);
  const [activeDatePicker, setActiveDatePicker] = useState<DatePickerTarget | null>(null);

  const summaryQueryParams = useMemo(
    () => ({
      data_inicio: period.startDate,
      data_fim: period.endDate,
      limite_aulas_recentes: 10,
    }),
    [period.endDate, period.startDate],
  );

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
    isRefetching: isSummaryRefetching,
  } = useInstructorFinancialSummaryQuery(summaryQueryParams);

  const evolutionPoints = useMemo(
    () => summary?.financialEvolution.points ?? [],
    [summary?.financialEvolution.points],
  );
  const hasEvolutionData = evolutionPoints.length > 0;
  const statusSummary = useMemo(
    () => summary?.lessonsByStatus.filter(item => item.count > 0) ?? [],
    [summary?.lessonsByStatus],
  );
  const hasStatusData = statusSummary.length > 0;

  const chartMaxValue = useMemo(() => {
    if (!hasEvolutionData) {
      return 100;
    }

    return Math.max(...evolutionPoints.map(point => point.accumulated), 0) * 1.2 || 100;
  }, [evolutionPoints, hasEvolutionData]);

  const barMaxValue = useMemo(() => {
    if (!hasStatusData) {
      return 4;
    }

    return Math.max(...statusSummary.map(item => item.count), 0) * 1.2 || 4;
  }, [hasStatusData, statusSummary]);

  const barData = useMemo(
    () =>
      statusSummary.map((item, index) => ({
        value: item.count,
        label: item.label,
        frontColor: statusBarColors[index % statusBarColors.length],
        spacing: 10,
      })),
    [statusSummary],
  );

  const lineData = useMemo(
    () =>
      evolutionPoints.map(point => ({
        value: point.accumulated,
        label: point.label,
      })),
    [evolutionPoints],
  );

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const target = activeDatePicker;
    setActiveDatePicker(null);

    if (event.type === 'dismissed' || !selectedDate || !target) {
      return;
    }

    const nextDate = dayjs(selectedDate).format(DATE_FORMAT);
    setPeriod(current => {
      if (target === 'start') {
        return {
          startDate: nextDate,
          endDate: dayjs(nextDate).isAfter(current.endDate) ? nextDate : current.endDate,
        };
      }

      return {
        startDate: dayjs(nextDate).isBefore(current.startDate) ? nextDate : current.startDate,
        endDate: nextDate,
      };
    });
  };

  if (isSummaryLoading && !summary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Carregando resumo financeiro...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isSummaryError || !summary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Não foi possível carregar seu resumo financeiro.</Text>
          <Button
            title="Tentar novamente"
            variant="outline"
            icon={RefreshCcw}
            onPress={() => refetchSummary()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const mainCards = [
    {
      label: 'Total Recebido',
      value: summary.amounts.completedInPeriod || summary.amounts.received,
      note: 'Aulas concluídas no período',
      tone: 'success',
      icon: DollarSign,
      variation: summary.amounts.completedVariationPercent,
    },
    {
      label: 'Disponível para Repasse',
      value: summary.amounts.availableForPayout,
      note: 'Pronto para transferência',
      tone: 'primary',
      icon: TrendingUp,
    },
    {
      label: 'A Liberar',
      value: summary.amounts.toRelease,
      note: 'Aguardando conclusão',
      tone: 'warning',
      icon: Clock3,
    },
    {
      label: 'Em Processamento',
      value: summary.amounts.processing,
      note: 'Em fluxo operacional',
      tone: 'forecast',
      icon: AlertCircle,
    },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentBody}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Meus Ganhos</Text>
          </View>
          <Button
            title="Configurar"
            variant="outline"
            size="sm"
            icon={Settings}
            onPress={() => navigation.navigate('FinancialSettings')}
          />
        </View>

        <Card style={styles.periodCard}>
          <View style={styles.periodHeader}>
            <View>
              <Text style={styles.sectionTitle}>Período</Text>
            </View>
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCcw}
              onPress={() => refetchSummary()}
              loading={isSummaryRefetching}
            />
          </View>

          <View style={styles.dateFilterRow}>
            <DateFilterButton
              label="Início"
              value={formatPeriodDate(period.startDate)}
              onPress={() => setActiveDatePicker('start')}
            />
            <DateFilterButton
              label="Fim"
              value={formatPeriodDate(period.endDate)}
              onPress={() => setActiveDatePicker('end')}
            />
          </View>
          <Text style={styles.periodSubtitle}>
            Padrão de últimos 30 dias. Altere para atualizar o resumo.
          </Text>
        </Card>

        {summary.isEmpty ? (
          <Card style={styles.emptyStateCard}>
            <Text style={styles.emptyTitle}>Sem movimento financeiro no período</Text>
            <Text style={styles.emptyText}>
              Quando houver aulas, pagamentos ou previsões neste intervalo, os valores aparecerão
              aqui separados por status.
            </Text>
          </Card>
        ) : null}

        <View style={styles.summaryStack}>
          {mainCards.map(card => (
            <FinancialAmountCard key={card.label} {...card} />
          ))}
        </View>

        <FutureLessonsCard
          count={summary.futureConfirmedLessons.count}
          amount={summary.futureConfirmedLessons.instructorAmount}
        />

        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Evolução Financeira</Text>
          {hasEvolutionData ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={lineData}
                width={SCREEN_WIDTH - theme.spacing.lg * 4}
                height={220}
                spacing={52}
                color={theme.colors.primary[400]}
                thickness={2}
                areaChart
                startFillColor={theme.colors.secondary[200]}
                endFillColor={theme.colors.background.elevated}
                startOpacity={0.55}
                endOpacity={0.1}
                initialSpacing={12}
                noOfSections={4}
                maxValue={chartMaxValue}
                yAxisColor={theme.colors.coolGray[500]}
                xAxisColor={theme.colors.coolGray[500]}
                yAxisTextStyle={chartAxisTextStyle}
                xAxisLabelTextStyle={chartAxisTextStyle}
                yAxisLabelPrefix="R$ "
                hideDataPoints
                rulesColor={theme.colors.coolGray[200]}
                rulesType="dashed"
                isAnimated
                animationDuration={900}
              />
            </View>
          ) : (
            <Text style={styles.emptyChartText}>
              Ainda não há dados suficientes para montar a evolução financeira.
            </Text>
          )}
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Resumo de Aulas do Período</Text>
          {hasStatusData ? (
            <View style={styles.chartContainer}>
              <BarChart
                data={barData}
                width={SCREEN_WIDTH - theme.spacing.lg * 4}
                height={220}
                barWidth={38}
                roundedTop
                roundedBottom
                xAxisThickness={1}
                yAxisThickness={1}
                xAxisColor={theme.colors.coolGray[500]}
                yAxisColor={theme.colors.coolGray[500]}
                yAxisTextStyle={chartAxisTextStyle}
                xAxisLabelTextStyle={chartAxisTextStyle}
                rulesColor={theme.colors.coolGray[200]}
                rulesType="dashed"
                noOfSections={4}
                maxValue={barMaxValue}
                isAnimated
                animationDuration={800}
              />
            </View>
          ) : (
            <Text style={styles.emptyChartText}>
              Ainda não há aulas no período para montar o resumo.
            </Text>
          )}
        </Card>

        <Card style={styles.recentLessons}>
          <Text style={[styles.sectionTitle, styles.recentLessonsTitle]}>Aulas Recentes</Text>
          {summary.recentLessons.length > 0 ? (
            <View style={styles.lessonsList}>
              {summary.recentLessons.map(lesson => (
                <RecentLessonRow key={lesson.id} lesson={lesson} />
              ))}
            </View>
          ) : (
            <Text style={styles.noPayments}>Nenhuma aula recente retornada pelo backend.</Text>
          )}
        </Card>

        {activeDatePicker ? (
          <DateTimePicker
            value={dayjs(activeDatePicker === 'start' ? period.startDate : period.endDate).toDate()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const DateFilterButton = ({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.dateButton} onPress={onPress} activeOpacity={0.8}>
    <CalendarDays color={theme.colors.primary[500]} size={18} />
    <View style={styles.dateButtonCopy}>
      <Text style={styles.dateButtonLabel}>{label}</Text>
      <Text style={styles.dateButtonValue}>{value}</Text>
    </View>
  </TouchableOpacity>
);

const FinancialAmountCard = ({
  label,
  value,
  note,
  tone,
  icon: Icon,
  variation,
}: {
  label: string;
  value: number;
  note: string;
  tone: 'success' | 'primary' | 'warning' | 'forecast' | 'neutral' | 'danger';
  icon: React.ComponentType<{ color?: string; size?: number }>;
  variation?: number;
}) => {
  const toneStyle = amountToneStyles[tone];
  const hasVariation = typeof variation === 'number' && Number.isFinite(variation);
  const variationColor =
    !hasVariation || variation === 0
      ? theme.colors.text.secondary
      : variation > 0
        ? theme.colors.success[600]
        : theme.colors.semantic.error;

  return (
    <Card style={styles.amountCard} variant="outlined">
      <View style={styles.amountCardHeader}>
        <View style={styles.amountCopy}>
          <Text style={styles.amountLabel}>{label}</Text>
          <Text style={styles.amountValue}>{formatCurrency(value)}</Text>
          <Text style={styles.amountNote}>{note}</Text>
          {hasVariation ? (
            <Text style={[styles.amountVariation, { color: variationColor }]}>
              {variation > 0 ? '↑ ' : variation < 0 ? '↓ ' : ''}
              {Math.abs(variation).toFixed(1)}% vs período anterior
            </Text>
          ) : null}
        </View>
        <View style={[styles.amountIconBox, { backgroundColor: toneStyle.background }]}>
          <Icon color={toneStyle.icon} size={32} />
        </View>
      </View>
    </Card>
  );
};

const FutureLessonsCard = ({ count, amount }: { count: number; amount: number }) => (
  <View style={styles.futureHeroCard}>
    <View style={styles.futureHeroLeft}>
      <View style={styles.futureHeroTitleRow}>
        <CalendarDays color={theme.colors.text.inverse} size={22} />
        <Text style={styles.futureHeroTitle}>Aulas Futuras{'\n'}Confirmadas</Text>
      </View>
      <Text style={styles.futureHeroSubtitle}>Previsão para o instrutor após conclusão</Text>
      <Text style={styles.futureHeroAmount}>{formatCurrency(amount)}</Text>
    </View>
    <View style={styles.futureHeroRight}>
      <Text style={styles.futureHeroCountLabel}>Aulas{'\n'}agendadas</Text>
      <Text style={styles.futureHeroCount}>{count}</Text>
    </View>
  </View>
);

const RecentLessonRow = ({ lesson }: { lesson: InstructorFinancialRecentLesson }) => {
  const dateLabel = dayjs(lesson.date).isValid()
    ? dayjs(lesson.date).format('DD/MM/YYYY')
    : 'Data indisponível';
  const statusColor = getLessonStatusColor(lesson.status);

  return (
    <View style={styles.lessonItem}>
      <View style={styles.lessonMain}>
        <View style={styles.lessonTitleRow}>
          <User color={theme.colors.coolGray[600]} size={18} />
          <Text style={styles.lessonStudent} numberOfLines={1}>
            {lesson.student.name}
          </Text>
          <View style={[styles.lessonStatusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.lessonStatusText, { color: statusColor }]}>
              {lesson.statusLabel}
            </Text>
          </View>
        </View>
        <View style={styles.lessonMetaRow}>
          <CalendarDays color={theme.colors.coolGray[700]} size={18} />
          <Text style={styles.lessonMetaText}>{dateLabel}</Text>
          <Clock3 color={theme.colors.coolGray[700]} size={18} />
          <Text style={styles.lessonMetaText}>{lesson.startTime || '--:--'}</Text>
        </View>
        <View style={styles.lessonMetaRow}>
          <MapPin color={theme.colors.coolGray[700]} size={18} />
          <Text style={styles.lessonMetaText} numberOfLines={1}>
            {lesson.location.summary}
          </Text>
        </View>
      </View>
      <View style={styles.lessonAmountBlock}>
        <Text style={styles.lessonAmount}>{formatCurrency(lesson.instructorAmount)}</Text>
        <Text style={styles.lessonAmountLabel}>Seu valor</Text>
      </View>
    </View>
  );
};

const getLessonStatusColor = (status: string) => {
  const normalized = status.trim().toUpperCase();

  if (['CONCLUIDA', 'CONCLUIDO', 'COMPLETED'].includes(normalized)) {
    return theme.colors.success[600];
  }

  if (['CANCELADA', 'CANCELADO', 'CANCELED'].includes(normalized)) {
    return theme.colors.semantic.error;
  }

  if (['NAO_COMPARECEU', 'NO_SHOW'].includes(normalized)) {
    return theme.colors.warning[700];
  }

  return theme.colors.primary[600];
};

const amountToneStyles = {
  success: {
    icon: theme.colors.success[600],
    background: theme.colors.success[100],
  },
  primary: {
    icon: theme.colors.primary[500],
    background: theme.colors.primary[100],
  },
  warning: {
    icon: theme.colors.warning[700],
    background: theme.colors.warning[100],
  },
  forecast: {
    icon: '#8A1CFF',
    background: '#F0DFFF',
  },
  neutral: {
    icon: theme.colors.text.secondary,
    background: theme.colors.background.tertiary,
  },
  danger: {
    icon: theme.colors.semantic.error,
    background: '#FEE2E2',
  },
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  contentBody: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  periodCard: {
    gap: theme.spacing.sm,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  periodSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  dateButton: {
    flex: 1,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
  },
  dateButtonCopy: {
    flex: 1,
    gap: 2,
  },
  dateButtonLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
  },
  dateButtonValue: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptyStateCard: {
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.background.secondary,
  },
  emptyTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  summaryStack: {
    gap: theme.spacing.md,
  },
  amountCard: {
    width: '100%',
    minHeight: 156,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.elevated,
    ...theme.shadows.md,
  },
  amountCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  amountCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  amountLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  amountValue: {
    color: '#111827',
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  amountNote: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
  },
  amountVariation: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.xs,
  },
  amountIconBox: {
    width: 72,
    height: 72,
    borderRadius: theme.borders.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  futureHeroCard: {
    minHeight: 224,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.lg,
    backgroundColor: '#2258F4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  futureHeroLeft: {
    flex: 1,
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  futureHeroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  futureHeroTitle: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xl,
    lineHeight: 30,
    fontWeight: theme.typography.fontWeight.bold,
  },
  futureHeroSubtitle: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 24,
  },
  futureHeroAmount: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  futureHeroRight: {
    width: 104,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  futureHeroCountLabel: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  futureHeroCount: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  chartCard: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
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
  recentLessons: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  recentLessonsTitle: {
    paddingHorizontal: theme.spacing.lg,
  },
  lessonsList: {
    borderTopWidth: theme.borders.width.base,
    borderTopColor: theme.colors.border.light,
    marginTop: theme.spacing.md,
  },
  lessonItem: {
    minHeight: 150,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: theme.borders.width.base,
    borderBottomColor: theme.colors.border.light,
  },
  lessonMain: {
    flex: 1,
    gap: theme.spacing.md,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  lessonStudent: {
    flexShrink: 1,
    color: '#111827',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  lessonStatusBadge: {
    borderRadius: theme.borders.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  lessonStatusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  lessonMetaText: {
    color: theme.colors.coolGray[800],
    fontSize: theme.typography.fontSize.md,
  },
  lessonAmountBlock: {
    width: 116,
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  lessonAmount: {
    color: '#111827',
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  lessonAmountLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  noPayments: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    fontStyle: 'italic',
  },
});
