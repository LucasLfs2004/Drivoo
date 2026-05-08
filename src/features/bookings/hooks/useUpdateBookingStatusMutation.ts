import { useAppMutation } from '../../../shared/hooks';
import { bookingMutationOptions } from './mutationOptions';

export const useUpdateBookingStatusMutation = (bookingId: string) =>
  useAppMutation(bookingMutationOptions.updateStatus(bookingId));
