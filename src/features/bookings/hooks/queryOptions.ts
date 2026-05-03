import { createAppQueryOptions } from '../../../shared/hooks';
import { bookingsApi } from '../api/bookingsApi';
import { bookingCheckoutApi } from '../api/bookingCheckoutApi';
import { mapBookingCheckoutStatus } from '../mappers/mapBookingCheckout';
import { mapScheduledBookings } from '../mappers/mapScheduledBookings';
import type { ListMyBookingsApiParams } from '../types/api';
import { bookingQueryKeys } from './queryKeys';

export const bookingQueryOptions = {
  mine: (params: ListMyBookingsApiParams = {}) =>
    createAppQueryOptions({
      queryKey: bookingQueryKeys.mine(params),
      queryFn: async () => {
        const response = await bookingsApi.listMine(params);
        return mapScheduledBookings(response);
      },
    }),

  checkoutStatus: (bookingId: string, enabled = true) =>
    createAppQueryOptions({
      queryKey: bookingQueryKeys.checkoutStatus(bookingId),
      queryFn: async () => {
        const response = await bookingCheckoutApi.getCheckoutStatus(bookingId);
        return mapBookingCheckoutStatus(response);
      },
      enabled: enabled && Boolean(bookingId),
      refetchInterval: query => {
        const status = query.state.data?.bookingStatus;
        return status === 'PENDENTE_PAGAMENTO' ? 5000 : false;
      },
    }),
};
