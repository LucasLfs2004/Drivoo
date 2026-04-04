import type { Coordenadas } from '../../../types/auth';

export interface SearchInstructorApiResponse {
  total: number;
  instrutores: SearchInstructorApiInstructor[];
}

export interface SearchInstructorApiInstructor {
  id: string;
  nome: string;
  sobrenome: string;
  foto_url?: string | null;
  avaliacao_media?: number | null;
  total_avaliacoes?: number | null;
  valor_hora?: number | null;
  experiencia_anos?: number | null;
  genero?: 'M' | 'F' | 'Outro' | null;
  distancia_km?: number | null;
  coordenadas?: Coordenadas | null;
  veiculo?: {
    id: string;
    modelo: string;
    ano?: number | null;
    tipo_cambio?: 'MANUAL' | 'AUTOMATICO' | null;
    aceita_veiculo_aluno?: boolean | null;
    ativo?: boolean | null;
  } | null;
  tags?: string[] | null;
  disponivel_data?: string | null;
}

export interface InstructorDetailsApiResponse {
  id: string;
  nome: string;
  sobrenome: string;
  foto_url?: string | null;
  genero?: 'M' | 'F' | 'Outro' | null;
  avaliacao_media?: number | null;
  total_avaliacoes?: number | null;
  total_aulas?: number | null;
  experiencia_anos?: number | null;
  valor_hora?: number | null;
  cnh_categorias?: string[] | null;
  bio?: string | null;
  tags?: string[] | null;
  veiculo?: InstructorVehicleApiResponse | null;
  coordenadas?: Coordenadas | null;
}

export interface InstructorAvailableSlotsApiResponse {
  data: string;
  dia_semana: string;
  instrutor_trabalha: boolean;
  horarios: Array<string | { horario?: string; hora?: string; disponivel?: boolean }>;
}

export interface InstructorVehicleApiResponse {
  id: string;
  modelo: string;
  ano?: number | null;
  placa?: string | null;
  tipo_cambio?: 'MANUAL' | 'AUTOMATICO' | null;
  aceita_veiculo_aluno?: boolean | null;
  ativo?: boolean | null;
}

export type MyInstructorVehiclesApiResponse = InstructorVehicleApiResponse[];

export interface InstructorProfileUpdateApiRequest {
  valor_hora?: number | null;
  experiencia_anos?: number | null;
  bio?: string | null;
  tags?: string[] | null;
  genero?: 'M' | 'F' | 'Outro' | null;
}

export interface InstructorVehicleCreateApiRequest {
  modelo: string;
  ano?: number | null;
  placa?: string | null;
  tipo_cambio: 'MANUAL' | 'AUTOMATICO';
  aceita_veiculo_aluno?: boolean;
}

export interface InstructorVehicleUpdateApiRequest {
  modelo?: string | null;
  ano?: number | null;
  placa?: string | null;
  tipo_cambio?: 'MANUAL' | 'AUTOMATICO' | null;
  aceita_veiculo_aluno?: boolean | null;
  ativo?: boolean | null;
}

export interface InstructorScheduleAvailabilityApiResponse {
  id: string;
  dia_semana: number;
  dia_nome: string;
  hora_inicio: string;
  hora_fim: string;
  intervalo_inicio?: string | null;
  intervalo_fim?: string | null;
  ativo: boolean;
}

export type MyInstructorScheduleApiResponse = InstructorScheduleAvailabilityApiResponse[];

export interface InstructorAvailabilityCreateApiRequest {
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  intervalo_inicio?: string | null;
  intervalo_fim?: string | null;
}

export interface InstructorAvailabilityUpdateApiRequest {
  hora_inicio?: string | null;
  hora_fim?: string | null;
  intervalo_inicio?: string | null;
  intervalo_fim?: string | null;
  ativo?: boolean | null;
}

export interface InstructorEarningsHistoryItemApiResponse {
  id?: string | null;
  aluno_nome?: string | null;
  student_name?: string | null;
  descricao?: string | null;
  description?: string | null;
  valor?: number | null;
  valor_bruto?: number | null;
  valor_liquido?: number | null;
  ganho_liquido?: number | null;
  amount?: number | null;
  data?: string | null;
  data_aula?: string | null;
  data_pagamento?: string | null;
  status?: string | null;
}

export interface InstructorEarningsHistoryApiResponse {
  total?: number | null;
  total_ganhos?: number | null;
  historico?: InstructorEarningsHistoryItemApiResponse[] | null;
}

export interface InstructorRecentPaymentSummaryApiResponse {
  total_pago?: number | null;
  total_pendente?: number | null;
}

export interface InstructorRecentPaymentItemApiResponse {
  id?: string | null;
  aluno_nome?: string | null;
  student_name?: string | null;
  descricao?: string | null;
  description?: string | null;
  valor?: number | null;
  valor_bruto?: number | null;
  valor_liquido?: number | null;
  amount?: number | null;
  data?: string | null;
  data_pagamento?: string | null;
  status?: string | null;
}

export interface InstructorRecentPaymentsApiResponse {
  total?: number | null;
  resumo?: InstructorRecentPaymentSummaryApiResponse | null;
  pagamentos?: InstructorRecentPaymentItemApiResponse[] | null;
}

export interface InstructorEarningsTrendQueryParams {
  periodo?: 'dia' | 'semana' | 'mes';
  data_inicio?: string;
  data_fim?: string;
}
