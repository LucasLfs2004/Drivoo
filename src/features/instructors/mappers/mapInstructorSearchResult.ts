import type { InstrutorDisponivel, ResultadoBusca } from '../types/domain';
import type { FiltrosBusca } from '../types/filters';
import type {
  SearchInstructorApiInstructor,
  SearchInstructorApiResponse,
} from '../types/api';

const mapGenero = (
  genero?: SearchInstructorApiInstructor['genero']
): 'masculino' | 'feminino' => (genero === 'F' ? 'feminino' : 'masculino');

const mapCambio = (
  cambio?: SearchInstructorApiInstructor['veiculo'] extends infer V
    ? V extends { tipo_cambio?: infer T }
      ? T
      : never
    : never
): 'manual' | 'automatico' => (cambio === 'AUTOMATICO' ? 'automatico' : 'manual');

export const mapInstructorSearchItem = (
  instructor: SearchInstructorApiInstructor
): InstrutorDisponivel => ({
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
    distancia:
      instructor.distancia_km != null
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
    proximoSlot: instructor.disponivel_data
      ? new Date(instructor.disponivel_data)
      : undefined,
    slotsDisponiveis: instructor.disponivel_data ? 1 : undefined,
  },
  especialidades: instructor.tags?.length ? instructor.tags : [],
  genero: mapGenero(instructor.genero),
  categorias: [],
});

export const applyInstructorSearchFilters = (
  instructors: InstrutorDisponivel[],
  filtros: FiltrosBusca
): InstrutorDisponivel[] =>
  instructors.filter((instructor) => {
    if (filtros.precoMaximo && instructor.precos.valorHora > filtros.precoMaximo) {
      return false;
    }

    if (filtros.avaliacaoMinima && instructor.avaliacoes.media < filtros.avaliacaoMinima) {
      return false;
    }

    return true;
  });

export const mapInstructorSearchResult = (
  response: SearchInstructorApiResponse,
  filtros: FiltrosBusca,
  pagina: number,
  limite: number
): ResultadoBusca => {
  const mapped = response.instrutores.map(mapInstructorSearchItem);
  const filtered = applyInstructorSearchFilters(mapped, filtros);
  const total = filtered.length;

  return {
    instrutores: filtered,
    total,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(total / limite)),
    temMais: pagina * limite < total,
  };
};
