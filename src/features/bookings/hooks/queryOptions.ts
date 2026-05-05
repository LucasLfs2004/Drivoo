import { createAppQueryOptions } from '../../../shared/hooks';
import { bookingsApi } from '../api/bookingsApi';
import { bookingCheckoutApi } from '../api/bookingCheckoutApi';
import { mapBookingCheckoutStatus } from '../mappers/mapBookingCheckout';
import { mapScheduledBooking, mapScheduledBookings } from '../mappers/mapScheduledBookings';
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

  details: (bookingId: string) =>
    createAppQueryOptions({
      queryKey: bookingQueryKeys.details(bookingId),
      queryFn: async () => {
        const response = await bookingsApi.getById(bookingId);
        const responseData = response.data;
        const item =
          responseData && typeof responseData === 'object' && !Array.isArray(responseData)
            ? responseData
            : response;
        const booking = mapScheduledBooking(item);

        if (!booking) {
          throw new Error('Agendamento inválido retornado pela API.');
        }

        return booking;
      },
      enabled: Boolean(bookingId),
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
