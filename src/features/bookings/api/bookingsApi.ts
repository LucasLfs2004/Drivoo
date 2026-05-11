import { apiClient } from '../../../core/api';
import type {
  BookingDetailsApiResponse,
  CancelBookingApiRequest,
  CancelBookingApiResponse,
  ListMyBookingsApiParams,
  ListMyBookingsApiResponse,
  UpdateBookingStatusApiRequest,
  UpdateBookingStatusApiResponse,
} from '../types/api';

export const bookingsApi = {
  async listMine(params: ListMyBookingsApiParams = {}): Promise<ListMyBookingsApiResponse> {
    const response = await apiClient.get<ListMyBookingsApiResponse>('/agendamentos/meus', {
      params: {
        status_filtro: params.status_filtro ?? undefined,
        ordenar_por: params.ordenar_por ?? 'data_aula',
        ordem: params.ordem ?? 'asc',
        limite: params.limite ?? 50,
        offset: params.offset ?? 0,
      },
    });

    return response.data;
  },

  async getById(bookingId: string): Promise<BookingDetailsApiResponse> {
    const response = await apiClient.get<BookingDetailsApiResponse>(`/agendamentos/${bookingId}`);

    return response.data;
  },

  async cancel(
    bookingId: string,
    payload: CancelBookingApiRequest = {},
  ): Promise<CancelBookingApiResponse> {
    const response = await apiClient.post<CancelBookingApiResponse>(
      `/agendamentos/${bookingId}/cancelar`,
      { motivo: payload.motivo ?? null },
    );

    return response.data;
  },

  async updateStatus(
    bookingId: string,
    payload: UpdateBookingStatusApiRequest,
  ): Promise<UpdateBookingStatusApiResponse> {
    const response = await apiClient.put<UpdateBookingStatusApiResponse>(
      `/agendamentos/${bookingId}/status`,
      payload,
    );

    return response.data;
  },
};
