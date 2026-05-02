import { apiClient } from '../../../core/api';
import type {
  InstructorFinancialApiResponse,
  InstructorFinancialUpdateApiRequest,
  InstructorStripeOnboardingLinkApiResponse,
} from '../types/api';

export const instructorFinancialApi = {
  async getMyFinancialProfile(): Promise<InstructorFinancialApiResponse> {
    const response = await apiClient.get<InstructorFinancialApiResponse>(
      '/instrutores/me/financeiro'
    );

    return response.data;
  },

  async updateMyFinancialProfile(
    payload: InstructorFinancialUpdateApiRequest
  ): Promise<InstructorFinancialApiResponse> {
    const response = await apiClient.put<InstructorFinancialApiResponse>(
      '/instrutores/me/financeiro',
      payload
    );

    return response.data;
  },

  async createStripeOnboardingLink(): Promise<InstructorStripeOnboardingLinkApiResponse> {
    const response =
      await apiClient.post<InstructorStripeOnboardingLinkApiResponse>(
        '/instrutores/me/stripe/onboarding-link'
      );

    return response.data;
  },
};
