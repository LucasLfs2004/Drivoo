export type BookingCheckoutApiStatus =
  | 'PENDENTE_PAGAMENTO'
  | 'AGENDADO'
  | 'EXPIRADO'
  | 'CANCELADO';

export type BookingTransactionApiStatus =
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED'
  | 'REFUNDED'
  | string;

export interface CreateBookingCheckoutSessionApiRequest {
  instrutor_id: string;
  data: string;
  hora_inicio: string;
  duracao_minutos: number;
  veiculo_instrutor: boolean;
  veiculo_id: string | null;
}

export interface BookingPaymentSummaryApiResponse {
  transacao_id?: string | null;
  transacao_status?: BookingTransactionApiStatus | null;
  payment_confirmed?: boolean | null;
  checkout_expires_at?: string | null;
  paid_at?: string | null;
  failure_code?: string | null;
  failure_message?: string | null;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
}

export interface BookingCheckoutSessionApiResponse {
  agendamento_id: string;
  agendamento_status: BookingCheckoutApiStatus;
  transacao_id: string;
  transacao_status: BookingTransactionApiStatus;
  checkout_session_id: string;
  checkout_url: string;
  expires_at: string;
}

export interface BookingCheckoutStatusApiResponse {
  agendamento_id: string;
  agendamento_status: BookingCheckoutApiStatus;
  transacao_id?: string | null;
  transacao_status?: BookingTransactionApiStatus | null;
  payment_confirmed?: boolean | null;
  checkout_expires_at?: string | null;
  paid_at?: string | null;
  failure_code?: string | null;
  failure_message?: string | null;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  payment_summary?: BookingPaymentSummaryApiResponse | null;
}
