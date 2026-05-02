import { instructorAvailabilityApi } from '../api/instructorAvailabilityApi';
import { instructorDetailsApi } from '../api/instructorDetailsApi';
import { instructorEarningsApi } from '../api/instructorEarningsApi';
import { instructorFinancialApi } from '../api/instructorFinancialApi';
import { instructorProfileApi } from '../api/instructorProfileApi';
import { instructorScheduleApi } from '../api/instructorScheduleApi';
import { instructorSearchApi } from '../api/instructorSearchApi';
import { instructorVehiclesApi } from '../api/instructorVehiclesApi';
import {
  mapInstructorAvailability,
  mapInstructorBookingsPreview,
  mapInstructorAvailabilityToBulkPayload,
} from '../mappers/mapInstructorAvailability';
import { mapInstructorDetails } from '../mappers/mapInstructorDetails';
import { mapInstructorEarningsOverview } from '../mappers/mapInstructorEarnings';
import { mapInstructorFinancialProfile } from '../mappers/mapInstructorFinancial';
import { mapInstructorSchedule } from '../mappers/mapInstructorSchedule';
import { mapInstructorSearchResult } from '../mappers/mapInstructorSearchResult';
import { mapInstructorVehicles } from '../mappers/mapInstructorVehicle';
import type { InstructorAvailabilityDraft } from '../types/availability';
import type { FiltrosBusca } from '../types/filters';
import { createAppQueryOptions } from '../../../shared/hooks';
import { instructorQueryKeys } from './queryKeys';

export const EMPTY_BULK_PAYLOAD_ERROR =
  'A remoção de exceções ainda não pode ser persistida porque o contrato bulk atual não expressa exclusão explícita.';

export interface InstructorSearchQueryParams {
  filtros: FiltrosBusca;
  latitude: number;
  longitude: number;
  pagina?: number;
  limite?: number;
  enabled?: boolean;
}

export const instructorQueryOptions = {
  availability: (enabled = true) =>
    createAppQueryOptions({
      queryKey: instructorQueryKeys.availability(),
      queryFn: async () => {
        const response = await instructorAvailabilityApi.getMyAvailability();
        return mapInstructorAvailability(response);
      },
      enabled,
    }),

  availabilityCalendar: (enabled = true) =>
    createAppQueryOptions({
      queryKey: instructorQueryKeys.availabilityCalendar(),
      queryFn: async () => instructorAvailabilityApi.getMyAvailabilityCalendar(),
      enabled,
    }),

  availabilityCompleteCalendar: (enabled = true) =>
    createAppQueryOptions({
      queryKey: instructorQueryKeys.availabilityCompleteCalendar(),
      queryFn: async () => instructorAvailabilityApi.getMyCompleteCalendar(),
      enabled,
    }),

  bookingsPreview: (enabled = true) =>
    createAppQueryOptions({
      queryKey: instructorQueryKeys.availabilityBookingsPreview(),
      queryFn: async () => {
        const response = await instructorAvailabilityApi.getMyBookingsPreview();
        return mapInstructorBookingsPreview(response);
      },
      enabled,
    }),

  detail: (instructorId: string, enabled = true) =>
    createAppQueryOptions({
      queryKey: instructorQueryKeys.detail(instructorId),
      queryFn: async () => {
        const response = await instructorDetailsApi.getDetails(instructorId);
        return mapInstructorDetails(response);
      },
      enabled: enabled && Boolean(instructorId),
    }),

  publicAvailabilityCalendar: (instructorId: string, enabled = true) =>
    createAppQueryOptions({
      queryKey: instructorQueryKeys.publicAvailabilityCalendar(instructorId),
      queryFn: async () =>
        instructorAvailabilityApi.getInstructorAvailabilityCalendar(instructorId),
      enabled: enabled && Boolean(instructorId),
    }),

  earningsOverview: (enabled = true) =>
    createAppQueryOptions({
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
    }),

  financial: (enabled = true) =>
    createAppQueryOptions({
      queryKey: instructorQueryKeys.financial(),
      queryFn: async () => {
        const response = await instructorFinancialApi.getMyFinancialProfile();
        return mapInstructorFinancialProfile(response);
      },
      enabled,
    }),

  myProfile: (enabled = true) =>
    createAppQueryOptions({
      queryKey: instructorQueryKeys.me(),
      queryFn: async () => {
        const response = await instructorProfileApi.getMyProfile();
        return mapInstructorDetails(response);
      },
      enabled,
    }),

  schedule: (enabled = true) =>
    createAppQueryOptions({
      queryKey: instructorQueryKeys.schedule(),
      queryFn: async () => {
        const response = await instructorScheduleApi.listMyAvailability();
        return mapInstructorSchedule(response);
      },
      enabled,
    }),

  search: ({
    filtros,
    latitude,
    longitude,
    pagina = 1,
    limite = 20,
    enabled = true,
  }: InstructorSearchQueryParams) =>
    createAppQueryOptions({
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
    }),

  vehicles: (enabled = true) =>
    createAppQueryOptions({
      queryKey: instructorQueryKeys.vehicles(),
      queryFn: async () => {
        const response = await instructorVehiclesApi.listMyVehicles();
        return mapInstructorVehicles(response);
      },
      enabled,
    }),
};

export const buildAvailabilityBulkPayload = (
  draft: InstructorAvailabilityDraft,
  initialDraft: InstructorAvailabilityDraft
) => {
  const payload = mapInstructorAvailabilityToBulkPayload(draft, initialDraft);

  if (!payload.itens.length) {
    throw new Error(EMPTY_BULK_PAYLOAD_ERROR);
  }

  return payload;
};
