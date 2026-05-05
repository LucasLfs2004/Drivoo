import { apiClient } from '../../../core/api';
import type {
  BookingDetailsApiResponse,
  CancelBookingApiRequest,
  CancelBookingApiResponse,
  ListMyBookingsApiParams,
  ListMyBookingsApiResponse,
} from '../types/api';

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
};
