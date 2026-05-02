export const bookingQueryKeys = {
  all: ['bookings'] as const,
  checkoutStatus: (bookingId: string) =>
    [...bookingQueryKeys.all, 'checkout-status', bookingId] as const,
};
