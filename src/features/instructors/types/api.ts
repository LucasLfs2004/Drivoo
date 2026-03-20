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

export interface InstructorAvailableSlotsApiResponse {
  data: string;
  dia_semana: string;
  instrutor_trabalha: boolean;
  horarios: Array<string | { horario?: string; hora?: string; disponivel?: boolean }>;
}
