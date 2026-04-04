import { useMutation, useQueryClient } from '@tanstack/react-query';

import { instructorVehiclesApi } from '../api/instructorVehiclesApi';
import type {
  InstructorVehicleCreateApiRequest,
  InstructorVehicleUpdateApiRequest,
} from '../types/api';
import { instructorQueryKeys } from './queryKeys';

export const useCreateInstructorVehicleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InstructorVehicleCreateApiRequest) =>
      instructorVehiclesApi.createMyVehicle(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: instructorQueryKeys.vehicles() }),
        queryClient.invalidateQueries({ queryKey: instructorQueryKeys.me() }),
      ]);
    },
  });
};

export const useUpdateInstructorVehicleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vehicleId,
      payload,
    }: {
      vehicleId: string;
      payload: InstructorVehicleUpdateApiRequest;
    }) => instructorVehiclesApi.updateMyVehicle(vehicleId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: instructorQueryKeys.vehicles() }),
        queryClient.invalidateQueries({ queryKey: instructorQueryKeys.me() }),
      ]);
    },
  });
};

export const useDeleteInstructorVehicleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => instructorVehiclesApi.deleteMyVehicle(vehicleId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: instructorQueryKeys.vehicles() }),
        queryClient.invalidateQueries({ queryKey: instructorQueryKeys.me() }),
      ]);
    },
  });
};
