import { apiClient } from '../../../core/api';
import type { InstructorDetailsApiResponse } from '../types/api';

export const instructorDetailsApi = {
  async getDetails(instructorId: string): Promise<InstructorDetailsApiResponse> {
    const response = await apiClient.get<InstructorDetailsApiResponse>(
      `/instrutores/${instructorId}`
    );

    return response.data;
  },
};
