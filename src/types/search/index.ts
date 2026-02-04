// Search and filtering types
import type { Coordenadas } from '../auth';

export interface FiltrosBusca {
  localizacao?: {
    coordenadas: Coordenadas;
    raio: number; // km
  };
  data?: Date;
  horario?: {
    inicio: string; // HH:mm
    fim: string;    // HH:mm
  };
  generoInstrutor?: 'masculino' | 'feminino';
  tipoVeiculo?: 'manual' | 'automatico';
  categoriasCnh?: ('A' | 'B')[];
  precoMaximo?: number;
  avaliacaoMinima?: number;
}

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
    marca: string;
    modelo: string;
    transmissao: 'manual' | 'automatico';
  };
  localizacao: {
    distancia: number; // km
    endereco: string;
  };
  disponibilidade: {
    proximoSlot?: Date;
    slotsDisponiveis: number;
  };
  especialidades: string[];
  genero: 'masculino' | 'feminino';
  categorias: ('A' | 'B')[];
}

export interface ParametrosBusca {
  filtros: FiltrosBusca;
  pagina: number;
  limite: number;
  ordenacao?: 'distancia' | 'preco' | 'avaliacao' | 'disponibilidade';
  direcaoOrdenacao?: 'asc' | 'desc';
}

// Re-export coordenadas from auth types
export type { Coordenadas } from '../auth';