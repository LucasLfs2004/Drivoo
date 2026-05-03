import { BookingData } from '../types/domain';

const DEFAULT_PLATFORM_FEE_RATE = 0;

export interface BookingPaymentInfo {
  subtotal: number;
  platformFee: number;
  total: number;
  currency: string;
}

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

export const calculateBookingPaymentInfo = (
  bookingData: Pick<BookingData, 'price' | 'currency' | 'duration'>,
  platformFeeRate: number = DEFAULT_PLATFORM_FEE_RATE
): BookingPaymentInfo => {
  const durationInHours = bookingData.duration / 60;
  const subtotal = roundMoney(bookingData.price * durationInHours);
  const platformFee = roundMoney(subtotal * platformFeeRate);
  const total = roundMoney(subtotal + platformFee);

  return {
    subtotal,
    platformFee,
    total,
    currency: bookingData.currency || 'BRL',
  };
};

export const BOOKING_PLATFORM_FEE_RATE = DEFAULT_PLATFORM_FEE_RATE;
