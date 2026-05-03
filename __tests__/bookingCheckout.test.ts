import {
  mapBookingCheckoutSession,
  mapBookingCheckoutStatus,
  mapBookingDataToCheckoutPayload,
} from '../src/features/bookings/mappers/mapBookingCheckout';
import { mapCreateCheckoutSessionError } from '../src/features/bookings/utils/checkoutErrors';
import { calculateBookingPaymentInfo } from '../src/features/bookings/utils/payment';
import type { BookingData } from '../src/features/bookings/types/domain';

describe('Booking checkout mapping', () => {
  const bookingData: BookingData = {
    instructorId: 'instrutor-1',
    instructorName: 'Maria Silva',
    vehicleId: 'veiculo-1',
    date: new Date('2026-05-01T12:00:00.000Z'),
    timeSlot: '09:00',
    duration: 60,
    price: 120,
    currency: 'R$',
    vehicleInfo: {
      marca: 'Honda',
      modelo: 'Fit',
      transmissao: 'automatico',
    },
    location: {
      endereco: 'Rua Teste, 123',
    },
    status: 'pending',
  };

  it('maps booking data to checkout session payload', () => {
    expect(mapBookingDataToCheckoutPayload(bookingData)).toEqual({
      instrutor_id: 'instrutor-1',
      data: '2026-05-01',
      hora_inicio: '09:00:00',
      duracao_minutos: 60,
      veiculo_instrutor: false,
      veiculo_id: 'veiculo-1',
    });
  });

  it('maps checkout session response to domain model', () => {
    expect(
      mapBookingCheckoutSession({
        agendamento_id: 'agendamento-1',
        agendamento_status: 'PENDENTE_PAGAMENTO',
        transacao_id: 'transacao-1',
        transacao_status: 'PENDING',
        checkout_session_id: 'cs_test_123',
        checkout_url: 'https://checkout.stripe.com/test',
        expires_at: '2026-05-01T09:10:00-03:00',
      })
    ).toEqual({
      bookingId: 'agendamento-1',
      bookingStatus: 'PENDENTE_PAGAMENTO',
      transactionId: 'transacao-1',
      transactionStatus: 'PENDING',
      checkoutSessionId: 'cs_test_123',
      checkoutUrl: 'https://checkout.stripe.com/test',
      expiresAt: '2026-05-01T09:10:00-03:00',
      paymentInfo: null,
    });
  });

  it('maps checkout status with payment summary fallback fields', () => {
    expect(
      mapBookingCheckoutStatus({
        agendamento_id: 'agendamento-1',
        agendamento_status: 'AGENDADO',
        payment_summary: {
          transacao_id: 'transacao-1',
          transacao_status: 'SUCCEEDED',
          payment_confirmed: true,
          checkout_expires_at: '2026-05-01T09:10:00-03:00',
          paid_at: '2026-05-01T09:02:00-03:00',
          stripe_checkout_session_id: 'cs_test_123',
          stripe_payment_intent_id: 'pi_test_123',
        },
      })
    ).toEqual({
      bookingId: 'agendamento-1',
      bookingStatus: 'AGENDADO',
      transactionId: 'transacao-1',
      transactionStatus: 'SUCCEEDED',
      paymentConfirmed: true,
      checkoutExpiresAt: '2026-05-01T09:10:00-03:00',
      paidAt: '2026-05-01T09:02:00-03:00',
      failureCode: null,
      failureMessage: null,
      stripeCheckoutSessionId: 'cs_test_123',
      stripePaymentIntentId: 'pi_test_123',
      paymentInfo: null,
    });
  });

  it('maps checkout values returned by backend', () => {
    expect(
      mapBookingCheckoutSession({
        agendamento_id: 'agendamento-1',
        agendamento_status: 'PENDENTE_PAGAMENTO',
        transacao_id: 'transacao-1',
        transacao_status: 'PENDING',
        checkout_session_id: 'cs_test_123',
        checkout_url: 'https://checkout.stripe.com/test',
        expires_at: '2026-05-01T09:10:00-03:00',
        valor_aula: 120,
        taxa_plataforma: 0,
        valor_total: 120,
        moeda: 'BRL',
      })
    ).toEqual({
      bookingId: 'agendamento-1',
      bookingStatus: 'PENDENTE_PAGAMENTO',
      transactionId: 'transacao-1',
      transactionStatus: 'PENDING',
      checkoutSessionId: 'cs_test_123',
      checkoutUrl: 'https://checkout.stripe.com/test',
      expiresAt: '2026-05-01T09:10:00-03:00',
      paymentInfo: {
        subtotal: 120,
        platformFee: 0,
        total: 120,
        currency: 'BRL',
      },
    });
  });

  it('calculates local fallback from hourly rate and duration without invented fee', () => {
    expect(
      calculateBookingPaymentInfo({
        price: 120,
        duration: 90,
        currency: 'BRL',
      })
    ).toEqual({
      subtotal: 180,
      platformFee: 0,
      total: 180,
      currency: 'BRL',
    });
  });

  it('maps instructor schedule conflict to a friendly checkout error', () => {
    const error = mapCreateCheckoutSessionError({
      message: 'Instructor already has an appointment at this time',
    });

    expect(error.message).toBe(
      'Este horário acabou de ser reservado por outra pessoa. Escolha outro horário disponível para continuar.'
    );
  });
});
