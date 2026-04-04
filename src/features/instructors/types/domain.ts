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

export interface InstructorAvailableSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface InstructorVehicle {
  id: string;
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
