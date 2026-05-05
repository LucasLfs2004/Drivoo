import { useAppMutation } from '../../../shared/hooks';
import { bookingMutationOptions } from './mutationOptions';

export const useCancelBookingMutation = (bookingId: string) =>
  useAppMutation(bookingMutationOptions.cancel(bookingId));
