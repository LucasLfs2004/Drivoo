import { useQuery } from '@tanstack/react-query';

import { instructorSearchApi } from '../api/instructorSearchApi';
import { mapInstructorSearchResult } from '../mappers/mapInstructorSearchResult';
import { instructorQueryKeys } from './queryKeys';
import type { FiltrosBusca } from '../types/filters';

interface UseInstructorSearchQueryParams {
  filtros: FiltrosBusca;
  latitude: number;
  longitude: number;
  pagina?: number;
  limite?: number;
  enabled?: boolean;
}

export const useInstructorSearchQuery = ({
  filtros,
  latitude,
  longitude,
  pagina = 1,
  limite = 20,
  enabled = true,
}: UseInstructorSearchQueryParams) =>
  useQuery({
    queryKey: instructorQueryKeys.search({ filtros, latitude, longitude, pagina, limite }),
    queryFn: async () => {
      const response = await instructorSearchApi.search({
        filtros,
        latitude,
        longitude,
        pagina,
        limite,
      });

      return mapInstructorSearchResult(response, filtros, pagina, limite);
    },
    enabled,
  });
