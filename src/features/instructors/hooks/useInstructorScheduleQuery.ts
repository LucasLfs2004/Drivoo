import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorScheduleQuery = (enabled = true) =>
  useAppQuery(instructorQueryOptions.schedule(enabled));
