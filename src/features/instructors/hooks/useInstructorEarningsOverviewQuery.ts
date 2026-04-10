import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorEarningsOverviewQuery = (enabled = true) =>
  useAppQuery(instructorQueryOptions.earningsOverview(enabled));
