import { useQuery } from '@tanstack/react-query';

import { instructorProfileApi } from '../api/instructorProfileApi';
import { mapInstructorDetails } from '../mappers/mapInstructorDetails';
import { instructorQueryKeys } from './queryKeys';

export const useMyInstructorProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: instructorQueryKeys.me(),
    queryFn: async () => {
      const response = await instructorProfileApi.getMyProfile();
      return mapInstructorDetails(response);
    },
    enabled,
  });
