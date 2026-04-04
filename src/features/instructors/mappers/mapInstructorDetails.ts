import type { InstructorDetails } from '../types/domain';
import type { InstructorDetailsApiResponse } from '../types/api';

const mapGenero = (
  genero?: InstructorDetailsApiResponse['genero']
): 'masculino' | 'feminino' | 'outro' | null => {
  if (genero === 'F') {
    return 'feminino';
  }

  if (genero === 'M') {
    return 'masculino';
  }

  if (genero === 'Outro') {
    return 'outro';
  }

  return null;
};

const mapTransmissao = (
  transmissao?: InstructorDetailsApiResponse['veiculo'] extends infer V
    ? V extends { tipo_cambio?: infer T }
      ? T
      : never
    : never
): 'manual' | 'automatico' => (transmissao === 'AUTOMATICO' ? 'automatico' : 'manual');

export const mapInstructorDetails = (
  instructor: InstructorDetailsApiResponse
): InstructorDetails => ({
  id: instructor.id,
  primeiroNome: instructor.nome,
  ultimoNome: instructor.sobrenome,
  avatar: instructor.foto_url ?? undefined,
  avaliacoes: {
    media: instructor.avaliacao_media ?? 0,
    quantidade: instructor.total_avaliacoes ?? 0,
  },
  experienciaAnos: instructor.experiencia_anos ?? 0,
  bio: instructor.bio ?? undefined,
  precos: {
    valorHora: instructor.valor_hora ?? 0,
    moeda: 'BRL',
  },
  veiculo: {
    id: instructor.veiculo?.id ?? '',
    modelo: instructor.veiculo?.modelo ?? '',
    ano: instructor.veiculo?.ano ?? undefined,
    transmissao: mapTransmissao(instructor.veiculo?.tipo_cambio),
    aceitaVeiculoAluno: instructor.veiculo?.aceita_veiculo_aluno ?? false,
  },
  localizacao: {
    distancia: undefined,
    endereco: undefined,
    coordenadas: instructor.coordenadas
      ? {
          latitude: instructor.coordenadas.latitude,
          longitude: instructor.coordenadas.longitude,
        }
      : undefined,
  },
  especialidades: instructor.tags ?? [],
  genero: mapGenero(instructor.genero),
  categorias:
    instructor.cnh_categorias?.filter(
      (item): item is 'A' | 'B' => item === 'A' || item === 'B'
    ) ?? [],
  isNovoInstrutor: (instructor.total_avaliacoes ?? 0) === 0,
  totalAulas: instructor.total_aulas ?? 0,
});
