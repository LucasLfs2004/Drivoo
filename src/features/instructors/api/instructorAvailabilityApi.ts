import { apiClient } from '../../../core/api';
import type { InstructorAvailableSlotsApiResponse } from '../types/api';

export const instructorAvailabilityApi = {
  async getAvailableSlots(
    instructorId: string,
    date: string,
    durationMinutes = 60
  ): Promise<InstructorAvailableSlotsApiResponse> {
    const response = await apiClient.get<InstructorAvailableSlotsApiResponse>(
      `/instrutores/${instructorId}/horarios-disponiveis`,
      {
        params: {
          data: date,
          duracao_minutos: durationMinutes,
        },
      }
    );

    return response.data;
  },
};
