import type {
  FiltrosBusca,
  ResultadoBusca,
} from '../features/instructors';

import { instructorSearchApi } from '../features/instructors/api/instructorSearchApi';
import { mapInstructorSearchResult } from '../features/instructors/mappers/mapInstructorSearchResult';

interface SearchInstructorsParams {
  filtros: FiltrosBusca;
  latitude: number;
  longitude: number;
  pagina?: number;
  limite?: number;
}

export const instructorSearchService = {
  async search({
    filtros,
    latitude,
    longitude,
    pagina = 1,
    limite = 20,
  }: SearchInstructorsParams): Promise<ResultadoBusca> {
    const response = await instructorSearchApi.search({
      filtros,
      latitude,
      longitude,
      pagina,
      limite,
    });

    return mapInstructorSearchResult(response, filtros, pagina, limite);
  },
};
