import { useMutation, useQueryClient } from '@tanstack/react-query';

import { instructorScheduleApi } from '../api/instructorScheduleApi';
import type {
  InstructorAvailabilityCreateApiRequest,
  InstructorAvailabilityUpdateApiRequest,
} from '../types/api';
import { instructorQueryKeys } from './queryKeys';

export const useCreateInstructorAvailabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InstructorAvailabilityCreateApiRequest) =>
      instructorScheduleApi.createMyAvailability(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.schedule(),
      });
    },
  });
};

export const useUpdateInstructorAvailabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      availabilityId,
      payload,
    }: {
      availabilityId: string;
      payload: InstructorAvailabilityUpdateApiRequest;
    }) => instructorScheduleApi.updateMyAvailability(availabilityId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.schedule(),
      });
    },
  });
};

export const useDeleteInstructorAvailabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availabilityId: string) =>
      instructorScheduleApi.deleteMyAvailability(availabilityId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.schedule(),
      });
    },
  });
};
