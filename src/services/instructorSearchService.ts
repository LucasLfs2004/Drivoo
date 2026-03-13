import apiClient from './api/client';
import type { FiltrosBusca, ResultadoBusca, InstrutorDisponivel } from '../types/search';

interface SearchInstructorApiResponse {
  total: number;
  instrutores: SearchInstructorApiInstructor[];
}

interface SearchInstructorApiInstructor {
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
  coordenadas?: {
    latitude: number;
    longitude: number;
  } | null;
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

interface SearchInstructorsParams {
  filtros: FiltrosBusca;
  latitude: number;
  longitude: number;
  pagina?: number;
  limite?: number;
}

const mapGenero = (genero?: SearchInstructorApiInstructor['genero']): 'masculino' | 'feminino' => {
  return genero === 'F' ? 'feminino' : 'masculino';
};

const mapCambio = (
  cambio?: SearchInstructorApiInstructor['veiculo'] extends infer V
    ? V extends { tipo_cambio?: infer T }
      ? T
      : never
    : never
): 'manual' | 'automatico' => {
  return cambio === 'AUTOMATICO' ? 'automatico' : 'manual';
};

const mapInstructor = (
  instructor: SearchInstructorApiInstructor
): InstrutorDisponivel => {
  const especialidades = instructor.tags?.length
    ? instructor.tags
    : [];

  return {
    id: instructor.id,
    primeiroNome: instructor.nome,
    ultimoNome: instructor.sobrenome,
    avatar: instructor.foto_url ?? undefined,
    avaliacoes: {
      media: instructor.avaliacao_media ?? 0,
      quantidade: instructor.total_avaliacoes ?? 0,
    },
    precos: {
      valorHora: instructor.valor_hora ?? 0,
      moeda: 'BRL',
    },
    veiculo: {
      marca: undefined,
      modelo: instructor.veiculo?.modelo ?? '',
      transmissao: mapCambio(instructor.veiculo?.tipo_cambio),
      aceitaVeiculoAluno: instructor.veiculo?.aceita_veiculo_aluno ?? undefined,
    },
    localizacao: {
      distancia: instructor.distancia_km != null
        ? Number(instructor.distancia_km.toFixed(1))
        : undefined,
      endereco: undefined,
      coordenadas: instructor.coordenadas
        ? {
            latitude: instructor.coordenadas.latitude,
            longitude: instructor.coordenadas.longitude,
          }
        : undefined,
    },
    disponibilidade: {
      proximoSlot: instructor.disponivel_data ? new Date(instructor.disponivel_data) : undefined,
      slotsDisponiveis: instructor.disponivel_data ? 1 : undefined,
    },
    especialidades,
    genero: mapGenero(instructor.genero),
    categorias: [],
  };
};

const applyClientSideFilters = (
  instructors: InstrutorDisponivel[],
  filtros: FiltrosBusca
): InstrutorDisponivel[] => {
  return instructors.filter(instructor => {
    if (filtros.precoMaximo && instructor.precos.valorHora > filtros.precoMaximo) {
      return false;
    }

    if (filtros.avaliacaoMinima && instructor.avaliacoes.media < filtros.avaliacaoMinima) {
      return false;
    }

    return true;
  });
};

export const instructorSearchService = {
  async search({
    filtros,
    latitude,
    longitude,
    pagina = 1,
    limite = 20,
  }: SearchInstructorsParams): Promise<ResultadoBusca> {
    const offset = (pagina - 1) * limite;

    const response = await apiClient.get<SearchInstructorApiResponse>('/instrutores/buscar', {
      params: {
        latitude,
        longitude,
        raio_km: filtros.localizacao?.raio ?? 10,
        ordenar_por: 'proximidade',
        tipo_cambio:
          filtros.tipoVeiculo === 'manual'
            ? 'MANUAL'
            : filtros.tipoVeiculo === 'automatico'
              ? 'AUTOMATICO'
              : undefined,
        genero:
          filtros.generoInstrutor === 'masculino'
            ? 'M'
            : filtros.generoInstrutor === 'feminino'
              ? 'F'
              : undefined,
        limite,
        offset,
      },
    });

    const mapped = response.data.instrutores.map(mapInstructor);
    const filtered = applyClientSideFilters(mapped, filtros);
    const total = filtered.length;

    return {
      instrutores: filtered,
      total,
      pagina,
      totalPaginas: Math.max(1, Math.ceil(total / limite)),
      temMais: pagina * limite < total,
    };
  },
};
