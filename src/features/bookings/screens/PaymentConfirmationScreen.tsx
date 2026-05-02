import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../shared/ui/base/AppHeader';
import { Button } from '../../../shared/ui/base/Button';
import { Card } from '../../../shared/ui/base/Card';
import { theme } from '../../../theme';
import { AlunoSearchStackParamList } from '../../../types/navigation';
import { calculateBookingPaymentInfo } from '../utils/payment';
import { mapBookingDataToCheckoutPayload } from '../mappers/mapBookingCheckout';
import {
  useBookingCheckoutStatusQuery,
  useCreateBookingCheckoutSessionMutation,
} from '../hooks/useBookingCheckout';
import { pendingCheckoutStorage } from '../store/pendingCheckoutStorage';
import type {
  BookingCheckoutSession,
  BookingCheckoutStatusValue,
  BookingData,
} from '../types/domain';

type Props = NativeStackScreenProps<
  AlunoSearchStackParamList,
  'PaymentConfirmation'
>;

const FINAL_STATUSES: BookingCheckoutStatusValue[] = [
  'AGENDADO',
  'EXPIRADO',
  'CANCELADO',
];

const formatDate = (date: Date) =>
  date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const formatCurrency = (value: number, currency: string) =>
  `${currency} ${value.toFixed(2)}`;

const getStatusTitle = (status?: BookingCheckoutStatusValue) => {
  switch (status) {
    case 'AGENDADO':
      return 'Pagamento confirmado';
    case 'EXPIRADO':
      return 'Checkout expirado';
    case 'CANCELADO':
      return 'Agendamento cancelado';
    case 'PENDENTE_PAGAMENTO':
      return 'Aguardando pagamento';
    default:
      return 'Reserva temporária';
  }
};

const getStatusDescription = (status?: BookingCheckoutStatusValue) => {
  switch (status) {
    case 'AGENDADO':
      return 'O backend confirmou o pagamento pela Stripe. Sua aula está agendada.';
    case 'EXPIRADO':
      return 'A reserva temporária expirou. Volte e inicie um novo checkout.';
    case 'CANCELADO':
      return 'Este agendamento foi cancelado.';
    case 'PENDENTE_PAGAMENTO':
      return 'Depois de concluir o Checkout, mantenha esta tela aberta ou volte para o app para atualizarmos o status real.';
    default:
      return 'Estamos preparando o checkout seguro da Stripe.';
  }
};

const getReturnDescription = (checkoutReturn?: 'sucesso' | 'cancelado') => {
  switch (checkoutReturn) {
    case 'sucesso':
      return 'Você voltou da Stripe. Estamos confirmando o pagamento com o backend.';
    case 'cancelado':
      return 'Você saiu do Checkout antes da confirmação. A reserva pode continuar pendente até expirar.';
    default:
      return null;
  }
};

export const PaymentConfirmationScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { bookingData, checkoutBookingId, checkoutReturn } = route.params;
  const typedBookingData = bookingData as BookingData | undefined;
  const initialBookingId = checkoutBookingId ?? '';

  const [checkoutSession, setCheckoutSession] =
    useState<BookingCheckoutSession | null>(null);
  const [bookingId, setBookingId] = useState(initialBookingId);
  const [openingCheckout, setOpeningCheckout] = useState(false);
  const [pendingCheckoutLoaded, setPendingCheckoutLoaded] =
    useState(Boolean(initialBookingId));
  const [sessionError, setSessionError] = useState<string | null>(null);

  const createCheckoutMutation = useCreateBookingCheckoutSessionMutation();
  const checkoutStatusQuery = useBookingCheckoutStatusQuery(
    bookingId,
    Boolean(bookingId)
  );

  const paymentInfo = useMemo(
    () =>
      typedBookingData ? calculateBookingPaymentInfo(typedBookingData) : null,
    [typedBookingData]
  );

  const status =
    checkoutStatusQuery.data?.bookingStatus ?? checkoutSession?.bookingStatus;
  const isFinalStatus = status ? FINAL_STATUSES.includes(status) : false;
  const returnDescription = getReturnDescription(checkoutReturn);

  const createCheckoutSession = useCallback(async () => {
    if (!typedBookingData) {
      setSessionError(
        'Não encontramos os dados do agendamento para iniciar o checkout.'
      );
      return;
    }

    try {
      setSessionError(null);
      const payload = mapBookingDataToCheckoutPayload(typedBookingData);
      const session = await createCheckoutMutation.mutateAsync(payload);

      setCheckoutSession(session);
      setBookingId(session.bookingId);
      await pendingCheckoutStorage.saveBookingId(session.bookingId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar o checkout.';
      setSessionError(message);
    }
  }, [createCheckoutMutation, typedBookingData]);

  useEffect(() => {
    if (
      bookingId ||
      !typedBookingData ||
      checkoutSession ||
      createCheckoutMutation.isPending
    ) {
      return;
    }

    createCheckoutSession();
  }, [
    bookingId,
    checkoutSession,
    createCheckoutMutation.isPending,
    createCheckoutSession,
    typedBookingData,
  ]);

  useEffect(() => {
    if (bookingId || typedBookingData) {
      if (typedBookingData) {
        setPendingCheckoutLoaded(true);
      }
      return;
    }

    pendingCheckoutStorage
      .getBookingId()
      .then(storedBookingId => {
        if (storedBookingId) {
          setBookingId(storedBookingId);
        }
      })
      .finally(() => setPendingCheckoutLoaded(true));
  }, [bookingId, typedBookingData]);

  useEffect(() => {
    if (!pendingCheckoutLoaded || bookingId || typedBookingData) {
      return;
    }

    setSessionError(
      'Não encontramos um checkout pendente para consultar. Volte para escolher um horário e iniciar o pagamento.'
    );
  }, [bookingId, pendingCheckoutLoaded, typedBookingData]);

  useEffect(() => {
    if (!isFinalStatus) {
      return;
    }

    pendingCheckoutStorage.clearBookingId();
  }, [isFinalStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && bookingId) {
        checkoutStatusQuery.refetch();
      }
    });

    return () => subscription.remove();
  }, [bookingId, checkoutStatusQuery]);

  const handleOpenCheckout = async () => {
    const checkoutUrl = checkoutSession?.checkoutUrl;

    if (!checkoutUrl) {
      Alert.alert(
        'Checkout indisponível',
        'Ainda não temos uma URL de checkout ativa. Tente iniciar novamente.'
      );
      return;
    }

    try {
      setOpeningCheckout(true);
      const canOpen = await Linking.canOpenURL(checkoutUrl);

      if (!canOpen) {
        throw new Error('Não foi possível abrir a URL do Checkout.');
      }

      await Linking.openURL(checkoutUrl);
    } catch {
      Alert.alert(
        'Erro ao abrir Checkout',
        'Não conseguimos abrir a página segura da Stripe. Tente novamente.'
      );
    } finally {
      setOpeningCheckout(false);
    }
  };

  const handleViewBookings = () => {
    navigation.getParent()?.navigate('Bookings' as never);
  };

  const isPreparingCheckout =
    createCheckoutMutation.isPending ||
    (!bookingId && !sessionError && !pendingCheckoutLoaded);

  if (isPreparingCheckout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.centeredText}>Preparando checkout seguro...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (sessionError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Não foi possível iniciar o pagamento</Text>
          <Text style={styles.errorMessage}>{sessionError}</Text>
          <Button
            title="Tentar novamente"
            onPress={createCheckoutSession}
            style={styles.centerButton}
          />
          <Button
            title="Voltar"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.centerButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Pagamento"
          subtitle="Checkout seguro pela Stripe"
          onBackPress={() => navigation.goBack()}
        />

        {typedBookingData && paymentInfo && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Resumo da aula</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Instrutor</Text>
              <Text style={styles.summaryValue}>
                {typedBookingData.instructorName}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Data</Text>
              <Text style={styles.summaryValue}>
                {formatDate(typedBookingData.date)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Horário</Text>
              <Text style={styles.summaryValue}>{typedBookingData.timeSlot}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duração</Text>
              <Text style={styles.summaryValue}>
                {typedBookingData.duration} minutos
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(paymentInfo.total, paymentInfo.currency)}
              </Text>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{getStatusTitle(status)}</Text>
          {returnDescription && (
            <Text style={styles.returnDescription}>{returnDescription}</Text>
          )}
          <Text style={styles.description}>{getStatusDescription(status)}</Text>

          {checkoutStatusQuery.isFetching && (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
              <Text style={styles.inlineLoadingText}>Atualizando status...</Text>
            </View>
          )}

          <View style={styles.statusMeta}>
            <Text style={styles.metaLabel}>Agendamento</Text>
            <Text style={styles.metaValue}>{bookingId}</Text>
          </View>

          {checkoutSession?.expiresAt && status === 'PENDENTE_PAGAMENTO' && (
            <View style={styles.statusMeta}>
              <Text style={styles.metaLabel}>Checkout expira em</Text>
              <Text style={styles.metaValue}>
                {new Date(checkoutSession.expiresAt).toLocaleString('pt-BR')}
              </Text>
            </View>
          )}

          {checkoutStatusQuery.data?.failureMessage && (
            <Text style={styles.errorMessage}>
              {checkoutStatusQuery.data.failureMessage}
            </Text>
          )}
        </Card>

        {status !== 'AGENDADO' &&
          status !== 'CANCELADO' &&
          status !== 'EXPIRADO' && (
            <Button
              title={
                openingCheckout ? 'Abrindo Checkout...' : 'Abrir Checkout Stripe'
              }
              onPress={handleOpenCheckout}
              disabled={!checkoutSession?.checkoutUrl || openingCheckout}
              style={styles.actionButton}
            />
          )}

        <Button
          title="Atualizar status"
          variant="outline"
          onPress={() => checkoutStatusQuery.refetch()}
          disabled={!bookingId || checkoutStatusQuery.isFetching}
          style={styles.actionButton}
        />

        {status === 'AGENDADO' && (
          <Button
            title="Ver minhas aulas"
            onPress={handleViewBookings}
            style={styles.actionButton}
          />
        )}

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            O retorno da Stripe não confirma o pagamento sozinho. Esta tela sempre consulta o backend para mostrar o estado real do agendamento.
          </Text>
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
  scrollContent: {
    padding: theme.spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  centeredText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
  },
  centerButton: {
    minWidth: 220,
    marginTop: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  description: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  returnDescription: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  summaryValue: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'right',
  },
  totalRow: {
    borderTopColor: theme.colors.border.light,
    borderTopWidth: 1,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  totalLabel: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  totalValue: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  inlineLoading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  inlineLoadingText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  statusMeta: {
    marginTop: theme.spacing.sm,
  },
  metaLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
    marginBottom: theme.spacing.xs,
  },
  metaValue: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  actionButton: {
    marginBottom: theme.spacing.md,
  },
  notice: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.md,
  },
  noticeText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    color: theme.colors.semantic.error,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
