import { useAppQuery } from '../../../shared/hooks';
import {
  instructorQueryOptions,
  type InstructorSearchQueryParams,
} from './queryOptions';

export const useInstructorSearchQuery = ({
  filtros,
  latitude,
  longitude,
  pagina = 1,
  limite = 20,
  enabled = true,
}: InstructorSearchQueryParams) =>
  useAppQuery(
    instructorQueryOptions.search({
      filtros,
      latitude,
      longitude,
      pagina,
      limite,
      enabled,
    })
  );
