export const bookingQueryKeys = {
  all: ['bookings'] as const,
  mine: (params: unknown) => [...bookingQueryKeys.all, 'mine', params] as const,
  checkoutStatus: (bookingId: string) =>
    [...bookingQueryKeys.all, 'checkout-status', bookingId] as const,
};
