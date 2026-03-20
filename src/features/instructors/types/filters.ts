import type { Coordenadas } from '../../../types/auth';

export interface FiltrosBusca {
  localizacao?: {
    coordenadas?: Coordenadas;
    raio: number;
    endereco?: string;
  };
  endereco?: string;
  data?: Date;
  horario?: {
    inicio: string;
    fim: string;
  };
  generoInstrutor?: 'masculino' | 'feminino';
  tipoVeiculo?: 'manual' | 'automatico';
  categoriasCnh?: ('A' | 'B')[];
  precoMaximo?: number;
  avaliacaoMinima?: number;
}

export interface ParametrosBusca {
  filtros: FiltrosBusca;
  pagina: number;
  limite: number;
  ordenacao?: 'distancia' | 'preco' | 'avaliacao' | 'disponibilidade';
  direcaoOrdenacao?: 'asc' | 'desc';
}
