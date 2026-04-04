import { apiClient } from '../../../core/api';
import type {
  InstructorDetailsApiResponse,
  InstructorProfileUpdateApiRequest,
} from '../types/api';

export const instructorProfileApi = {
  async getMyProfile(): Promise<InstructorDetailsApiResponse> {
    const response = await apiClient.get<InstructorDetailsApiResponse>('/instrutores/me');
    return response.data;
  },

  async updateMyProfile(
    payload: InstructorProfileUpdateApiRequest
  ): Promise<InstructorDetailsApiResponse> {
    const response = await apiClient.put<InstructorDetailsApiResponse>(
      '/instrutores/me',
      payload
    );

    return response.data;
  },
};
