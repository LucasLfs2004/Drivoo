import { useAppQuery } from '../../../shared/hooks';
import type { ListMyBookingsApiParams } from '../types/api';
import { bookingQueryOptions } from './queryOptions';

export const useMyBookingsQuery = (params: ListMyBookingsApiParams = {}) =>
  useAppQuery(bookingQueryOptions.mine(params));
