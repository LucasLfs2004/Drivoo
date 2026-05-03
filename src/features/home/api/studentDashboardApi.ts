import { apiClient } from '../../../core/api';
import type { StudentDashboardApiResponse } from '../types/api';

export const studentDashboardApi = {
  async getDashboard(): Promise<StudentDashboardApiResponse> {
    const response = await apiClient.get<StudentDashboardApiResponse>('/dashboard/aluno');
    return response.data;
  },
};
