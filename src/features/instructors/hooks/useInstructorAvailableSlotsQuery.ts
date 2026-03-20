import { useQuery } from '@tanstack/react-query';

import { instructorAvailabilityApi } from '../api/instructorAvailabilityApi';
import { mapInstructorAvailableSlot } from '../mappers/mapInstructorAvailableSlots';
import { instructorQueryKeys } from './queryKeys';

export const useInstructorAvailableSlotsQuery = (
  instructorId: string,
  date: string | null,
  durationMinutes = 60,
  enabled = true
) =>
  useQuery({
    queryKey: instructorQueryKeys.availableSlots(
      instructorId,
      date ?? 'no-date',
      durationMinutes
    ),
    queryFn: async () => {
      const response = await instructorAvailabilityApi.getAvailableSlots(
        instructorId,
        date ?? '',
        durationMinutes
      );

      return response.horarios.map(mapInstructorAvailableSlot);
    },
    enabled: enabled && Boolean(instructorId) && Boolean(date),
  });
