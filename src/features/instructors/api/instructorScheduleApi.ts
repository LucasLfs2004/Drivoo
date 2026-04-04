import { apiClient } from '../../../core/api';
import type {
  InstructorAvailabilityCreateApiRequest,
  InstructorAvailabilityUpdateApiRequest,
  MyInstructorScheduleApiResponse,
} from '../types/api';

export const instructorScheduleApi = {
  async listMyAvailability(): Promise<MyInstructorScheduleApiResponse> {
    const response = await apiClient.get<MyInstructorScheduleApiResponse>(
      '/instrutores/me/disponibilidades'
    );

    return response.data;
  },

  async createMyAvailability(payload: InstructorAvailabilityCreateApiRequest) {
    const response = await apiClient.post('/instrutores/me/disponibilidades', payload);
    return response.data;
  },

  async updateMyAvailability(
    availabilityId: string,
    payload: InstructorAvailabilityUpdateApiRequest
  ) {
    const response = await apiClient.put(
      `/instrutores/me/disponibilidades/${availabilityId}`,
      payload
    );

    return response.data;
  },

  async deleteMyAvailability(availabilityId: string): Promise<void> {
    await apiClient.delete(`/instrutores/me/disponibilidades/${availabilityId}`);
  },
};
