import type { Coordenadas } from '../../../types/auth';

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
  genero: 'masculino' | 'feminino';
  categorias: ('A' | 'B')[];
  isNovoInstrutor: boolean;
  totalAulas: number;
}

export interface InstructorAvailableSlot {
  id: string;
  time: string;
  available: boolean;
}
