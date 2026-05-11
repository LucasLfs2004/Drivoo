import { Badge, Card, Divider, Page } from '@/shared/ui';
import { SummaryRow } from '@/shared/ui/display/SummaryRow';
import { scale } from '@/utils';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, StyleSheet, View } from 'react-native';
import { AppHeader } from '../../../shared/ui/navigation/AppHeader';
import { Button } from '../../../shared/ui/primitives/Button';
import { Typography } from '../../../shared/ui/primitives/Typography';
import { theme } from '../../../theme';
import { AlunoSearchStackParamList } from '../../../types/navigation';
import { formatCurrency } from '../../../utils/currency';
import {
  useBookingCheckoutStatusQuery,
  useCreateBookingCheckoutSessionMutation,
} from '../hooks/useBookingCheckout';
import { calculateBookingPaymentInfo } from '../lib/payment';
import { mapBookingDataToCheckoutPayload } from '../mappers/mapBookingCheckout';
import { pendingCheckoutStorage } from '../store/pendingCheckoutStorage';
import type {
  BookingCheckoutSession,
  BookingCheckoutStatusValue,
  BookingData,
} from '../types/domain';

type Props = NativeStackScreenProps<AlunoSearchStackParamList, 'PaymentConfirmation'>;

const FINAL_STATUSES: BookingCheckoutStatusValue[] = ['AGENDADO', 'EXPIRADO', 'CANCELADO'];

const formatDate = (date: Date) =>
  date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

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

export const PaymentConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingData, checkoutBookingId, checkoutReturn, checkoutUrl } = route.params;
  const typedBookingData = bookingData as BookingData | undefined;
  const initialBookingId = checkoutBookingId ?? '';

  const [checkoutSession, setCheckoutSession] = useState<BookingCheckoutSession | null>(null);
  const [bookingId, setBookingId] = useState(initialBookingId);
  const [resumableCheckoutUrl, setResumableCheckoutUrl] = useState(checkoutUrl ?? null);
  const [resumableCheckoutExpiresAt, setResumableCheckoutExpiresAt] = useState<string | null>(null);
  const [openingCheckout, setOpeningCheckout] = useState(false);
  const [pendingCheckoutLoaded, setPendingCheckoutLoaded] = useState(Boolean(initialBookingId));
  const [sessionError, setSessionError] = useState<string | null>(null);
  const hasAutoCreateAttempted = useRef(false);

  const createCheckoutMutation = useCreateBookingCheckoutSessionMutation();
  const checkoutStatusQuery = useBookingCheckoutStatusQuery(bookingId, Boolean(bookingId));

  const paymentInfo = useMemo(
    () => (typedBookingData ? calculateBookingPaymentInfo(typedBookingData) : null),
    [typedBookingData],
  );
  const displayedPaymentInfo =
    checkoutStatusQuery.data?.paymentInfo ?? checkoutSession?.paymentInfo ?? paymentInfo;

  const status = checkoutStatusQuery.data?.bookingStatus ?? checkoutSession?.bookingStatus;
  const isFinalStatus = status ? FINAL_STATUSES.includes(status) : false;
  const returnDescription = getReturnDescription(checkoutReturn);

  const createCheckoutSession = useCallback(async () => {
    if (!typedBookingData) {
      setSessionError('Não encontramos os dados do agendamento para iniciar o checkout.');
      return;
    }

    try {
      setSessionError(null);
      const payload = mapBookingDataToCheckoutPayload(typedBookingData);
      const session = await createCheckoutMutation.mutateAsync(payload);

      setCheckoutSession(session);
      setBookingId(session.bookingId);
      setResumableCheckoutUrl(session.checkoutUrl);
      setResumableCheckoutExpiresAt(session.expiresAt);
      await pendingCheckoutStorage.saveCheckoutSession({
        bookingId: session.bookingId,
        checkoutUrl: session.checkoutUrl,
        expiresAt: session.expiresAt,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível iniciar o checkout.';
      setSessionError(message);
    }
  }, [createCheckoutMutation, typedBookingData]);

  useEffect(() => {
    if (
      bookingId ||
      !typedBookingData ||
      checkoutSession ||
      sessionError ||
      hasAutoCreateAttempted.current ||
      createCheckoutMutation.isPending
    ) {
      return;
    }

    hasAutoCreateAttempted.current = true;
    createCheckoutSession();
  }, [
    bookingId,
    checkoutSession,
    createCheckoutMutation.isPending,
    createCheckoutSession,
    sessionError,
    typedBookingData,
  ]);

  useEffect(() => {
    const loadPendingBooking = async () => {
      if (bookingId || typedBookingData) {
        if (typedBookingData) {
          setPendingCheckoutLoaded(true);
        }
        return;
      }
      try {
        const storedBookingId = await pendingCheckoutStorage.getBookingId();
        if (storedBookingId) {
          setBookingId(storedBookingId);
        }
      } finally {
        setPendingCheckoutLoaded(true);
      }
    };

    loadPendingBooking();
  }, [bookingId, typedBookingData]);

  useEffect(() => {
    const loadStoredCheckoutSession = async () => {
      if (!bookingId || resumableCheckoutUrl) {
        return;
      }

      const storedSession = await pendingCheckoutStorage.getCheckoutSession(bookingId);

      if (storedSession?.checkoutUrl) {
        setResumableCheckoutUrl(storedSession.checkoutUrl);
        setResumableCheckoutExpiresAt(storedSession.expiresAt ?? null);
      }
    };

    loadStoredCheckoutSession();
  }, [bookingId, resumableCheckoutUrl]);

  useEffect(() => {
    if (!pendingCheckoutLoaded || bookingId || typedBookingData) {
      return;
    }

    setSessionError(
      'Não encontramos um checkout pendente para consultar. Volte para escolher um horário e iniciar o pagamento.',
    );
  }, [bookingId, pendingCheckoutLoaded, typedBookingData]);

  useEffect(() => {
    if (!isFinalStatus) {
      return;
    }

    pendingCheckoutStorage.clearBookingId();
    if (bookingId) {
      pendingCheckoutStorage.clearCheckoutSession(bookingId);
    }
  }, [bookingId, isFinalStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && bookingId) {
        checkoutStatusQuery.refetch();
      }
    });

    return () => subscription.remove();
  }, [bookingId, checkoutStatusQuery]);

  const handleOpenCheckout = async () => {
    const activeCheckoutUrl = checkoutSession?.checkoutUrl ?? resumableCheckoutUrl;

    if (!activeCheckoutUrl) {
      Alert.alert(
        'Checkout indisponível',
        'Ainda não temos uma URL de checkout ativa para este agendamento.',
      );
      return;
    }

    try {
      setOpeningCheckout(true);
      const canOpen = await Linking.canOpenURL(activeCheckoutUrl);

      if (!canOpen) {
        throw new Error('Não foi possível abrir a URL do Checkout.');
      }

      await Linking.openURL(activeCheckoutUrl);
    } catch {
      Alert.alert(
        'Erro ao abrir Checkout',
        'Não conseguimos abrir a página segura da Stripe. Tente novamente.',
      );
    } finally {
      setOpeningCheckout(false);
    }
  };

  const handleViewBookings = () => {
    navigation.getParent()?.navigate('Bookings' as never);
  };

  const getStatusBadgeVariant = (status?: BookingCheckoutStatusValue) => {
    switch (status) {
      case 'AGENDADO':
        return 'success';

      case 'PENDENTE_PAGAMENTO':
        return 'warning';

      case 'EXPIRADO':
        return 'neutral';

      case 'CANCELADO':
        return 'error';

      default:
        return 'primary';
    }
  };

  const isPreparingCheckout =
    createCheckoutMutation.isPending || (!bookingId && !sessionError && !pendingCheckoutLoaded);

  if (isPreparingCheckout) {
    return (
      <Page>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Typography style={styles.centeredText} color="secondary" align="center">
            Preparando checkout seguro...
          </Typography>
        </View>
      </Page>
    );
  }

  if (sessionError) {
    return (
      <Page>
        <View style={styles.centered}>
          <Typography style={styles.errorTitle} variant="h3" weight="bold" align="center">
            Não foi possível iniciar o pagamento
          </Typography>
          <Typography style={styles.errorMessage} color="error" align="center">
            {sessionError}
          </Typography>
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
      </Page>
    );
  }

  return (
    <Page
      scrollable
      header={
        <AppHeader
          title="Pagamento"
          subtitle="Checkout seguro pela Stripe"
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={styles.content}>
        {typedBookingData && displayedPaymentInfo && (
          <Card>
            <View style={styles.resume}>
              <View style={styles.row}>
                <Typography variant="h4" weight="semibold">
                  Resumo da aula
                </Typography>
                <Badge variant={getStatusBadgeVariant(status)} size="sm">
                  {getStatusTitle(status)}
                </Badge>
              </View>

              <SummaryRow label="Instrutor" value={typedBookingData.instructorName} />

              <SummaryRow label="Data" value={formatDate(typedBookingData.date)} />

              <SummaryRow label="Horário" value={typedBookingData.timeSlot} />

              <SummaryRow label="Duração" value={`${typedBookingData.duration} minutos`} />
              <Divider />
              <SummaryRow
                label="Total"
                value={formatCurrency(
                  displayedPaymentInfo.total ?? displayedPaymentInfo.subtotal ?? 0,
                  displayedPaymentInfo.currency,
                )}
                labelColor="primary"
                labelWeight="semibold"
                valueVariant="h4"
                valueWeight="bold"
                valueColor="success"
              />
            </View>
          </Card>
        )}

        {/* <Card style={styles.card}> */}
        <View style={styles.stripeInfos}>
          <Typography variant="h4" weight="semibold">
            {getStatusTitle(status)}
          </Typography>
          {returnDescription && (
            <Typography variant="caption" color="link" weight="medium">
              {returnDescription}
            </Typography>
          )}
          <Typography color="secondary">{getStatusDescription(status)}</Typography>

          {/* <View style={styles.statusMeta}>
            <Typography variant="label" color="secondary">
              Agendamento
            </Typography>
            <Typography variant="caption" weight="medium">
              {bookingId}
            </Typography>
          </View> */}

          <View style={styles.row}>
            {(checkoutSession?.expiresAt ?? resumableCheckoutExpiresAt) &&
              status === 'PENDENTE_PAGAMENTO' && (
                <View style={styles.statusMeta}>
                  <Typography variant="label" color="secondary">
                    Checkout expira em
                  </Typography>
                  <Typography variant="caption" weight="medium">
                    {new Date(
                      checkoutSession?.expiresAt ?? resumableCheckoutExpiresAt ?? '',
                    ).toLocaleString('pt-BR')}
                  </Typography>
                </View>
              )}
            {checkoutStatusQuery.isFetching && (
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
            )}
          </View>
        </View>

        {checkoutStatusQuery.data?.failureMessage && (
          <Typography color="error" align="center">
            {checkoutStatusQuery.data.failureMessage}
          </Typography>
        )}
        {/* </Card> */}

        {status !== 'AGENDADO' && status !== 'CANCELADO' && status !== 'EXPIRADO' && (
          <Button
            title={openingCheckout ? 'Abrindo Checkout...' : 'Abrir Checkout Stripe'}
            onPress={handleOpenCheckout}
            disabled={!(checkoutSession?.checkoutUrl ?? resumableCheckoutUrl) || openingCheckout}
          />
        )}

        {status === 'PENDENTE_PAGAMENTO' &&
          !(checkoutSession?.checkoutUrl ?? resumableCheckoutUrl) && (
            <View style={styles.notice}>
              <Typography
                style={styles.noticeText}
                variant="caption"
                color="secondary"
                align="center"
              >
                Este agendamento está pendente, mas o app não recebeu uma URL ativa de checkout para
                reabrir. Atualize o status ou gere uma nova reserva se o checkout tiver expirado.
              </Typography>
            </View>
          )}

        <View>
          {status === 'PENDENTE_PAGAMENTO' && (
            <Button
              title="Atualizar status"
              variant="outline"
              onPress={() => checkoutStatusQuery.refetch()}
              disabled={!bookingId || checkoutStatusQuery.isFetching}
            />
          )}

          {status === 'AGENDADO' && (
            <Button title="Ver minhas aulas" onPress={handleViewBookings} />
          )}
        </View>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: theme.spacing.sm,
    rowGap: theme.spacing.md,
  },
  resume: {
    rowGap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  totalRow: {
    borderTopColor: theme.colors.border.light,
    borderTopWidth: 1,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  stripeInfos: {
    paddingHorizontal: theme.spacing.sm,
  },

  inlineLoading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    height: scale(40),
    marginBottom: theme.spacing.md,
  },
  statusMeta: {
    marginTop: theme.spacing.sm,
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
