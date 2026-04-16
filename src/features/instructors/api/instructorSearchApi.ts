import { apiClient } from '../../../core/api';
import type { SearchInstructorApiResponse } from '../types/api';
import type { FiltrosBusca } from '../types/filters';

interface InstructorSearchParams {
  filtros: FiltrosBusca;
  latitude: number;
  longitude: number;
  pagina?: number;
  limite?: number;
}

export const instructorSearchApi = {
  async search({
    filtros,
    latitude,
    longitude,
    pagina = 1,
    limite = 20,
  }: InstructorSearchParams): Promise<SearchInstructorApiResponse> {
    const offset = (pagina - 1) * limite;

    const response = await apiClient.get<SearchInstructorApiResponse>('/instrutores/buscar', {
      params: {
        latitude,
        longitude,
        raio_km: filtros.localizacao?.raio ?? 30,
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

    return response.data;
  },
};
