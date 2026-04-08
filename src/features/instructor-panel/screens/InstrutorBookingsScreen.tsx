import dayjs from 'dayjs';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Calendar, buildCalendarMonthCells, Card, type CalendarCellModel } from '../../../shared/ui/base';
import { theme } from '../../../theme';
import type { InstrutorDashboardStackParamList } from '../../../types/navigation';
import { useInstructorAvailabilityCompleteCalendarQuery } from '../../instructors';

type Props = NativeStackScreenProps<InstrutorDashboardStackParamList, 'BookingsScreen'>;

export const InstrutorBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const currentMonth = React.useMemo(() => dayjs().startOf('month'), []);
  const nextMonthLimit = React.useMemo(() => currentMonth.add(1, 'month'), [currentMonth]);
  const [visibleMonth, setVisibleMonth] = React.useState(currentMonth);
  const { data, isLoading, isError, refetch } = useInstructorAvailabilityCompleteCalendarQuery();

  const cells = React.useMemo<CalendarCellModel[]>(
    () =>
      buildCalendarMonthCells(visibleMonth).map(cell => {
        const day = data?.dias.find(item => item.data === cell.date);
        const hasBookings = Boolean(day?.bookings.length);
        const hasPreserved = Boolean(day?.bookings_preservados.length);

        return {
          ...cell,
          tone: hasPreserved ? 'warning' : hasBookings ? 'info' : cell.today ? 'neutral' : 'default',
          showIndicator: hasBookings || hasPreserved,
          indicatorTone: hasPreserved ? 'warning' : hasBookings ? 'info' : undefined,
        };
      }),
    [data?.dias, visibleMonth]
  );

  const bookings = React.useMemo(
    () =>
      [...(data?.bookings_preview ?? [])].sort((left, right) => {
        const leftKey = `${left.data} ${left.hora_inicio}`;
        const rightKey = `${right.data} ${right.hora_inicio}`;
        return leftKey.localeCompare(rightKey);
      }),
    [data?.bookings_preview]
  );

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>Não foi possível carregar seus agendamentos.</Text>
          <Button
            title="Tentar novamente"
            variant="outline"
            onPress={() => {
              refetch();
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
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color={theme.colors.text.primary} size={20} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Agendamentos</Text>
            <Text style={styles.subtitle}>
              Visualize as aulas já agendadas no período liberado pelo backend.
            </Text>
          </View>
        </View>

        <Calendar
          title="Calendário de aulas"
          visibleMonth={visibleMonth}
          onChangeMonth={setVisibleMonth}
          canGoToPreviousMonth={visibleMonth.isAfter(currentMonth, 'month')}
          canGoToNextMonth={visibleMonth.isBefore(nextMonthLimit, 'month')}
          cells={cells}
        />

        <Card style={styles.legendCard}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.legendDotInfo]} />
            <Text style={styles.legendText}>Aula agendada</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.legendDotWarning]} />
            <Text style={styles.legendText}>Aula preservada fora da nova janela</Text>
          </View>
        </Card>

        <Card style={styles.listCard}>
          <Text style={styles.sectionTitle}>Próximas aulas</Text>
          {isLoading ? (
            <Text style={styles.helperText}>Atualizando agendamentos...</Text>
          ) : bookings.length ? (
            <View style={styles.bookingsList}>
              {bookings.map(item => (
                <View key={item.id} style={styles.bookingRow}>
                  <View style={styles.bookingDateBlock}>
                    <Text style={styles.bookingDateDay}>{dayjs(item.data).format('DD')}</Text>
                    <Text style={styles.bookingDateMonth}>{dayjs(item.data).format('MMM')}</Text>
                  </View>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingTime}>
                      {item.hora_inicio} - {item.hora_fim}
                    </Text>
                    <Text style={styles.bookingStatus}>{item.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.helperText}>
              Você ainda não tem aulas agendadas nessa janela.
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
  contentContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
    rowGap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  headerCopy: {
    flex: 1,
    rowGap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  legendCard: {
    rowGap: theme.spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borders.radius.full,
  },
  legendDotInfo: {
    backgroundColor: theme.colors.secondary[600],
  },
  legendDotWarning: {
    backgroundColor: theme.colors.warning[700],
  },
  legendText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  listCard: {
    rowGap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  bookingsList: {
    rowGap: theme.spacing.sm,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: theme.borders.width.base,
    borderBottomColor: theme.colors.border.light,
  },
  bookingDateBlock: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.md,
    backgroundColor: theme.colors.background.secondary,
  },
  bookingDateDay: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  bookingDateMonth: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  bookingInfo: {
    flex: 1,
    rowGap: theme.spacing.xs,
  },
  bookingTime: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bookingStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    rowGap: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.semantic.error,
    textAlign: 'center',
  },
});
