import { useQuery } from '@tanstack/react-query';

import { instructorAvailabilityApi } from '../api/instructorAvailabilityApi';
import { mapInstructorBookingsPreview } from '../mappers/mapInstructorAvailability';
import { instructorQueryKeys } from './queryKeys';

export const useInstructorBookingsPreviewQuery = (enabled = true) =>
  useQuery({
    queryKey: instructorQueryKeys.availabilityBookingsPreview(),
    queryFn: async () => {
      const response = await instructorAvailabilityApi.getMyBookingsPreview();
      return mapInstructorBookingsPreview(response);
    },
    enabled,
  });
