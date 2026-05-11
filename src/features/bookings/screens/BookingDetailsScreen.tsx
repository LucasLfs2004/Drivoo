import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  CreditCard,
  MessageCircle,
  PlayCircle,
  UserX,
  XCircle,
} from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../../../shared/ui/layout/Card';
import { AppHeader } from '../../../shared/ui/navigation/AppHeader';
import { Button } from '../../../shared/ui/primitives/Button';
import { theme } from '../../../theme';
import type { AlunoBookingsStackParamList } from '../../../types/navigation';
import { formatCurrency } from '../../../utils/currency';
import { useBookingDetailsQuery } from '../hooks/useBookingDetailsQuery';
import { useCancelBookingMutation } from '../hooks/useCancelBookingMutation';
import { useUpdateBookingStatusMutation } from '../hooks/useUpdateBookingStatusMutation';
import type { BookingCheckoutStatusValue, BookingData, ScheduledBooking } from '../types/domain';

type NavigationProp = NativeStackNavigationProp<AlunoBookingsStackParamList, 'BookingDetails'>;
type ScreenRouteProp = RouteProp<AlunoBookingsStackParamList, 'BookingDetails'>;

const formatDate = (date: Date) =>
  date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

const formatTime = (date: Date) =>
  date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const getStatusText = (booking: ScheduledBooking) => {
  switch (booking.apiStatus) {
    case 'PENDENTE_PAGAMENTO':
      return 'Pagamento pendente';
    case 'CONFIRMADO':
      return 'Confirmada';
    case 'AGENDADO':
      return 'Agendada';
    case 'EM_ANDAMENTO':
      return 'Em andamento';
    case 'CONCLUIDO':
      return 'Concluída';
    case 'CANCELADO':
      return 'Cancelada';
    case 'EXPIRADO':
      return 'Expirada';
    case 'NAO_COMPARECEU':
      return 'Não compareceu';
    default:
      return 'Agendada';
  }
};

const getStatusTone = (booking: ScheduledBooking) => {
  if (booking.apiStatus === 'PENDENTE_PAGAMENTO') {
    return theme.colors.semantic.warning;
  }

  if (booking.status === 'cancelled') {
    return theme.colors.semantic.error;
  }

  if (booking.status === 'completed') {
    return theme.colors.semantic.success;
  }

  return theme.colors.primary[500];
};

const formatBookingTimeSlot = (date: Date) =>
  date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const mapScheduledBookingToBookingData = (booking: ScheduledBooking): BookingData => {
  const [vehicleBrand = booking.vehicleLabel ?? 'Veículo', ...vehicleModelParts] =
    booking.vehicleLabel?.split(' ').filter(Boolean) ?? [];

  return {
    id: booking.id,
    instructorId: booking.instructorId ?? '',
    instructorName: booking.instructorName,
    instructorAvatar: booking.instructorAvatar ?? undefined,
    date: booking.date,
    timeSlot: formatBookingTimeSlot(booking.date),
    duration: booking.duration,
    price: booking.price,
    currency: booking.currency,
    vehicleInfo: {
      marca: vehicleBrand,
      modelo: vehicleModelParts.join(' '),
      transmissao: booking.vehicleType === 'automatic' ? 'automatico' : 'manual',
    },
    location: {
      endereco: booking.location ?? booking.meetingPointSuggestion ?? 'Local a confirmar',
    },
    status: 'pending',
  };
};

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <View style={styles.detailItem}>
    <View style={styles.detailIcon}>{icon}</View>
    <View style={styles.detailCopy}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

export const BookingDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { bookingId, viewerRole = 'aluno' } = route.params;
  const isInstructorView = viewerRole === 'instrutor';
  const { data: booking, isLoading, isError, refetch } = useBookingDetailsQuery(bookingId);
  const cancelMutation = useCancelBookingMutation(bookingId);
  const updateStatusMutation = useUpdateBookingStatusMutation(bookingId);

  const handleChatPress = () => {
    navigation.getParent()?.navigate('Chat', {
      screen: 'ChatScreen',
      params: {
        conversationId: `booking-${bookingId}`,
        participantName: isInstructorView
          ? (booking?.studentName ?? 'Aluno')
          : (booking?.instructorName ?? 'Professor'),
      },
    });
  };

  const handlePaymentPress = () => {
    if (!booking) {
      return;
    }

    navigation.getParent()?.navigate('Search', {
      screen: 'PaymentConfirmation',
      params: {
        bookingData: mapScheduledBookingToBookingData(booking),
        checkoutBookingId: bookingId,
      },
    });
  };

  const handleUpdateStatusPress = (
    status: BookingCheckoutStatusValue,
    title: string,
    message: string,
  ) => {
    if (updateStatusMutation.isPending) {
      return;
    }

    Alert.alert(title, message, [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: () => {
          updateStatusMutation.mutate(
            { status },
            {
              onSuccess: result => {
                Alert.alert('Aula atualizada', result.message);
              },
              onError: () => {
                Alert.alert(
                  'Nao foi possivel atualizar',
                  'Verifique o status atual e tente novamente.',
                );
              },
            },
          );
        },
      },
    ]);
  };

  const handleReportProblemPress = () => {
    Alert.alert(
      'Relato do instrutor indisponivel',
      'O backend ainda nao possui uma rota propria para o instrutor registrar problema com motivo, descricao e evidencias. Por enquanto, use o chat ou marque o status permitido quando aplicavel.',
    );
  };

  const handleCancelPress = () => {
    if (!booking?.cancellationPolicy.canCancel || cancelMutation.isPending) {
      return;
    }

    Alert.alert(
      'Cancelar aula',
      booking.apiStatus === 'PENDENTE_PAGAMENTO'
        ? 'Essa reserva pendente será cancelada.'
        : 'Sua aula será cancelada conforme a política de 24h.',
      [
        { text: 'Manter aula', style: 'cancel' },
        {
          text: 'Cancelar aula',
          style: 'destructive',
          onPress: () => {
            cancelMutation.mutate(
              { motivo: 'Cancelado pelo aluno no app' },
              {
                onSuccess: result => {
                  Alert.alert('Aula cancelada', result.message);
                },
                onError: () => {
                  Alert.alert('Não foi possível cancelar', 'Tente novamente em alguns instantes.');
                },
              },
            );
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <AppHeader title="Detalhes da aula" onBackPress={navigation.goBack} />
          <Card style={styles.stateCard}>
            <Text style={styles.stateTitle}>Carregando agendamento...</Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <AppHeader title="Detalhes da aula" onBackPress={navigation.goBack} />
          <Card style={styles.stateCard}>
            <Text style={styles.errorTitle}>Não foi possível carregar</Text>
            <Text style={styles.stateMessage}>Verifique sua conexão e tente novamente.</Text>
            <Button title="Tentar novamente" variant="outline" onPress={() => refetch()} />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const deadline = booking.cancellationPolicy.deadline
    ? `${formatDate(booking.cancellationPolicy.deadline)} às ${formatTime(
        booking.cancellationPolicy.deadline,
      )}`
    : null;
  const vehicleText = booking.vehicleLabel
    ? `${booking.vehicleLabel}${
        booking.vehicleType
          ? ` - ${booking.vehicleType === 'manual' ? 'manual' : 'automático'}`
          : ''
      }`
    : booking.vehicleType
      ? booking.vehicleType === 'manual'
        ? 'Manual'
        : 'Automático'
      : 'Veículo a confirmar';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <AppHeader title="Detalhes da aula" onBackPress={navigation.goBack} />

        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.instructorInitials}>
              <Text style={styles.instructorInitialsText}>
                {booking.instructorName
                  .split(' ')
                  .map(part => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.kicker}>{isInstructorView ? 'Aula para' : 'Aula com'}</Text>
              <Text style={styles.instructorName}>
                {isInstructorView ? booking.studentName : booking.instructorName}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: getStatusTone(booking) }]}>
              <Text style={styles.statusPillText}>{getStatusText(booking)}</Text>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <DetailItem
              icon={<CalendarDays color={theme.colors.primary[500]} size={18} />}
              label="Data"
              value={formatDate(booking.date)}
            />
            <DetailItem
              icon={<Clock3 color={theme.colors.primary[500]} size={18} />}
              label="Horário"
              value={`${formatTime(booking.date)} - ${
                booking.endDate ? formatTime(booking.endDate) : 'a confirmar'
              }`}
            />
            <DetailItem
              icon={<CreditCard color={theme.colors.primary[500]} size={18} />}
              label="Valor"
              value={formatCurrency(booking.price, booking.currency)}
            />
            <DetailItem
              icon={<Car color={theme.colors.primary[500]} size={18} />}
              label="Veículo"
              value={vehicleText}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ações</Text>
          {isInstructorView ? (
            <>
              <View style={styles.actions}>
                <Button
                  title="Acessar chat"
                  icon={MessageCircle}
                  variant="primary"
                  onPress={handleChatPress}
                />
                <Button
                  title="Iniciar aula"
                  icon={PlayCircle}
                  variant="outline"
                  disabled={booking.apiStatus !== 'CONFIRMADO'}
                  loading={updateStatusMutation.isPending}
                  onPress={() =>
                    handleUpdateStatusPress(
                      'EM_ANDAMENTO',
                      'Iniciar aula',
                      'A aula sera marcada como em andamento.',
                    )
                  }
                />
                <Button
                  title="Concluir aula"
                  icon={CheckCircle2}
                  variant="secondary"
                  disabled={booking.apiStatus !== 'EM_ANDAMENTO'}
                  loading={updateStatusMutation.isPending}
                  onPress={() =>
                    handleUpdateStatusPress(
                      'CONCLUIDO',
                      'Concluir aula',
                      'A aula sera marcada como concluida.',
                    )
                  }
                />
                <Button
                  title="Aluno nao compareceu"
                  icon={UserX}
                  variant="destructive"
                  disabled={booking.apiStatus !== 'CONFIRMADO'}
                  loading={updateStatusMutation.isPending}
                  onPress={() =>
                    handleUpdateStatusPress(
                      'NAO_COMPARECEU',
                      'Marcar nao comparecimento',
                      'Use esta acao apenas quando o aluno nao compareceu a uma aula confirmada.',
                    )
                  }
                />
                <Button
                  title="Relatar problema"
                  icon={AlertTriangle}
                  variant="ghost"
                  onPress={handleReportProblemPress}
                />
              </View>
              <Text style={styles.policyText}>
                Acoes seguem as transicoes atuais do backend: CONFIRMADO para EM_ANDAMENTO,
                EM_ANDAMENTO para CONCLUIDO, ou CONFIRMADO para NAO_COMPARECEU.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.actions}>
                {booking.apiStatus === 'PENDENTE_PAGAMENTO' && (
                  <Button
                    title="Realizar pagamento"
                    icon={CreditCard}
                    variant="secondary"
                    onPress={handlePaymentPress}
                  />
                )}
                <Button
                  title="Chat com professor"
                  icon={MessageCircle}
                  variant="primary"
                  onPress={handleChatPress}
                />
                <Button
                  title="Cancelar aula"
                  icon={XCircle}
                  variant="destructive"
                  disabled={!booking.cancellationPolicy.canCancel}
                  loading={cancelMutation.isPending}
                  onPress={handleCancelPress}
                />
              </View>
              <Text style={styles.policyText}>
                {booking.cancellationPolicy.reason}
                {deadline ? ` Prazo: ${deadline}.` : ''}
              </Text>
            </>
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
  contentContainer: {
    paddingBottom: theme.spacing['3xl'],
    rowGap: theme.spacing.md,
  },
  summaryCard: {
    rowGap: theme.spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.md,
  },
  instructorInitials: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
  },
  instructorInitialsText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  instructorName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  statusPill: {
    borderRadius: theme.borders.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  statusPillText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  detailGrid: {
    rowGap: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: theme.borders.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  sectionCard: {
    rowGap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  actions: {
    rowGap: theme.spacing.sm,
  },
  policyText: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    color: theme.colors.text.secondary,
  },
  stateCard: {
    rowGap: theme.spacing.md,
    alignItems: 'center',
  },
  stateTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  stateMessage: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.semantic.error,
  },
});
