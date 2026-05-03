import { apiClient } from '../../../core/api';
import type { ListMyBookingsApiParams, ListMyBookingsApiResponse } from '../types/api';

export const bookingsApi = {
  async listMine(params: ListMyBookingsApiParams = {}): Promise<ListMyBookingsApiResponse> {
    const response = await apiClient.get<ListMyBookingsApiResponse>('/agendamentos/meus', {
      params: {
        status_filtro: params.status_filtro ?? undefined,
        limite: params.limite ?? 50,
        offset: params.offset ?? 0,
      },
    });

    return response.data;
  },
};
