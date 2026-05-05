import { useAppQuery } from '../../../shared/hooks';
import { bookingQueryOptions } from './queryOptions';

export const useBookingDetailsQuery = (bookingId: string) =>
  useAppQuery(bookingQueryOptions.details(bookingId));
