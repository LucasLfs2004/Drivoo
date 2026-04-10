import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorDetailsQuery = (
  instructorId: string,
  enabled = true
) =>
  useAppQuery(instructorQueryOptions.detail(instructorId, enabled));
