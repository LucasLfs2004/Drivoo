import { useMutation, useQueryClient } from '@tanstack/react-query';

import { instructorAvailabilityApi } from '../api/instructorAvailabilityApi';
import { mapInstructorAvailabilityToBulkPayload } from '../mappers/mapInstructorAvailability';
import type { InstructorAvailabilityDraft } from '../types/availability';
import { instructorQueryKeys } from './queryKeys';

const EMPTY_BULK_PAYLOAD_ERROR =
  'A remoção de exceções ainda não pode ser persistida porque o contrato bulk atual não expressa exclusão explícita.';

export const useSaveInstructorAvailabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      draft,
      initialDraft,
    }: {
      draft: InstructorAvailabilityDraft;
      initialDraft: InstructorAvailabilityDraft;
    }) => {
      const payload = mapInstructorAvailabilityToBulkPayload(draft, initialDraft);

      if (!payload.itens.length) {
        throw new Error(EMPTY_BULK_PAYLOAD_ERROR);
      }

      return instructorAvailabilityApi.saveMyAvailabilityBulk(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.availability(),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.availabilityBookingsPreview(),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.availabilityCalendar(),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.availabilityCompleteCalendar(),
      });
    },
  });
};
