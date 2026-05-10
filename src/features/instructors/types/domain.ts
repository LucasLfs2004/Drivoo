import type { AgendaSemanal, Coordenadas } from '../../../types/auth';

export interface ResultadoBusca {
  instrutores: InstrutorDisponivel[];
  total: number;
  pagina: number;
  totalPaginas: number;
  temMais: boolean;
}

export interface InstrutorDisponivel {
  id: string;
  primeiroNome: string;
  ultimoNome: string;
  avatar?: string;
  avaliacoes: {
    media: number;
    quantidade: number;
  };
  precos: {
    valorHora: number;
    moeda: 'BRL';
  };
  veiculo: {
    marca?: string;
    modelo: string;
    transmissao: 'manual' | 'automatico';
    aceitaVeiculoAluno?: boolean;
  };
  localizacao: {
    distancia?: number;
    endereco?: string;
    coordenadas?: Coordenadas;
  };
  disponibilidade: {
    proximoSlot?: Date;
    slotsDisponiveis?: number;
  };
  especialidades: string[];
  genero: 'masculino' | 'feminino';
  categorias: ('A' | 'B')[];
}

export interface InstructorDetails {
  id: string;
  primeiroNome: string;
  ultimoNome: string;
  avatar?: string;
  avaliacoes: {
    media: number;
    quantidade: number;
  };
  experienciaAnos: number;
  bio?: string;
  precos: {
    valorHora: number;
    moeda: 'BRL';
  };
  veiculo: {
    id: string;
    marca?: string;
    modelo: string;
    ano?: number;
    transmissao: 'manual' | 'automatico';
    aceitaVeiculoAluno: boolean;
  };
  localizacao: {
    distancia?: number;
    endereco?: string;
    coordenadas?: Coordenadas;
  };
  especialidades: string[];
  genero: 'masculino' | 'feminino' | 'outro' | null;
  categorias: ('A' | 'B')[];
  isNovoInstrutor: boolean;
  totalAulas: number;
}

export interface InstructorVehicle {
  id: string;
  marca?: string;
  modelo: string;
  ano?: number;
  placa?: string;
  transmissao: 'manual' | 'automatico';
  aceitaVeiculoAluno: boolean;
  ativo: boolean;
}

export interface InstructorAvailability {
  id: string;
  dayIndex: number;
  dayName: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  active: boolean;
}

export interface InstructorSchedule {
  agenda: AgendaSemanal;
  availabilities: InstructorAvailability[];
}

export type InstructorPaymentStatus = 'paid' | 'pending' | 'failed' | 'unknown';

export interface InstructorRecentPayment {
  id: string;
  description: string;
  amount: number;
  date?: Date;
  status: InstructorPaymentStatus;
}

export interface InstructorEarningsTrendPoint {
  id: string;
  label: string;
  value: number;
  date?: Date;
}

export interface InstructorEarningsOverview {
  totalEarnings: number;
  currentMonthEarnings: number;
  historyCount: number;
  historyItems: InstructorRecentPayment[];
  recentPayments: InstructorRecentPayment[];
  paymentSummary: {
    totalCount: number;
    totalPaid: number;
    totalPending: number;
  };
  trend: {
    points: InstructorEarningsTrendPoint[];
    unavailable: boolean;
  };
}

export interface InstructorFinancialSummaryPeriod {
  startDate: string;
  endDate: string;
  days: number;
}

export interface InstructorFinancialSummary {
  instructorId: string;
  period: InstructorFinancialSummaryPeriod;
  amounts: {
    received: number;
    completedInPeriod: number;
    completedInPreviousPeriod: number;
    completedVariationPercent: number;
    availableForPayout: number;
    processing: number;
    toRelease: number;
    blockedUnderReview: number;
    payoutFailed: number;
    forecastFutureConfirmedLessons: number;
  };
  futureConfirmedLessons: {
    count: number;
    instructorAmount: number;
  };
  periodMovement: {
    lessonsInPeriod: number;
    created: number;
    scheduled: number;
    forecasted: number;
    completed: number;
    canceled: number;
    noShow: number;
    scheduledAmount: number;
    completedAmount: number;
    forecastedAmount: number;
  };
  financialEvolution: {
    type: string;
    total: number;
    points: InstructorFinancialEvolutionPoint[];
  };
  lessonsByStatus: InstructorFinancialStatusSummary[];
  recentLessons: InstructorFinancialRecentLesson[];
  isEmpty: boolean;
}

export interface InstructorFinancialEvolutionPoint {
  id: string;
  date: string;
  label: string;
  value: number;
  accumulated: number;
  lessonsCount: number;
}

export interface InstructorFinancialStatusSummary {
  id: string;
  status: string;
  label: string;
  count: number;
}

export interface InstructorFinancialRecentLesson {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  student: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: string;
  statusLabel: string;
  location: {
    summary: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    fullAddress?: string;
  };
  instructorAmount: number;
  totalAmount: number;
  evaluated: boolean;
}

export type InstructorFiscalType = 'PF' | 'MEI';

export interface InstructorFinancialProfile {
  stripeAccountId: string | null;
  stripeAccountStatus: string;
  fiscalType: InstructorFiscalType | null;
  eligibility: string | null;
  pendingItems: string[];
  cpf: string;
  phone: string;
  birthDate: string;
  contractAccepted: boolean;
  taxResponsibilityAccepted: boolean;
  contractAcceptedAt: string | null;
  taxResponsibilityAcceptedAt: string | null;
  cnpj: string;
  legalName: string;
  tradeName: string;
  fiscalAddress: string;
  stripePendingRequirements: string[];
  stripeOnboardingCompletedAt: string | null;
}

export interface InstructorFinancialFormValues {
  fiscalType: InstructorFiscalType;
  cpf: string;
  phone: string;
  birthDate: string;
  contractAccepted: boolean;
  taxResponsibilityAccepted: boolean;
  cnpj: string;
  legalName: string;
  tradeName: string;
  fiscalAddress: string;
}

export interface InstructorStripeOnboardingLink {
  instructorId: string;
  stripeAccountId: string;
  onboardingUrl: string;
  expiresAt: string;
  createdAccount: boolean;
}
