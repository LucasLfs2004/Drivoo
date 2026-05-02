import { apiClient } from '../../../core/api';
import type {
  BookingCheckoutSessionApiResponse,
  BookingCheckoutStatusApiResponse,
  CreateBookingCheckoutSessionApiRequest,
} from '../types/api';

export const bookingCheckoutApi = {
  async createCheckoutSession(
    payload: CreateBookingCheckoutSessionApiRequest
  ): Promise<BookingCheckoutSessionApiResponse> {
    const response = await apiClient.post<BookingCheckoutSessionApiResponse>(
      '/agendamentos/checkout-session',
      payload
    );

    return response.data;
  },

  async getCheckoutStatus(
    bookingId: string
  ): Promise<BookingCheckoutStatusApiResponse> {
    const response = await apiClient.get<BookingCheckoutStatusApiResponse>(
      `/agendamentos/${bookingId}/checkout-status`
    );

    return response.data;
  },
};
