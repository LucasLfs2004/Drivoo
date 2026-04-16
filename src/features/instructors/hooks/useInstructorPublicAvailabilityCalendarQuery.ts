import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorPublicAvailabilityCalendarQuery = (
  instructorId: string,
  enabled = true
) =>
  useAppQuery(
    instructorQueryOptions.publicAvailabilityCalendar(instructorId, enabled)
  );
