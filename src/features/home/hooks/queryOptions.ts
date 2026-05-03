import { createAppQueryOptions } from '../../../shared/hooks';
import { studentDashboardApi } from '../api/studentDashboardApi';
import { mapStudentDashboard } from '../mappers/mapStudentDashboard';
import { studentDashboardQueryKeys } from './queryKeys';

export const studentDashboardQueryOptions = {
  overview: () =>
    createAppQueryOptions({
      queryKey: studentDashboardQueryKeys.overview(),
      queryFn: async () => {
        const response = await studentDashboardApi.getDashboard();
        return mapStudentDashboard(response);
      },
    }),
};
