import dayjs from 'dayjs';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../core/auth';
import { buildCalendarMonthCells, Button, Calendar, Card, type CalendarCellModel } from '../../../shared/ui/base';
import { theme } from '../../../theme';
import { useInstructorAvailabilityCompleteCalendarQuery, useMyInstructorProfileQuery } from '../../instructors';

interface NavigationLike {
  navigate: (screen: string, params?: unknown) => void;
}

interface Props {
  navigation: NavigationLike;
}

export const InstrutorDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { usuario } = useAuth();
  const currentMonth = React.useMemo(() => dayjs().startOf('month'), []);
  const nextMonthLimit = React.useMemo(() => currentMonth.add(1, 'month'), [currentMonth]);
  const [visibleMonth, setVisibleMonth] = React.useState(currentMonth);
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: hasProfileError,
    refetch: refetchProfile,
  } = useMyInstructorProfileQuery();
  const {
    data: calendarData,
    isLoading: isLoadingCalendar,
    isError: hasCalendarError,
    refetch: refetchCalendar,
  } = useInstructorAvailabilityCompleteCalendarQuery();

  const isLoading = isLoadingProfile || isLoadingCalendar;
  const hasError = hasProfileError || hasCalendarError;

  const instructorName =
    profile?.primeiroNome ?? usuario?.perfil?.primeiroNome ?? 'Instrutor';

  const calendarCells = React.useMemo<CalendarCellModel[]>(
    () =>
      buildCalendarMonthCells(visibleMonth).map(cell => {
        const day = calendarData?.dias.find(item => item.data === cell.date);
        const hasBookings = Boolean(day?.bookings.length);
        const hasPreserved = Boolean(day?.bookings_preservados.length);

        return {
          ...cell,
          tone: hasPreserved
            ? 'warning'
            : hasBookings
              ? 'info'
              : cell.today
                ? 'neutral'
                : 'default',
          showIndicator: hasBookings || hasPreserved,
          indicatorTone: hasPreserved ? 'warning' : hasBookings ? 'info' : undefined,
        };
      }),
    [calendarData?.dias, visibleMonth]
  );

  const upcomingBookings = React.useMemo(
    () => (calendarData?.bookings_preview ?? []).slice(0, 3),
    [calendarData?.bookings_preview]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  if (hasError || !calendarData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Não foi possível carregar sua dashboard.</Text>
          <Button
            title="Tentar novamente"
            variant="outline"
            onPress={async () => {
              await Promise.all([refetchProfile(), refetchCalendar()]);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {instructorName}</Text>
        </View>

        <Button
          title="Ver agendamentos"
          onPress={() => navigation.navigate('BookingsScreen')}
        />

        <Card style={styles.calendarCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Calendário de aulas</Text>
            <Text style={styles.sectionMeta}>
              {calendarData.total_bookings} aula(s) no período
            </Text>
          </View>
          <Text style={styles.helperText}>
            O calendário abaixo destaca apenas os dias com aulas agendadas.
          </Text>
          <Calendar
            visibleMonth={visibleMonth}
            onChangeMonth={setVisibleMonth}
            canGoToPreviousMonth={visibleMonth.isAfter(currentMonth, 'month')}
            canGoToNextMonth={visibleMonth.isBefore(nextMonthLimit, 'month')}
            cells={calendarCells}
          />
        </Card>

        <Card style={styles.recentBookingsCard}>
          <Text style={styles.sectionTitle}>Próximas aulas</Text>
          {upcomingBookings.length ? (
            <View style={styles.upcomingList}>
              {upcomingBookings.map(item => (
                <View key={item.id} style={styles.upcomingRow}>
                  <Text style={styles.upcomingDate}>{dayjs(item.data).format('DD/MM')}</Text>
                  <View style={styles.upcomingInfo}>
                    <Text style={styles.upcomingTime}>
                      {item.hora_inicio} - {item.hora_fim}
                    </Text>
                    <Text style={styles.upcomingStatus}>{item.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Você ainda não tem aulas agendadas nessa janela.
            </Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const DashboardSkeleton = () => (
  <ScrollView contentContainerStyle={styles.contentContainer}>
    <View style={styles.header}>
      <View style={[styles.skeletonBlock, styles.skeletonGreeting]} />
      <View style={[styles.skeletonBlock, styles.skeletonSubtitle]} />
      <View style={[styles.skeletonBlock, styles.skeletonSubtitleShort]} />
    </View>

    <View style={[styles.skeletonButton, styles.fullWidthButton]} />

    <Card style={styles.calendarCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.skeletonBlock, styles.skeletonSectionTitle]} />
        <View style={[styles.skeletonBlock, styles.skeletonMeta]} />
      </View>
      <View style={[styles.skeletonBlock, styles.skeletonBody]} />
      <View style={styles.skeletonCalendarGrid}>
        {Array.from({ length: 14 }).map((_, index) => (
          <View key={`dashboard-calendar-${index}`} style={styles.skeletonCalendarCell} />
        ))}
      </View>
    </Card>

    <Card style={styles.recentBookingsCard}>
      <View style={[styles.skeletonBlock, styles.skeletonSectionTitle]} />
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={`dashboard-booking-${index}`} style={styles.skeletonBookingRow}>
          <View style={[styles.skeletonBlock, styles.skeletonDateBlock]} />
          <View style={styles.skeletonBookingInfo}>
            <View style={[styles.skeletonBlock, styles.skeletonLineMedium]} />
            <View style={[styles.skeletonBlock, styles.skeletonLineShort]} />
          </View>
        </View>
      ))}
    </Card>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
    rowGap: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    rowGap: theme.spacing.md,
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
    rowGap: theme.spacing.xs,
  },
  greeting: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.md,
  },
  calendarCard: {
    rowGap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  sectionMeta: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  recentBookingsCard: {
    rowGap: theme.spacing.md,
  },
  upcomingList: {
    rowGap: theme.spacing.sm,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: theme.borders.width.base,
    borderBottomColor: theme.colors.border.light,
  },
  upcomingDate: {
    width: 48,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
  },
  upcomingInfo: {
    flex: 1,
    rowGap: theme.spacing.xs,
  },
  upcomingTime: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  upcomingStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  skeletonBlock: {
    backgroundColor: theme.colors.coolGray[200],
    borderRadius: theme.borders.radius.sm,
  },
  skeletonGreeting: {
    width: '42%',
    height: 26,
  },
  skeletonSubtitle: {
    width: '88%',
    height: 12,
  },
  skeletonSubtitleShort: {
    width: '68%',
    height: 12,
  },
  skeletonButton: {
    height: 44,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.coolGray[200],
  },
  fullWidthButton: {
    width: '100%',
  },
  skeletonSectionTitle: {
    width: 150,
    height: 18,
  },
  skeletonMeta: {
    width: 90,
    height: 14,
  },
  skeletonBody: {
    width: '82%',
    height: 12,
  },
  skeletonCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skeletonCalendarCell: {
    width: '13.2%',
    aspectRatio: 1,
    borderRadius: theme.borders.radius.md,
    backgroundColor: theme.colors.coolGray[200],
  },
  skeletonBookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  skeletonDateBlock: {
    width: 52,
    height: 52,
    borderRadius: theme.borders.radius.md,
  },
  skeletonBookingInfo: {
    flex: 1,
    rowGap: theme.spacing.xs,
  },
  skeletonLineMedium: {
    width: '56%',
    height: 14,
  },
  skeletonLineShort: {
    width: '28%',
    height: 12,
  },
});
