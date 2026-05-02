import type { BookingData } from '../types/domain';
import type {
  BookingCheckoutSessionApiResponse,
  BookingCheckoutStatusApiResponse,
  CreateBookingCheckoutSessionApiRequest,
} from '../types/api';
import type {
  BookingCheckoutSession,
  BookingCheckoutStatus,
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
});
