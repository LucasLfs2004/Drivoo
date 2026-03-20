import { BookingData } from '../types/domain';

const DEFAULT_PLATFORM_FEE_RATE = 0.15;

export interface BookingPaymentInfo {
  subtotal: number;
  platformFee: number;
  total: number;
  currency: string;
}

export const calculateBookingPaymentInfo = (
  bookingData: Pick<BookingData, 'price' | 'currency'>,
  platformFeeRate: number = DEFAULT_PLATFORM_FEE_RATE
): BookingPaymentInfo => {
  const subtotal = bookingData.price;
  const platformFee = subtotal * platformFeeRate;
  const total = subtotal + platformFee;

  return {
    subtotal,
    platformFee,
    total,
    currency: bookingData.currency || 'BRL',
  };
};

export const BOOKING_PLATFORM_FEE_RATE = DEFAULT_PLATFORM_FEE_RATE;
