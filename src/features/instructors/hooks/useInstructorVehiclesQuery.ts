import { useAppQuery } from '../../../shared/hooks';
import { instructorQueryOptions } from './queryOptions';

export const useInstructorVehiclesQuery = (enabled = true) =>
  useAppQuery(instructorQueryOptions.vehicles(enabled));
