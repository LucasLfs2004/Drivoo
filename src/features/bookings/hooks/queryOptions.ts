import { createAppQueryOptions } from '../../../shared/hooks';
import { bookingCheckoutApi } from '../api/bookingCheckoutApi';
import { mapBookingCheckoutStatus } from '../mappers/mapBookingCheckout';
import { bookingQueryKeys } from './queryKeys';

export const bookingQueryOptions = {
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
