import { apiClient } from '../../../core/api';
import type {
  InstructorVehicleCreateApiRequest,
  InstructorVehicleUpdateApiRequest,
  MyInstructorVehiclesApiResponse,
} from '../types/api';

export const instructorVehiclesApi = {
  async listMyVehicles(): Promise<MyInstructorVehiclesApiResponse> {
    const response = await apiClient.get<MyInstructorVehiclesApiResponse>(
      '/instrutores/me/veiculos'
    );

    return response.data;
  },

  async createMyVehicle(payload: InstructorVehicleCreateApiRequest) {
    const response = await apiClient.post('/instrutores/me/veiculos', payload);
    return response.data;
  },

  async updateMyVehicle(vehicleId: string, payload: InstructorVehicleUpdateApiRequest) {
    const response = await apiClient.put(
      `/instrutores/me/veiculos/${vehicleId}`,
      payload
    );

    return response.data;
  },

  async deleteMyVehicle(vehicleId: string): Promise<void> {
    await apiClient.delete(`/instrutores/me/veiculos/${vehicleId}`);
  },
};
