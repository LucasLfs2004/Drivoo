import apiClient from './api/client';
import type {
  InstructorDetails,
  InstructorDetailsApiResponse,
  InstructorAvailableSlot,
  InstructorAvailableSlotsApiResponse,
} from '../types/instructor';

const mapGenero = (
  genero?: InstructorDetailsApiResponse['genero']
): 'masculino' | 'feminino' => (genero === 'F' ? 'feminino' : 'masculino');

const mapTransmissao = (
  transmissao?: InstructorDetailsApiResponse['veiculo'] extends infer V
    ? V extends { tipo_cambio?: infer T }
      ? T
      : never
    : never
): 'manual' | 'automatico' => (transmissao === 'AUTOMATICO' ? 'automatico' : 'manual');

export const mapInstructorDetailToDomain = (
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
  categorias: (instructor.cnh_categorias?.filter(
    (item): item is 'A' | 'B' => item === 'A' || item === 'B'
  ) ?? []),
  isNovoInstrutor: (instructor.total_avaliacoes ?? 0) === 0,
  totalAulas: instructor.total_aulas ?? 0,
});

const mapAvailableSlot = (
  slot: string | { horario?: string; hora?: string; disponivel?: boolean },
  index: number
): InstructorAvailableSlot => {
  if (typeof slot === 'string') {
    return {
      id: `${slot}-${index}`,
      time: slot,
      available: true,
    };
  }

  const time = slot.horario ?? slot.hora ?? `${index}:00`;

  return {
    id: `${time}-${index}`,
    time,
    available: slot.disponivel ?? true,
  };
};

export const instructorService = {
  async getDetails(instructorId: string): Promise<InstructorDetails> {
    const response = await apiClient.get<InstructorDetailsApiResponse>(`/instrutores/${instructorId}`);
    return mapInstructorDetailToDomain(response.data);
  },

  async getAvailableSlots(
    instructorId: string,
    date: string,
    durationMinutes = 60
  ): Promise<InstructorAvailableSlot[]> {
    const response = await apiClient.get<InstructorAvailableSlotsApiResponse>(
      `/instrutores/${instructorId}/horarios-disponiveis`,
      {
        params: {
          data: date,
          duracao_minutos: durationMinutes,
        },
      }
    );

    return response.data.horarios.map(mapAvailableSlot);
  },
};
