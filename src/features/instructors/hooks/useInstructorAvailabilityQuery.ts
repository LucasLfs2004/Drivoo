import { useQuery } from '@tanstack/react-query';

import { instructorAvailabilityApi } from '../api/instructorAvailabilityApi';
import { mapInstructorAvailability } from '../mappers/mapInstructorAvailability';
import { instructorQueryKeys } from './queryKeys';

export const useInstructorAvailabilityQuery = (enabled = true) =>
  useQuery({
    queryKey: instructorQueryKeys.availability(),
    queryFn: async () => {
      const response = await instructorAvailabilityApi.getMyAvailability();
      return mapInstructorAvailability(response);
    },
    enabled,
  });
