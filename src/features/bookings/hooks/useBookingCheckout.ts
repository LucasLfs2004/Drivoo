import { useAppMutation, useAppQuery } from '../../../shared/hooks';
import { bookingMutationOptions } from './mutationOptions';
import { bookingQueryOptions } from './queryOptions';

export const useCreateBookingCheckoutSessionMutation = () =>
  useAppMutation(bookingMutationOptions.createCheckoutSession());

export const useBookingCheckoutStatusQuery = (
  bookingId: string,
  enabled = true
) => useAppQuery(bookingQueryOptions.checkoutStatus(bookingId, enabled));
