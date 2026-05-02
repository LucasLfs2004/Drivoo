import { createAppMutationOptions } from '../../../shared/hooks';
import { bookingCheckoutApi } from '../api/bookingCheckoutApi';
import { mapBookingCheckoutSession } from '../mappers/mapBookingCheckout';
import type { CreateBookingCheckoutSessionApiRequest } from '../types/api';
import { bookingQueryKeys } from './queryKeys';

export const bookingMutationOptions = {
  createCheckoutSession: () =>
    createAppMutationOptions({
      mutationFn: async (payload: CreateBookingCheckoutSessionApiRequest) => {
        const response = await bookingCheckoutApi.createCheckoutSession(payload);
        return mapBookingCheckoutSession(response);
      },
      invalidateQueryKeys: [bookingQueryKeys.all],
    }),
};
