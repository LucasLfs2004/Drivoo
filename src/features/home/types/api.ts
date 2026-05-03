export type StudentDashboardLessonApiStatus = 'AGENDADO' | 'CONFIRMADO' | string;

export interface StudentDashboardInstructorApi {
  id?: string | null;
  nome?: string | null;
  sobrenome?: string | null;
  foto_url?: string | null;
}

export interface StudentDashboardAddressApi {
  completo?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}

export interface StudentDashboardVehicleApi {
  modelo?: string | null;
  tipo_cambio?: string | null;
}

export interface StudentDashboardNextLessonApi {
  id?: string | null;
  instrutor?: StudentDashboardInstructorApi | null;
  inicio?: string | null;
  fim?: string | null;
  status?: StudentDashboardLessonApiStatus | null;
  endereco?: StudentDashboardAddressApi | null;
  veiculo?: StudentDashboardVehicleApi | null;
}

export interface StudentDashboardProgressApi {
  aulas_concluidas?: number | null;
  horas_pratica?: number | null;
  ultima_aula?: string | null;
}

export interface StudentDashboardBookingSummaryApi {
  proximas?: number | null;
  concluidas?: number | null;
  canceladas?: number | null;
}

export interface StudentDashboardStatsApi {
  instrutores_diferentes?: number | null;
  avaliacao_media_dada?: number | null;
}

export interface StudentDashboardApiResponse {
  tipo?: 'aluno' | string;
  proxima_aula?: StudentDashboardNextLessonApi | null;
  progresso?: StudentDashboardProgressApi | null;
  resumo_agendamentos?: StudentDashboardBookingSummaryApi | null;
  estatisticas?: StudentDashboardStatsApi | null;
}
