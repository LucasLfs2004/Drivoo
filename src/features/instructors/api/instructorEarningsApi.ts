import { apiClient } from '../../../core/api';
import type {
  InstructorEarningsHistoryApiResponse,
  InstructorEarningsTrendQueryParams,
  InstructorRecentPaymentsApiResponse,
} from '../types/api';

export const instructorEarningsApi = {
  async getMyEarningsHistory(): Promise<InstructorEarningsHistoryApiResponse> {
    const response = await apiClient.get<InstructorEarningsHistoryApiResponse>(
      '/instrutores/me/ganhos/historico'
    );

    return response.data;
  },

  async getMyRecentPayments(): Promise<InstructorRecentPaymentsApiResponse> {
    const response = await apiClient.get<InstructorRecentPaymentsApiResponse>(
      '/instrutores/me/pagamentos/recentes'
    );

    return response.data;
  },

  async getMyEarningsTrend(
    params: InstructorEarningsTrendQueryParams = { periodo: 'mes' }
  ): Promise<unknown> {
    const response = await apiClient.get<unknown>(
      '/instrutores/me/ganhos/tendencia',
      { params }
    );

    return response.data;
  },
};
