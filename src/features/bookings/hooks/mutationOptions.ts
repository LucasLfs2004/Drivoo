import { createAppMutationOptions } from '../../../shared/hooks';
import { bookingCheckoutApi } from '../api/bookingCheckoutApi';
import { bookingsApi } from '../api/bookingsApi';
import { mapBookingCheckoutSession } from '../mappers/mapBookingCheckout';
import { mapBookingCancellationResult } from '../mappers/mapScheduledBookings';
import type { CancelBookingApiRequest, CreateBookingCheckoutSessionApiRequest } from '../types/api';
import { bookingQueryKeys } from './queryKeys';

export const bookingMutationOptions = {
  createCheckoutSession: () =>
    createAppMutationOptions({
      mutationFn: async (payload: CreateBookingCheckoutSessionApiRequest) => {
        const response = await bookingCheckoutApi.createCheckoutSession(payload);
        return mapBookingCheckoutSession(response);
      },
      retry: false,
      invalidateQueryKeys: [bookingQueryKeys.all],
    }),

  cancel: (bookingId: string) =>
    createAppMutationOptions({
      mutationFn: async (payload: CancelBookingApiRequest = {}) => {
        const response = await bookingsApi.cancel(bookingId, payload);
        return mapBookingCancellationResult(response);
      },
      retry: false,
      invalidateQueryKeys: [bookingQueryKeys.all],
    }),
};
