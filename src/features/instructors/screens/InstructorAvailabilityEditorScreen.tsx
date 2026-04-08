import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { Sparkles, TriangleAlert } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../shared/ui/base/Button';
import { Card } from '../../../shared/ui/base/Card';
import { theme } from '../../../theme';
import type { InstrutorScheduleStackParamList } from '../../../types/navigation';
import { AvailabilityCalendarPreview } from '../components/AvailabilityCalendarPreview';
import { AvailabilityDayCard } from '../components/AvailabilityDayCard';
import { AvailabilityExceptionsCard } from '../components/AvailabilityExceptionsCard';
import { useInstructorBookingsPreviewQuery } from '../hooks/useInstructorBookingsPreviewQuery';
import { useInstructorAvailabilityDraft } from '../store/InstructorAvailabilityDraftContext';
import {
  getPreservedBookings,
  sortIntervals,
  WEEK_DAYS,
} from '../utils/availability';

type Props = NativeStackScreenProps<InstrutorScheduleStackParamList, 'AvailabilityEditor'>;

export const InstructorAvailabilityEditorScreen: React.FC<Props> = ({ navigation }) => {
  const currentMonth = React.useMemo(() => dayjs().startOf('month'), []);
  const nextMonthLimit = React.useMemo(() => currentMonth.add(1, 'month'), [currentMonth]);
  const {
    draft,
    initialDraft,
    hasChanges,
    isLoading,
    isError,
    isSaving,
    removeException,
    saveAllChanges,
    discardChanges,
    refetch,
  } = useInstructorAvailabilityDraft();
  const [visibleMonth, setVisibleMonth] = React.useState(currentMonth);
  const {
    data: bookings = [],
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
  } = useInstructorBookingsPreviewQuery(!isError);
  const preservedBookings = React.useMemo(
    () => getPreservedBookings(draft, bookings),
    [draft, bookings]
  );
  const dayChanges = React.useMemo(
    () =>
      WEEK_DAYS.map(item => {
        const currentIntervals = sortIntervals(draft.weekly[item.day] ?? []);
        const originalIntervals = sortIntervals(initialDraft.weekly[item.day] ?? []);

        if (JSON.stringify(currentIntervals) === JSON.stringify(originalIntervals)) {
          return null;
        }

        if (!originalIntervals.length && currentIntervals.length) {
          return { day: item.day, label: 'Adicionado' };
        }

        if (originalIntervals.length && !currentIntervals.length) {
          return { day: item.day, label: 'Removido' };
        }

        return { day: item.day, label: 'Alterado' };
      }).filter(Boolean) as Array<{ day: number; label: string }>,
    [draft.weekly, initialDraft.weekly]
  );
  const exceptionsChanged = React.useMemo(
    () => JSON.stringify(draft.exceptions) !== JSON.stringify(initialDraft.exceptions),
    [draft.exceptions, initialDraft.exceptions]
  );
  const changedDayMap = React.useMemo(
    () => new Map(dayChanges.map(item => [item.day, item.label])),
    [dayChanges]
  );
  const pendingChangeCount = dayChanges.length + (exceptionsChanged ? 1 : 0);
  const visibleExceptions = React.useMemo(
    () => [...draft.exceptions].sort((left, right) => left.date.localeCompare(right.date)),
    [draft.exceptions]
  );
  const exceptionChangeMap = React.useMemo(() => {
    const changes = new Map<string, string>();

    visibleExceptions.forEach(item => {
      const previousMatch = initialDraft.exceptions.find(
        current => current.date === item.date && current.type === item.type
      );

      if (!previousMatch) {
        changes.set(item.id, 'Nova');
        return;
      }

      if (JSON.stringify(previousMatch) !== JSON.stringify(item)) {
        changes.set(item.id, 'Alterada');
      }
    });

    return changes;
  }, [initialDraft.exceptions, visibleExceptions]);

  const handleSave = async () => {
    try {
      await saveAllChanges();
      Alert.alert('Disponibilidade salva', 'Sua agenda foi atualizada com sucesso.');
      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar sua disponibilidade agora.';

      Alert.alert('Erro ao salvar', message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AvailabilityEditorSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>Não foi possível carregar o editor.</Text>
          <Button
            title="Tentar novamente"
            variant="outline"
            onPress={async () => {
              await Promise.all([refetch(), refetchBookings()]);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Editor</Text>
          <Text style={styles.title}>Editar disponibilidade</Text>
          <Text style={styles.subtitle}>
            Ajuste todos os dias, revise exceções e confirme tudo só no final.
          </Text>
        </View>




        {hasChanges ? (
          <Card style={styles.pendingCard}>
            <View style={styles.pendingHeader}>
              <View style={styles.pendingTitleRow}>
                <View style={styles.pendingIconWrap}>
                  <Sparkles color={theme.colors.primary[500]} size={18} />
                </View>
                <View style={styles.pendingCopy}>
                  <Text style={styles.pendingTitle}>Mudanças pendentes</Text>
                  <Text style={styles.pendingText}>
                    {pendingChangeCount} ajuste(s) aguardando confirmação final.
                  </Text>
                </View>
              </View>
              <Button title="Descartar" variant="ghost" size="sm" onPress={discardChanges} />
            </View>

            <View style={styles.pendingChips}>
              {dayChanges.map(item => (
                <View key={`pending-day-${item.day}`} style={styles.pendingChip}>
                  <Text style={styles.pendingChipText}>
                    {WEEK_DAYS.find(day => day.day === item.day)?.shortLabel}: {item.label}
                  </Text>
                </View>
              ))}
              {exceptionsChanged ? (
                <View style={[styles.pendingChip, styles.pendingChipAccent]}>
                  <Text style={[styles.pendingChipText, styles.pendingChipAccentText]}>
                    Exceções atualizadas
                  </Text>
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        {preservedBookings.length ? (
          <Card style={styles.warningCard}>
            <TriangleAlert color={theme.colors.warning[700]} size={18} />
            <View style={styles.warningCopy}>
              <Text style={styles.warningTitle}>Aulas preservadas</Text>
              <Text style={styles.warningText}>
                {preservedBookings.length} aula(s) seguem válidas mesmo fora da nova janela. O backend deve fechar apenas novos agendamentos nesses horários.
              </Text>
            </View>
          </Card>
        ) : null}


        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dias da semana</Text>
          <Button
            title={`${draft.exceptions.length} exceções`}
            variant="ghost"
            size="sm"
            onPress={() => navigation.navigate('AvailabilityExceptions')}
          />
        </View>
        <View style={styles.sectionWeekDays}>
          {WEEK_DAYS.map(item => (
            <AvailabilityDayCard
              key={item.day}
              day={item.day}
              intervals={draft.weekly[item.day]}
              changeLabel={changedDayMap.get(item.day)}
              highlighted={changedDayMap.has(item.day)}
              onPress={() => navigation.navigate('EditAvailabilityDay', { day: item.day })}
            />
          ))}
          <Button
            title="Editar / Criar Exceções"
            variant="outline"
            size="md"
            style={styles.heroAction}
            onPress={() => navigation.navigate('AvailabilityExceptions')}
          />
        </View>

        <AvailabilityExceptionsCard
          exceptions={visibleExceptions}
          changeLabels={exceptionChangeMap}
          onRemoveException={removeException}
          actionLabel="Gerenciar"
          onPressAction={() => navigation.navigate('AvailabilityExceptions')}
          emptyActionLabel="Criar primeira exceção"
          onPressEmptyAction={() => navigation.navigate('AvailabilityExceptions')}
        />


        <AvailabilityCalendarPreview
          draft={draft}
          bookings={bookings}
          preservedBookings={preservedBookings}
          visibleMonth={visibleMonth}
          onChangeMonth={setVisibleMonth}
          canGoToPreviousMonth={visibleMonth.isAfter(currentMonth, 'month')}
          canGoToNextMonth={visibleMonth.isBefore(nextMonthLimit, 'month')}
        />

        {isLoadingBookings ? (
          <Text style={styles.previewLoadingText}>Atualizando bookings do mês...</Text>
        ) : null}

                    <Button
              title="Salvar alterações"
              style={styles.heroAction}
              onPress={handleSave}
              disabled={!hasChanges || isSaving}
              loading={isSaving}
            />

        {/* <Card style={styles.backendNoteCard}>
          <View style={styles.backendHeader}>
            <CalendarDays color={theme.colors.secondary[500]} size={18} />
            <Text style={styles.backendTitle}>Regra operacional</Text>
          </View>
          <Text style={styles.backendText}>
            Aula já marcada é preservada. A mudança de disponibilidade deve afetar só a oferta de novos agendamentos.
          </Text>
        </Card> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const AvailabilityEditorSkeleton = () => (
  <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
    <View style={styles.header}>
      <View style={[styles.skeletonBlock, styles.skeletonEyebrow]} />
      <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
      <View style={[styles.skeletonBlock, styles.skeletonSubtitle]} />
      <View style={[styles.skeletonBlock, styles.skeletonSubtitleShort]} />
    </View>

    <Card style={styles.heroCard}>
      <View style={styles.skeletonCircle} />
      <View style={[styles.skeletonBlock, styles.skeletonSectionTitle]} />
      <View style={[styles.skeletonBlock, styles.skeletonBody]} />
      <View style={[styles.skeletonBlock, styles.skeletonBodyShort]} />
      <View style={styles.heroActions}>
        <View style={[styles.skeletonButton, styles.heroAction]} />
        <View style={[styles.skeletonButton, styles.heroAction]} />
      </View>
    </Card>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,

  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
    flexDirection: 'column',
    paddingHorizontal: theme.spacing.md,
    rowGap: theme.spacing.md,
  },
  header: {
    // marginBottom: theme.spacing.xs,
  },
  eyebrow: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  heroCard: {
    marginBottom: theme.spacing.lg,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.primary[100],
    backgroundColor: '#F7FBFF',
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionWeekDays: {
  flexDirection: 'column',
  rowGap: theme.spacing.lg,  
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  heroText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  heroActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  heroAction: {
    flex: 1,
  },
  pendingCard: {
    marginBottom: theme.spacing.md,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.primary[100],
    backgroundColor: '#F7FBFF',
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  pendingTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    flex: 1,
  },
  pendingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCopy: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  pendingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  pendingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  pendingChip: {
    backgroundColor: theme.colors.background.primary,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.primary[100],
    borderRadius: theme.borders.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  pendingChipAccent: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
  },
  pendingChipText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  pendingChipAccentText: {
    color: theme.colors.primary[500],
  },
  warningCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: '#FFF9F0',
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.warning[200],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  warningCopy: {
    flex: 1,
  },
  warningTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning[700],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  warningText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  sectionHeader: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  inlineMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.primary[50],
  },
  inlineMetaBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  exceptionsCard: {
    backgroundColor: '#FCFDFF',
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.light,
  },
  exceptionsList: {
    rowGap: theme.spacing.sm,
  },
  exceptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: theme.borders.width.base,
    borderBottomColor: theme.colors.border.light,
  },
  exceptionContent: {
    flex: 1,
    rowGap: theme.spacing.xs,
  },
  exceptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  exceptionDate: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  exceptionStatusChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.primary[50],
  },
  exceptionStatusChipText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  exceptionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  exceptionDeleteButton: {
    width: 34,
    height: 34,
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2F2',
  },
  exceptionsEmptyState: {
    alignItems: 'flex-start',
    rowGap: theme.spacing.sm,
  },
  exceptionsEmptyTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  exceptionsEmptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  backendNoteCard: {
    marginTop: theme.spacing.lg,
    backgroundColor: '#F5F9FE',
  },
  backendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  backendTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  backendText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  previewLoadingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.semantic.error,
    textAlign: 'center',
  },
  skeletonBlock: {
    backgroundColor: theme.colors.coolGray[200],
    borderRadius: theme.borders.radius.sm,
  },
  skeletonEyebrow: {
    width: 72,
    height: 10,
    marginBottom: theme.spacing.sm,
  },
  skeletonTitle: {
    width: '54%',
    height: 24,
    marginBottom: theme.spacing.sm,
  },
  skeletonSubtitle: {
    width: '88%',
    height: 12,
    marginBottom: theme.spacing.xs,
  },
  skeletonSubtitleShort: {
    width: '62%',
    height: 12,
  },
  skeletonSectionTitle: {
    width: 148,
    height: 18,
    marginBottom: theme.spacing.md,
  },
  skeletonBody: {
    width: '92%',
    height: 12,
    marginBottom: theme.spacing.xs,
  },
  skeletonBodyShort: {
    width: '68%',
    height: 12,
    marginBottom: theme.spacing.lg,
  },
  skeletonCircle: {
    width: 42,
    height: 42,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.coolGray[200],
    marginBottom: theme.spacing.md,
  },
  skeletonButton: {
    height: 42,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.coolGray[200],
  },
});
