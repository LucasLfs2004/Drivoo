import { useQuery } from '@tanstack/react-query';

import { instructorEarningsApi } from '../api/instructorEarningsApi';
import { mapInstructorEarningsOverview } from '../mappers/mapInstructorEarnings';
import { instructorQueryKeys } from './queryKeys';

export const useInstructorEarningsOverviewQuery = (enabled = true) =>
  useQuery({
    queryKey: instructorQueryKeys.earningsOverview(),
    queryFn: async () => {
      const [historyResult, recentPaymentsResult, trendResult] =
        await Promise.allSettled([
          instructorEarningsApi.getMyEarningsHistory(),
          instructorEarningsApi.getMyRecentPayments(),
          instructorEarningsApi.getMyEarningsTrend(),
        ]);

      if (historyResult.status === 'rejected') {
        throw historyResult.reason;
      }

      if (recentPaymentsResult.status === 'rejected') {
        throw recentPaymentsResult.reason;
      }

      return mapInstructorEarningsOverview({
        historyResponse: historyResult.value,
        recentPaymentsResponse: recentPaymentsResult.value,
        trendResponse: trendResult.status === 'fulfilled' ? trendResult.value : undefined,
      });
    },
    enabled,
  });
