import type { InstructorFinancialSummaryQueryParams } from '../types/api';
import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorFinancialSummaryQuery = (
  params: InstructorFinancialSummaryQueryParams = {},
  enabled = true,
) => useAppQuery(instructorQueryOptions.financialSummary(params, enabled));
