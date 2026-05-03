import { useAppQuery } from '../../../shared/hooks';
import { studentDashboardQueryOptions } from './queryOptions';

export const useStudentDashboardQuery = () =>
  useAppQuery(studentDashboardQueryOptions.overview());
