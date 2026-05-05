export const bookingQueryKeys = {
  all: ['bookings'] as const,
  mine: (params: unknown) => [...bookingQueryKeys.all, 'mine', params] as const,
  details: (bookingId: string) => [...bookingQueryKeys.all, 'details', bookingId] as const,
  checkoutStatus: (bookingId: string) =>
    [...bookingQueryKeys.all, 'checkout-status', bookingId] as const,
};
