import dayjs from 'dayjs';
import { ChevronDown, PencilLine, TriangleAlert } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheet } from '../../../shared/ui/base';
import { Button } from '../../../shared/ui/base/Button';
import { Card } from '../../../shared/ui/base/Card';
import { theme } from '../../../theme';
import type { InstrutorScheduleStackParamList } from '../../../types/navigation';
import { useInstructorAvailabilityCompleteCalendarQuery } from '../../instructors';
import { AvailabilityCalendarPreview } from '../../instructors/components/AvailabilityCalendarPreview';
import { AvailabilityDayCard } from '../../instructors/components/AvailabilityDayCard';
import { AvailabilityExceptionsCard } from '../../instructors/components/AvailabilityExceptionsCard';
import { useInstructorAvailabilityDraft } from '../../instructors/store/InstructorAvailabilityDraftContext';
import {
  getPreservedBookings,
  WEEK_DAYS,
} from '../../instructors/utils/availability';

type Props = NativeStackScreenProps<InstrutorScheduleStackParamList, 'ScheduleScreen'>;

export const InstrutorScheduleScreen: React.FC<Props> = ({ navigation }) => {
  const currentMonth = React.useMemo(() => dayjs().startOf('month'), []);
  const nextMonthLimit = React.useMemo(() => currentMonth.add(1, 'month'), [currentMonth]);
  const {
    draft,
    isLoading,
    isError,
    refetch,
  } = useInstructorAvailabilityDraft();
  const [visibleMonth, setVisibleMonth] = React.useState(currentMonth);
  const [isExceptionsSheetVisible, setIsExceptionsSheetVisible] = React.useState(false);
  const {
    data: completeCalendar,
    isLoading: isLoadingCalendar,
    refetch: refetchCalendar,
  } = useInstructorAvailabilityCompleteCalendarQuery(!isError);
  const bookings = React.useMemo(
    () =>
      completeCalendar?.bookings_preview?.map(item => ({
        id: item.id,
        date: item.data,
        start: item.hora_inicio,
        end: item.hora_fim,
        status: item.status === 'PENDENTE' ? ('pending' as const) : ('confirmed' as const),
      })) ?? [],
    [completeCalendar]
  );
  const preservedBookings = React.useMemo(
    () => getPreservedBookings(draft, bookings),
    [draft, bookings]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AvailabilityScreenSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Não foi possível carregar sua agenda.</Text>
          <Button
            title="Tentar novamente"
            variant="outline"
            onPress={async () => {
              await Promise.all([refetch(), refetchCalendar()]);
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
          <Text style={styles.eyebrow}>Protótipo</Text>
          <Text style={styles.title}>Disponibilidade</Text>
          <Text style={styles.subtitle}>
            Edite vários dias, revise exceções e confira o impacto no mês antes do post bulk.
          </Text>
        </View>

        {/* <Card style={styles.heroCard}> */}
          {/* <View style={styles.heroIconWrap}>
            <Clock3 color={theme.colors.primary[500]} size={20} />
          </View>
          <Text style={styles.sectionTitle}>Resumo da disponibilidade</Text>
          <Text style={styles.heroText}>
            Consulte sua agenda configurada, exceções e o preview do mês. A edição completa acontece em uma tela dedicada.
          </Text> */}

        {/* </Card> */}

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
          <Text style={styles.sectionTitle}>Semana base</Text>
          <Pressable
            style={styles.inlineMeta}
            onPress={() => setIsExceptionsSheetVisible(true)}
          >
            <PencilLine color={theme.colors.text.tertiary} size={14} />
            <Text style={styles.inlineMetaText}>{draft.exceptions.length} exceções</Text>
            <ChevronDown color={theme.colors.text.tertiary} size={14} />
          </Pressable>
        </View>

        {WEEK_DAYS.map(item => (
          <AvailabilityDayCard
            key={item.day}
            day={item.day}
            intervals={draft.weekly[item.day]}
          />
        ))}

        <AvailabilityCalendarPreview
          draft={draft}
          bookings={bookings}
          preservedBookings={preservedBookings}
          calendarDays={completeCalendar?.dias}
          visibleMonth={visibleMonth}
          onChangeMonth={setVisibleMonth}
          canGoToPreviousMonth={visibleMonth.isAfter(currentMonth, 'month')}
          canGoToNextMonth={visibleMonth.isBefore(nextMonthLimit, 'month')}
        />

        {isLoadingCalendar ? (
          <Text style={styles.previewLoadingText}>Atualizando calendário do mês...</Text>
        ) : null}

        {/* <Card style={styles.backendNoteCard}>
          <View style={styles.backendHeader}>
            <CalendarDays color={theme.colors.secondary[500]} size={18} />
            <Text style={styles.backendTitle}>Regra operacional do protótipo</Text>
          </View>
          <Text style={styles.backendText}>
            Aula já marcada é preservada. A mudança de disponibilidade deve afetar só a oferta de novos agendamentos.
          </Text>
        </Card> */}

                  <View style={styles.heroActions}>
            <Button
                
              title="Editar disponibilidade"
              style={styles.heroAction}
              onPress={() => navigation.navigate('AvailabilityEditor')}
            />
          </View>
      </ScrollView>

      <BottomSheet
        visible={isExceptionsSheetVisible}
        onClose={() => setIsExceptionsSheetVisible(false)}
        title="Exceções cadastradas"
        scrollable
        snapPoints={['55%', '80%']}
      >
        <AvailabilityExceptionsCard
          exceptions={draft.exceptions}
          actionLabel="Editar"
          onPressAction={() => {
            setIsExceptionsSheetVisible(false);
            navigation.navigate('AvailabilityEditor');
          }}
          emptyActionLabel="Criar exceção"
          onPressEmptyAction={() => {
            setIsExceptionsSheetVisible(false);
            navigation.navigate('AvailabilityEditor');
          }}
          style={styles.sheetExceptionsCard}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

const AvailabilityScreenSkeleton = () => (
  <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
    <View style={styles.header}>
      <View style={[styles.skeletonBlock, styles.skeletonEyebrow]} />
      <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
      <View style={[styles.skeletonBlock, styles.skeletonSubtitle]} />
      <View style={[styles.skeletonBlock, styles.skeletonSubtitleShort]} />
    </View>

    <Card style={styles.heroCard}>
      <View style={[styles.skeletonCircle]} />
      <View style={[styles.skeletonBlock, styles.skeletonSectionTitle]} />
      <View style={[styles.skeletonBlock, styles.skeletonBody]} />
      <View style={[styles.skeletonBlock, styles.skeletonBodyShort]} />
      <View style={styles.heroActions}>
        <View style={[styles.skeletonButton, styles.heroAction]} />
      </View>
    </Card>

    <View style={styles.sectionHeader}>
      <View style={[styles.skeletonBlock, styles.skeletonSectionTitle]} />
      <View style={styles.skeletonChip} />
    </View>

    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={`day-skeleton-${index}`} style={styles.skeletonDayCard}>
        <View>
          <View style={[styles.skeletonBlock, styles.skeletonDayTitle]} />
          <View style={[styles.skeletonBlock, styles.skeletonDaySummary]} />
        </View>
      </Card>
    ))}

    <Card style={styles.backendNoteCard}>
      <View style={[styles.skeletonBlock, styles.skeletonSectionTitle]} />
      <View style={[styles.skeletonBlock, styles.skeletonBody]} />
      <View style={[styles.skeletonBlock, styles.skeletonBodyShort]} />
      <View style={styles.skeletonCalendarGrid}>
        {Array.from({ length: 14 }).map((_, index) => (
          <View key={`calendar-skeleton-${index}`} style={styles.skeletonCalendarCell} />
        ))}
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
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing['3xl'],
    flexDirection: 'column',
    rowGap: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  inlineMetaText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  sheetExceptionsCard: {
    marginTop: 0,
    marginBottom: theme.spacing.md,
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
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.semantic.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  previewLoadingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
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
  skeletonChip: {
    width: 92,
    height: 28,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.coolGray[200],
  },
  skeletonDayCard: {
    marginBottom: theme.spacing.md,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.light,
  },
  skeletonDayTitle: {
    width: 124,
    height: 16,
    marginBottom: theme.spacing.sm,
  },
  skeletonDaySummary: {
    width: 180,
    height: 12,
  },
  skeletonCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  skeletonCalendarCell: {
    width: '13.2%',
    height: 60,
    borderRadius: theme.borders.radius.md,
    backgroundColor: theme.colors.coolGray[200],
  },
});
