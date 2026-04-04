import { useQuery } from '@tanstack/react-query';

import { instructorScheduleApi } from '../api/instructorScheduleApi';
import { mapInstructorSchedule } from '../mappers/mapInstructorSchedule';
import { instructorQueryKeys } from './queryKeys';

export const useInstructorScheduleQuery = (enabled = true) =>
  useQuery({
    queryKey: instructorQueryKeys.schedule(),
    queryFn: async () => {
      const response = await instructorScheduleApi.listMyAvailability();
      return mapInstructorSchedule(response);
    },
    enabled,
  });
