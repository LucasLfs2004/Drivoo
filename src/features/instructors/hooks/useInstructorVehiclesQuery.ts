import { useQuery } from '@tanstack/react-query';

import { instructorVehiclesApi } from '../api/instructorVehiclesApi';
import { mapInstructorVehicles } from '../mappers/mapInstructorVehicle';
import { instructorQueryKeys } from './queryKeys';

export const useInstructorVehiclesQuery = (enabled = true) =>
  useQuery({
    queryKey: instructorQueryKeys.vehicles(),
    queryFn: async () => {
      const response = await instructorVehiclesApi.listMyVehicles();
      return mapInstructorVehicles(response);
    },
    enabled,
  });
