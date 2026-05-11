import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { CalendarDays, Car, ChevronRight, Clock3, MapPin, UserRound } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader, Button, Card } from '../../../shared/ui';
import { theme } from '../../../theme';
import type { InstrutorDashboardStackParamList } from '../../../types/navigation';
import {
  useMyBookingsQuery,
  type BookingCheckoutStatusValue,
  type ScheduledBooking,
} from '../../bookings';

type Props = NativeStackScreenProps<InstrutorDashboardStackParamList, 'BookingsScreen'>;

type FilterOption = {
  label: string;
  value: BookingCheckoutStatusValue | null;
};

const filters: FilterOption[] = [
  { label: 'Todas', value: null },
  { label: 'Agendadas', value: 'AGENDADO' },
  { label: 'Confirmadas', value: 'CONFIRMADO' },
  { label: 'Em andamento', value: 'EM_ANDAMENTO' },
  { label: 'Concluidas', value: 'CONCLUIDO' },
];

const formatDate = (date: Date) =>
  dayjs(date).locale('pt-br').format('ddd, DD [de] MMM').replace('.', '');

const formatTime = (date: Date) => dayjs(date).format('HH:mm');

const getStatusLabel = (status: ScheduledBooking['apiStatus']) => {
  switch (status) {
    case 'PENDENTE_PAGAMENTO':
      return 'Pagamento pendente';
    case 'AGENDADO':
      return 'Agendada';
    case 'CONFIRMADO':
      return 'Confirmada';
    case 'EM_ANDAMENTO':
      return 'Em andamento';
    case 'CONCLUIDO':
      return 'Concluida';
    case 'CANCELADO':
      return 'Cancelada';
    case 'EXPIRADO':
      return 'Expirada';
    case 'NAO_COMPARECEU':
      return 'Nao compareceu';
    default:
      return 'Agendada';
  }
};

export const InstrutorBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedStatus, setSelectedStatus] = React.useState<BookingCheckoutStatusValue | null>(
    null,
  );
  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useMyBookingsQuery({ status_filtro: selectedStatus, limite: 100 });

  const upcomingCount = React.useMemo(
    () =>
      bookings.filter(booking => booking.status === 'scheduled' || booking.status === 'in_progress')
        .length,
    [bookings],
  );

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>Nao foi possivel carregar suas aulas.</Text>
          <Button title="Tentar novamente" variant="outline" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <AppHeader title="Aulas agendadas" onBackPress={navigation.goBack} />

        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <CalendarDays color={theme.colors.primary[600]} size={22} />
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryValue}>{upcomingCount}</Text>
              <Text style={styles.summaryLabel}>aula(s) ativas no filtro atual</Text>
            </View>
          </View>
        </Card>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {filters.map(filter => {
            const selected = selectedStatus === filter.value;

            return (
              <Pressable
                key={filter.label}
                accessibilityRole="button"
                onPress={() => setSelectedStatus(filter.value)}
                style={[styles.filterPill, selected && styles.filterPillSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Card style={styles.listCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            <Text style={styles.sectionMeta}>{bookings.length} aula(s)</Text>
          </View>

          {isLoading ? (
            <Text style={styles.helperText}>Atualizando aulas...</Text>
          ) : bookings.length ? (
            <View style={styles.bookingsList}>
              {bookings.map(booking => (
                <Pressable
                  key={booking.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir aula com ${booking.studentName}`}
                  onPress={() =>
                    navigation.navigate('BookingDetails', {
                      bookingId: booking.id,
                      viewerRole: 'instrutor',
                    })
                  }
                  style={({ pressed }) => [styles.bookingRow, pressed && styles.bookingRowPressed]}
                >
                  <View style={styles.bookingDateBlock}>
                    <Text style={styles.bookingWeekday}>
                      {dayjs(booking.date).locale('pt-br').format('ddd').replace('.', '')}
                    </Text>
                    <Text style={styles.bookingDateDay}>{dayjs(booking.date).format('DD')}</Text>
                    <Text style={styles.bookingDateMonth}>
                      {dayjs(booking.date).locale('pt-br').format('MMM').replace('.', '')}
                    </Text>
                  </View>

                  <View style={styles.bookingInfo}>
                    <View style={styles.bookingTitleRow}>
                      <Text style={styles.studentName} numberOfLines={1}>
                        {booking.studentName}
                      </Text>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>
                          {getStatusLabel(booking.apiStatus)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaList}>
                      <View style={styles.metaItem}>
                        <Clock3 color={theme.colors.text.secondary} size={14} />
                        <Text style={styles.metaText}>
                          {formatDate(booking.date)} - {formatTime(booking.date)}
                          {booking.endDate ? ` ate ${formatTime(booking.endDate)}` : ''}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MapPin color={theme.colors.text.secondary} size={14} />
                        <Text style={styles.metaText} numberOfLines={1}>
                          {booking.location ?? booking.meetingPointSuggestion ?? 'Local a combinar'}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Car color={theme.colors.text.secondary} size={14} />
                        <Text style={styles.metaText} numberOfLines={1}>
                          {booking.vehicleLabel ?? 'Veiculo a confirmar'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <ChevronRight color={theme.colors.text.tertiary} size={18} />
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <UserRound color={theme.colors.text.tertiary} size={24} />
              <Text style={styles.emptyTitle}>Nenhuma aula encontrada</Text>
              <Text style={styles.helperText}>
                Quando houver aulas neste filtro, elas aparecem aqui com detalhes e acoes.
              </Text>
            </View>
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
  summaryCard: {
    rowGap: theme.spacing.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: theme.borders.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
  },
  summaryCopy: {
    flex: 1,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  filterList: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  filterPill: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: theme.borders.radius.full,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.medium,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  filterPillSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  filterTextSelected: {
    color: theme.colors.primary[700],
  },
  listCard: {
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
  bookingsList: {
    rowGap: theme.spacing.sm,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borders.radius.md,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.secondary,
  },
  bookingRowPressed: {
    opacity: 0.72,
  },
  bookingDateBlock: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borders.radius.md,
    backgroundColor: theme.colors.primary[50],
    paddingVertical: theme.spacing.xs,
  },
  bookingWeekday: {
    fontSize: theme.typography.fontSize['2xs'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
    textTransform: 'uppercase',
  },
  bookingDateDay: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[700],
  },
  bookingDateMonth: {
    fontSize: theme.typography.fontSize['2xs'],
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  bookingInfo: {
    flex: 1,
    rowGap: theme.spacing.xs,
  },
  bookingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  studentName: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  statusPill: {
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.success[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  statusPillText: {
    fontSize: theme.typography.fontSize['2xs'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success[700],
  },
  metaList: {
    rowGap: theme.spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    flex: 1,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.xs,
  },
  emptyState: {
    alignItems: 'center',
    rowGap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
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
