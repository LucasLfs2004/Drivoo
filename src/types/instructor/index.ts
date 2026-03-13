import type { Coordenadas } from '../auth';

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
  veiculo?: {
    id: string;
    modelo: string;
    ano?: number | null;
    tipo_cambio?: 'MANUAL' | 'AUTOMATICO' | null;
    aceita_veiculo_aluno?: boolean | null;
    ativo?: boolean | null;
  } | null;
  coordenadas?: Coordenadas | null;
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

export interface InstructorAvailableSlotsApiResponse {
  data: string;
  dia_semana: string;
  instrutor_trabalha: boolean;
  horarios: Array<string | { horario?: string; hora?: string; disponivel?: boolean }>;
}
