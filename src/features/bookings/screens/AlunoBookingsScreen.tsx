import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { theme } from '../../../theme';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AlunoTabParamList } from '../../../types/navigation';
import { BookingCard } from '../components/BookingCard';
import { useMyBookingsQuery } from '../hooks/useMyBookingsQuery';
import type { BookingListApiStatus } from '../types/api';

type NavigationProp = BottomTabNavigationProp<AlunoTabParamList>;

type BookingTab = 'upcoming' | 'completed' | 'cancelled';

const tabs: Array<{
  key: BookingTab;
  title: string;
  status: BookingListApiStatus;
}> = [
  { key: 'upcoming', title: 'Próximas', status: 'AGENDADO' },
  { key: 'completed', title: 'Concluídas', status: 'CONCLUIDO' },
  { key: 'cancelled', title: 'Canceladas', status: 'CANCELADO' },
];

const emptyCopy: Record<BookingTab, { title: string; message: string }> = {
  upcoming: {
    title: 'Nenhuma aula agendada',
    message: 'Que tal agendar sua primeira aula?',
  },
  completed: {
    title: 'Nenhuma aula concluída',
    message: 'Suas aulas finalizadas aparecerão aqui.',
  },
  cancelled: {
    title: 'Nenhuma aula cancelada',
    message: 'Quando houver cancelamentos, eles aparecerão aqui.',
  },
};

export const AlunoBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = React.useState<BookingTab>('upcoming');
  const activeStatus = tabs.find(tab => tab.key === activeTab)?.status ?? 'AGENDADO';
  const {
    data: bookings = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useMyBookingsQuery({
    status_filtro: activeStatus,
    limite: 50,
    offset: 0,
  });

  const handleSearchInstructorsPress = () => {
    navigation.navigate('Search', { screen: 'SearchScreen' });
  };

  const activeEmptyCopy = emptyCopy[activeTab];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Aulas</Text>
          <Text style={styles.subtitle}>Gerencie seus agendamentos</Text>
        </View>

        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <Button
              key={tab.key}
              title={tab.title}
              variant={activeTab === tab.key ? 'primary' : 'outline'}
              size="sm"
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.key)}
            />
          ))}
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
          ) : bookings.length ? (
            <View style={styles.bookingsList}>
              {bookings.map(booking => (
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
                  vehicleType={booking.vehicleType}
                  location={booking.location}
                />
              ))}
            </View>
          ) : (
            <Card style={styles.stateCard}>
              <Text style={styles.emptyTitle}>{activeEmptyCopy.title}</Text>
              <Text style={styles.emptyMessage}>{activeEmptyCopy.message}</Text>
              {activeTab === 'upcoming' && (
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
  tabsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  tabButton: {
    flex: 1,
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
});
