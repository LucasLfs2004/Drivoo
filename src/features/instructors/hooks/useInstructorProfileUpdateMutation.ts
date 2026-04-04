import { useMutation, useQueryClient } from '@tanstack/react-query';

import { instructorProfileApi } from '../api/instructorProfileApi';
import type { InstructorProfileUpdateApiRequest } from '../types/api';
import { instructorQueryKeys } from './queryKeys';

export const useInstructorProfileUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InstructorProfileUpdateApiRequest) =>
      instructorProfileApi.updateMyProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.me(),
      });
    },
  });
};
