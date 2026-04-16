import { apiClient } from '../../../core/api';
import type {
  InstructorAvailabilityAggregateApiResponse,
  InstructorAvailabilityBulkApiRequest,
  InstructorAvailabilityBulkApiResponse,
  InstructorAvailabilityCalendarApiResponse,
  InstructorAvailabilityCompleteCalendarApiResponse,
  InstructorBookingsPreviewApiResponse,
} from '../types/api';

export const instructorAvailabilityApi = {
  async getInstructorAvailabilityCalendar(
    instructorId: string
  ): Promise<InstructorAvailabilityCalendarApiResponse> {
    const response = await apiClient.get<InstructorAvailabilityCalendarApiResponse>(
      `/instrutores/${instructorId}/calendario-disponibilidade`
    );

    return response.data;
  },

  async getMyAvailability(): Promise<InstructorAvailabilityAggregateApiResponse> {
    const response = await apiClient.get<InstructorAvailabilityAggregateApiResponse>(
      '/instrutores/me/disponibilidades'
    );

    return response.data;
  },

  async saveMyAvailabilityBulk(
    payload: InstructorAvailabilityBulkApiRequest
  ): Promise<InstructorAvailabilityBulkApiResponse> {
    const response = await apiClient.post<InstructorAvailabilityBulkApiResponse>(
      '/instrutores/me/disponibilidades/lote',
      payload
    );

    return response.data;
  },

  async getMyBookingsPreview(): Promise<InstructorBookingsPreviewApiResponse> {
    const response = await apiClient.get<InstructorBookingsPreviewApiResponse>(
      '/instrutores/me/bookings-preview'
    );

    return response.data;
  },

  async getMyAvailabilityCalendar(): Promise<InstructorAvailabilityCalendarApiResponse> {
    const response = await apiClient.get<InstructorAvailabilityCalendarApiResponse>(
      '/instrutores/me/calendario-disponibilidade'
    );

    return response.data;
  },

  async getMyCompleteCalendar(): Promise<InstructorAvailabilityCompleteCalendarApiResponse> {
    const response = await apiClient.get<InstructorAvailabilityCompleteCalendarApiResponse>(
      '/instrutores/me/calendario-completo'
    );

    return response.data;
  },
};
