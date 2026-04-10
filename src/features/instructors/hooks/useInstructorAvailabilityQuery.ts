import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorAvailabilityQuery = (enabled = true) =>
  useAppQuery(instructorQueryOptions.availability(enabled));
