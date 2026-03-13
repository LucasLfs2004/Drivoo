import { useQuery } from '@tanstack/react-query';
import type { FiltrosBusca } from '../../types/search';
import { instructorSearchService } from '../instructorSearchService';

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
    queryKey: ['instructor-search', { filtros, latitude, longitude, pagina, limite }],
    queryFn: () =>
      instructorSearchService.search({
        filtros,
        latitude,
        longitude,
        pagina,
        limite,
      }),
    enabled,
  });
