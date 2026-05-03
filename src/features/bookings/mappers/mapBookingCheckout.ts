import type { BookingData } from '../types/domain';
import type {
  BookingCheckoutSessionApiResponse,
  BookingCheckoutStatusApiResponse,
  CreateBookingCheckoutSessionApiRequest,
} from '../types/api';
import type {
  BookingCheckoutSession,
  BookingCheckoutStatus,
  PaymentSummary,
} from '../types/domain';

const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const toApiTime = (timeSlot: string): string => {
  const trimmed = timeSlot.trim();
  return trimmed.split(':').length === 2 ? `${trimmed}:00` : trimmed;
};

export const mapBookingDataToCheckoutPayload = (
  bookingData: BookingData
): CreateBookingCheckoutSessionApiRequest => ({
  instrutor_id: bookingData.instructorId,
  data: toDateOnly(bookingData.date),
  hora_inicio: toApiTime(bookingData.timeSlot),
  duracao_minutos: bookingData.duration,
  veiculo_instrutor: !bookingData.vehicleId,
  veiculo_id: bookingData.vehicleId ?? null,
});

const getNumber = (
  ...values: Array<number | null | undefined>
): number | null => {
  const value = values.find(
    candidate => typeof candidate === 'number' && Number.isFinite(candidate)
  );

  return value ?? null;
};

const getString = (
  ...values: Array<string | null | undefined>
): string | null => {
  const value = values.find(
    candidate => typeof candidate === 'string' && candidate.trim()
  );

  return value?.trim() ?? null;
};

const mapPaymentSummary = (
  response: BookingCheckoutSessionApiResponse | BookingCheckoutStatusApiResponse
): PaymentSummary | null => {
  const summary = response.payment_summary;
  const subtotal = getNumber(
    response.valor_aula,
    response.valor_subtotal,
    response.subtotal,
    summary?.valor_aula,
    summary?.valor_subtotal,
    summary?.subtotal
  );
  const platformFee = getNumber(
    response.taxa_plataforma,
    response.platform_fee,
    summary?.taxa_plataforma,
    summary?.platform_fee
  );
  const total = getNumber(
    response.valor_total,
    response.total,
    summary?.valor_total,
    summary?.total
  );
  const currency = getString(
    response.moeda,
    response.currency,
    summary?.moeda,
    summary?.currency
  ) ?? 'BRL';

  if (subtotal === null && platformFee === null && total === null) {
    return null;
  }

  return {
    subtotal,
    platformFee,
    total,
    currency,
  };
};

export const mapBookingCheckoutSession = (
  response: BookingCheckoutSessionApiResponse
): BookingCheckoutSession => ({
  bookingId: response.agendamento_id,
  bookingStatus: response.agendamento_status,
  transactionId: response.transacao_id,
  transactionStatus: response.transacao_status,
  checkoutSessionId: response.checkout_session_id,
  checkoutUrl: response.checkout_url,
  expiresAt: response.expires_at,
  paymentInfo: mapPaymentSummary(response),
});

export const mapBookingCheckoutStatus = (
  response: BookingCheckoutStatusApiResponse
): BookingCheckoutStatus => ({
  bookingId: response.agendamento_id,
  bookingStatus: response.agendamento_status,
  transactionId:
    response.transacao_id ?? response.payment_summary?.transacao_id ?? null,
  transactionStatus:
    response.transacao_status ??
    response.payment_summary?.transacao_status ??
    null,
  paymentConfirmed:
    response.payment_confirmed ??
    response.payment_summary?.payment_confirmed ??
    false,
  checkoutExpiresAt:
    response.checkout_expires_at ??
    response.payment_summary?.checkout_expires_at ??
    null,
  paidAt: response.paid_at ?? response.payment_summary?.paid_at ?? null,
  failureCode:
    response.failure_code ?? response.payment_summary?.failure_code ?? null,
  failureMessage:
    response.failure_message ??
    response.payment_summary?.failure_message ??
    null,
  stripeCheckoutSessionId:
    response.stripe_checkout_session_id ??
    response.payment_summary?.stripe_checkout_session_id ??
    null,
  stripePaymentIntentId:
    response.stripe_payment_intent_id ??
    response.payment_summary?.stripe_payment_intent_id ??
    null,
  paymentInfo: mapPaymentSummary(response),
});
