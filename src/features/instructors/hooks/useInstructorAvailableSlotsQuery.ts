import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorAvailableSlotsQuery = (
  instructorId: string,
  date: string | null,
  durationMinutes = 60,
  enabled = true
) =>
  useAppQuery(
    instructorQueryOptions.availableSlots(
      instructorId,
      date,
      durationMinutes,
      enabled
    )
  );
