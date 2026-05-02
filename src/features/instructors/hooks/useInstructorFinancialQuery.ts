import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorFinancialQuery = (enabled = true) =>
  useAppQuery(instructorQueryOptions.financial(enabled));
