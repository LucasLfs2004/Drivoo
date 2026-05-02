import { instructorAvailabilityApi } from '../api/instructorAvailabilityApi';
import { instructorFinancialApi } from '../api/instructorFinancialApi';
import { instructorProfileApi } from '../api/instructorProfileApi';
import { instructorScheduleApi } from '../api/instructorScheduleApi';
import { instructorVehiclesApi } from '../api/instructorVehiclesApi';
import type {
  InstructorAvailabilityCreateApiRequest,
  InstructorAvailabilityUpdateApiRequest,
  InstructorFinancialUpdateApiRequest,
  InstructorProfileUpdateApiRequest,
  InstructorVehicleCreateApiRequest,
  InstructorVehicleUpdateApiRequest,
} from '../types/api';
import type { InstructorAvailabilityDraft } from '../types/availability';
import {
  mapInstructorFinancialProfile,
  mapInstructorStripeOnboardingLink,
} from '../mappers/mapInstructorFinancial';
import { createAppMutationOptions } from '../../../shared/hooks';
import { instructorQueryKeys } from './queryKeys';
import { buildAvailabilityBulkPayload } from './queryOptions';

export const instructorMutationOptions = {
  saveAvailability: () =>
    createAppMutationOptions({
      mutationFn: async ({
        draft,
        initialDraft,
      }: {
        draft: InstructorAvailabilityDraft;
        initialDraft: InstructorAvailabilityDraft;
      }) =>
        instructorAvailabilityApi.saveMyAvailabilityBulk(
          buildAvailabilityBulkPayload(draft, initialDraft)
        ),
      invalidateQueryKeys: [
          instructorQueryKeys.availability(),
          instructorQueryKeys.availabilityBookingsPreview(),
          instructorQueryKeys.availabilityCalendar(),
          instructorQueryKeys.availabilityCompleteCalendar(),
        ],
    }),

  updateProfile: () =>
    createAppMutationOptions({
      mutationFn: (payload: InstructorProfileUpdateApiRequest) =>
        instructorProfileApi.updateMyProfile(payload),
      invalidateQueryKeys: [instructorQueryKeys.me()],
    }),

  updateFinancial: () =>
    createAppMutationOptions({
      mutationFn: async (payload: InstructorFinancialUpdateApiRequest) => {
        const response =
          await instructorFinancialApi.updateMyFinancialProfile(payload);
        return mapInstructorFinancialProfile(response);
      },
      invalidateQueryKeys: [instructorQueryKeys.financial()],
    }),

  createStripeOnboardingLink: () =>
    createAppMutationOptions({
      mutationFn: async () => {
        const response =
          await instructorFinancialApi.createStripeOnboardingLink();
        return mapInstructorStripeOnboardingLink(response);
      },
      invalidateQueryKeys: [instructorQueryKeys.financial()],
    }),

  createSchedule: () =>
    createAppMutationOptions({
      mutationFn: (payload: InstructorAvailabilityCreateApiRequest) =>
        instructorScheduleApi.createMyAvailability(payload),
      invalidateQueryKeys: [instructorQueryKeys.schedule()],
    }),

  updateSchedule: () =>
    createAppMutationOptions({
      mutationFn: ({
        availabilityId,
        payload,
      }: {
        availabilityId: string;
        payload: InstructorAvailabilityUpdateApiRequest;
      }) => instructorScheduleApi.updateMyAvailability(availabilityId, payload),
      invalidateQueryKeys: [instructorQueryKeys.schedule()],
    }),

  deleteSchedule: () =>
    createAppMutationOptions({
      mutationFn: (availabilityId: string) =>
        instructorScheduleApi.deleteMyAvailability(availabilityId),
      invalidateQueryKeys: [instructorQueryKeys.schedule()],
    }),

  createVehicle: () =>
    createAppMutationOptions({
      mutationFn: (payload: InstructorVehicleCreateApiRequest) =>
        instructorVehiclesApi.createMyVehicle(payload),
      invalidateQueryKeys: [
        instructorQueryKeys.vehicles(),
        instructorQueryKeys.me(),
      ],
    }),

  updateVehicle: () =>
    createAppMutationOptions({
      mutationFn: ({
        vehicleId,
        payload,
      }: {
        vehicleId: string;
        payload: InstructorVehicleUpdateApiRequest;
      }) => instructorVehiclesApi.updateMyVehicle(vehicleId, payload),
      invalidateQueryKeys: [
        instructorQueryKeys.vehicles(),
        instructorQueryKeys.me(),
      ],
    }),

  deleteVehicle: () =>
    createAppMutationOptions({
      mutationFn: (vehicleId: string) => instructorVehiclesApi.deleteMyVehicle(vehicleId),
      invalidateQueryKeys: [
        instructorQueryKeys.vehicles(),
        instructorQueryKeys.me(),
      ],
    }),
};
