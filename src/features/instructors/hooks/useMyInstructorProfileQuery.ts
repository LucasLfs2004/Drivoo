import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useMyInstructorProfileQuery = (enabled = true) =>
  useAppQuery(instructorQueryOptions.myProfile(enabled));
