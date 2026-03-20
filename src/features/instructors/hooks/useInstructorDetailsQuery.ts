import { useQuery } from '@tanstack/react-query';

import { instructorDetailsApi } from '../api/instructorDetailsApi';
import { mapInstructorDetails } from '../mappers/mapInstructorDetails';
import { instructorQueryKeys } from './queryKeys';

export const useInstructorDetailsQuery = (
  instructorId: string,
  enabled = true
) =>
  useQuery({
    queryKey: instructorQueryKeys.detail(instructorId),
    queryFn: async () => {
      const response = await instructorDetailsApi.getDetails(instructorId);
      return mapInstructorDetails(response);
    },
    enabled: enabled && Boolean(instructorId),
  });
