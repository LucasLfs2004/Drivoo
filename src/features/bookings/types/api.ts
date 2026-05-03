export type BookingCheckoutApiStatus =
  | 'PENDENTE_PAGAMENTO'
  | 'AGENDADO'
  | 'CONFIRMADO'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'EXPIRADO'
  | 'CANCELADO'
  | 'NAO_COMPARECEU';

export type BookingListApiStatus = BookingCheckoutApiStatus;

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
  valor_aula?: number | null;
  valor_subtotal?: number | null;
  subtotal?: number | null;
  taxa_plataforma?: number | null;
  platform_fee?: number | null;
  valor_total?: number | null;
  total?: number | null;
  moeda?: string | null;
  currency?: string | null;
}

export interface BookingCheckoutSessionApiResponse {
  agendamento_id: string;
  agendamento_status: BookingCheckoutApiStatus;
  transacao_id: string;
  transacao_status: BookingTransactionApiStatus;
  checkout_session_id: string;
  checkout_url: string;
  expires_at: string;
  valor_aula?: number | null;
  valor_subtotal?: number | null;
  subtotal?: number | null;
  taxa_plataforma?: number | null;
  platform_fee?: number | null;
  valor_total?: number | null;
  total?: number | null;
  moeda?: string | null;
  currency?: string | null;
  payment_summary?: BookingPaymentSummaryApiResponse | null;
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
  valor_aula?: number | null;
  valor_subtotal?: number | null;
  subtotal?: number | null;
  taxa_plataforma?: number | null;
  platform_fee?: number | null;
  valor_total?: number | null;
  total?: number | null;
  moeda?: string | null;
  currency?: string | null;
  payment_summary?: BookingPaymentSummaryApiResponse | null;
}

export interface ListMyBookingsApiParams {
  status_filtro?: BookingListApiStatus | null;
  limite?: number;
  offset?: number;
}

export interface BookingListInstructorApiResponse {
  id?: string | null;
  nome?: string | null;
  sobrenome?: string | null;
  nome_completo?: string | null;
  foto_url?: string | null;
}

export interface BookingListVehicleApiResponse {
  id?: string | null;
  marca?: string | null;
  modelo?: string | null;
  tipo_cambio?: string | null;
  transmissao?: string | null;
}

export interface BookingListLocationApiResponse {
  endereco?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BookingListItemApiResponse {
  id?: string;
  agendamento_id?: string;
  instrutor_id?: string | null;
  instrutor?: BookingListInstructorApiResponse | null;
  instrutor_nome?: string | null;
  nome_instrutor?: string | null;
  aluno_id?: string | null;
  data?: string | null;
  data_aula?: string | null;
  data_inicio?: string | null;
  data_hora_inicio?: string | null;
  hora_inicio?: string | null;
  hora_fim?: string | null;
  inicio?: string | null;
  fim?: string | null;
  duracao_minutos?: number | null;
  status?: BookingListApiStatus | string | null;
  agendamento_status?: BookingListApiStatus | string | null;
  valor_aula?: number | null;
  valor_total?: number | null;
  preco?: number | null;
  moeda?: string | null;
  currency?: string | null;
  veiculo?: BookingListVehicleApiResponse | null;
  veiculo_instrutor?: boolean | null;
  veiculo_id?: string | null;
  local?: BookingListLocationApiResponse | string | null;
  endereco?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type ListMyBookingsApiResponse =
  | BookingListItemApiResponse[]
  | {
      data?: BookingListItemApiResponse[];
      items?: BookingListItemApiResponse[];
      agendamentos?: BookingListItemApiResponse[];
      total?: number;
      limite?: number;
      offset?: number;
    };
