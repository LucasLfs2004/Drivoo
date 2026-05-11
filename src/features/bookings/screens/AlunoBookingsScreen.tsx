import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Filter } from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../shared/ui/layout/Card';
import { Button } from '../../../shared/ui/primitives/Button';
import { theme } from '../../../theme';
import { scale } from '../../../utils/scale';
import type { AlunoBookingsStackParamList } from '../../../types/navigation';
import { BookingCard } from '../components/BookingCard';
import { useMyBookingsQuery } from '../hooks/useMyBookingsQuery';
import type { BookingListApiStatus, BookingListSortBy, BookingListSortOrder } from '../types/api';
import type { ScheduledBooking } from '../types/domain';

type NavigationProp = NativeStackNavigationProp<AlunoBookingsStackParamList>;

type BookingStatusFilter = BookingListApiStatus | 'TODOS';

const statusFilters: Array<{
  key: BookingStatusFilter;
  title: string;
}> = [
  { key: 'TODOS', title: 'Todos' },
  { key: 'PENDENTE_PAGAMENTO', title: 'Pagamento pendente' },
  { key: 'AGENDADO', title: 'Agendada' },
  { key: 'CONFIRMADO', title: 'Confirmada' },
  { key: 'EM_ANDAMENTO', title: 'Em andamento' },
  { key: 'CONCLUIDO', title: 'Concluída' },
  { key: 'CANCELADO', title: 'Cancelada' },
  { key: 'EXPIRADO', title: 'Expirada' },
  { key: 'NAO_COMPARECEU', title: 'Não compareceu' },
];

const sortByOptions: Array<{
  key: BookingListSortBy;
  title: string;
}> = [
  { key: 'data_aula', title: 'Data da aula' },
  { key: 'data_compra', title: 'Data da compra' },
  { key: 'criado_em', title: 'Criação' },
  { key: 'atualizado_em', title: 'Atualização' },
];

const sortOrderOptions: Array<{
  key: BookingListSortOrder;
  title: string;
}> = [
  { key: 'asc', title: 'Ascendente' },
  { key: 'desc', title: 'Descendente' },
];

const getFilteredBookings = (
  bookings: ScheduledBooking[],
  activeFilter: BookingStatusFilter,
): ScheduledBooking[] => {
  if (activeFilter === 'TODOS') {
    return bookings;
  }

  return bookings.filter(booking => booking.apiStatus === activeFilter);
};

export const AlunoBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeFilter, setActiveFilter] = React.useState<BookingStatusFilter>('TODOS');
  const [sortBy, setSortBy] = React.useState<BookingListSortBy>('data_aula');
  const [sortOrder, setSortOrder] = React.useState<BookingListSortOrder>('asc');
  const [showSortModal, setShowSortModal] = React.useState(false);
  const [draftSortBy, setDraftSortBy] = React.useState<BookingListSortBy>(sortBy);
  const [draftSortOrder, setDraftSortOrder] = React.useState<BookingListSortOrder>(sortOrder);
  const {
    data: bookings = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useMyBookingsQuery({
    ordenar_por: sortBy,
    ordem: sortOrder,
    limite: 100,
    offset: 0,
  });

  const filteredBookings = React.useMemo(
    () => getFilteredBookings(bookings, activeFilter),
    [activeFilter, bookings],
  );

  const handleSearchInstructorsPress = () => {
    navigation.getParent()?.navigate('Search', { screen: 'SearchScreen' });
  };

  const isSortCustomized = sortBy !== 'data_aula' || sortOrder !== 'asc';
  const openSortModal = () => {
    setDraftSortBy(sortBy);
    setDraftSortOrder(sortOrder);
    setShowSortModal(true);
  };
  const handleApplySort = () => {
    setSortBy(draftSortBy);
    setSortOrder(draftSortOrder);
    setShowSortModal(false);
  };
  const handleClearSort = () => {
    setDraftSortBy('data_aula');
    setDraftSortOrder('asc');
  };
  const activeFilterTitle =
    statusFilters.find(filter => filter.key === activeFilter)?.title.toLowerCase() ?? 'selecionado';
  const hasFilter = activeFilter !== 'TODOS';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Minhas Aulas</Text>
              <Text style={styles.subtitle}>Veja todas as suas aulas e filtre por status</Text>
            </View>
            <TouchableOpacity
              style={[styles.sortButton, isSortCustomized && styles.sortButtonActive]}
              onPress={openSortModal}
              activeOpacity={0.8}
            >
              <Filter
                width={scale(22)}
                color={isSortCustomized ? theme.colors.text.inverse : theme.colors.neutral[700]}
              />
              {isSortCustomized && (
                <View style={styles.sortBadge}>
                  <Text style={styles.sortBadgeText}>1</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <Text style={styles.filtersLabel}>Filtrar por status</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContent}
          >
            {statusFilters.map(filter => (
              <Button
                key={filter.key}
                title={filter.title}
                variant={activeFilter === filter.key ? 'primary' : 'outline'}
                size="sm"
                style={styles.filterButton}
                onPress={() => setActiveFilter(filter.key)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.bookingsSection}>
          {isLoading ? (
            <Card style={styles.stateCard}>
              <Text style={styles.stateTitle}>Carregando aulas...</Text>
              <Text style={styles.emptyMessage}>Estamos buscando seus agendamentos.</Text>
            </Card>
          ) : isError ? (
            <Card style={styles.stateCard}>
              <Text style={styles.errorTitle}>Não foi possível carregar</Text>
              <Text style={styles.emptyMessage}>Verifique sua conexão e tente novamente.</Text>
              <Button
                title="Tentar novamente"
                variant="outline"
                style={styles.searchButton}
                onPress={() => refetch()}
              />
            </Card>
          ) : filteredBookings.length ? (
            <View style={styles.bookingsList}>
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  id={booking.id}
                  instructorName={booking.instructorName}
                  instructorAvatar={booking.instructorAvatar ?? undefined}
                  date={booking.date}
                  duration={booking.duration}
                  price={booking.price}
                  currency={booking.currency}
                  status={booking.status}
                  apiStatus={booking.apiStatus}
                  vehicleType={booking.vehicleType}
                  vehicleLabel={booking.vehicleLabel}
                  location={booking.location}
                  onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
                />
              ))}
            </View>
          ) : (
            <Card style={styles.stateCard}>
              <Text style={styles.emptyTitle}>
                {hasFilter ? 'Nenhuma aula nesse status' : 'Nenhuma aula encontrada'}
              </Text>
              <Text style={styles.emptyMessage}>
                {hasFilter
                  ? `Não encontramos aulas com status ${activeFilterTitle}.`
                  : 'Quando você tiver aulas, elas aparecerão aqui.'}
              </Text>
              {!hasFilter && (
                <Button
                  title="Buscar Instrutores"
                  variant="primary"
                  style={styles.searchButton}
                  onPress={handleSearchInstructorsPress}
                />
              )}
            </Card>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showSortModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSortModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowSortModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ordenação</Text>
            <TouchableOpacity onPress={handleClearSort}>
              <Text style={styles.modalClearText}>Limpar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Ordenar por</Text>
              <View style={styles.modalOptions}>
                {sortByOptions.map(option => (
                  <Button
                    key={option.key}
                    title={option.title}
                    variant={draftSortBy === option.key ? 'primary' : 'outline'}
                    size="sm"
                    style={styles.modalOptionButton}
                    onPress={() => setDraftSortBy(option.key)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Direção</Text>
              <View style={styles.modalOptions}>
                {sortOrderOptions.map(option => (
                  <Button
                    key={option.key}
                    title={option.title}
                    variant={draftSortOrder === option.key ? 'primary' : 'outline'}
                    size="sm"
                    style={styles.modalOptionButton}
                    onPress={() => setDraftSortOrder(option.key)}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Button title="Aplicar ordenação" variant="primary" onPress={handleApplySort} />
          </View>
        </SafeAreaView>
      </Modal>
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
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
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
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sortButtonActive: {
    backgroundColor: theme.colors.primary[500],
  },
  sortBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.semantic.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  filtersContainer: {
    marginBottom: theme.spacing.lg,
  },
  filtersLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  filtersScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  filtersContent: {
    columnGap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  filterButton: {
    flexShrink: 0,
  },
  bookingsSection: {
    flex: 1,
  },
  bookingsList: {
    rowGap: theme.spacing.md,
  },
  stateCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  stateTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.semantic.error,
    marginBottom: theme.spacing.sm,
  },
  searchButton: {
    minWidth: 200,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalCloseButton: {
    padding: theme.spacing.sm,
  },
  modalCloseButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.lg,
  },
  modalTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  modalClearText: {
    color: theme.colors.primary[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
    rowGap: theme.spacing.xl,
  },
  modalSection: {
    rowGap: theme.spacing.md,
  },
  modalSectionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  modalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  modalOptionButton: {
    flexGrow: 1,
  },
  modalFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});
