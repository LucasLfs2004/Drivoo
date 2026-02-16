import { useMemo } from 'react';
import { PaymentSplitInfo } from '../types/booking';
import { calculatePaymentSplit } from '../services/stripeService';

interface UsePaymentSplitOptions {
  amount: number;
  platformFeePercentage?: number;
  currency?: string;
}

interface UsePaymentSplitResult {
  splitInfo: PaymentSplitInfo;
  isValid: boolean;
}

/**
 * Hook to calculate payment split between platform and instructor
 * @param options - Payment split options
 * @returns Split payment information and validation status
 */
export const usePaymentSplit = ({
  amount,
  platformFeePercentage = 0.15, // Default 15% platform fee
  currency = 'BRL',
}: UsePaymentSplitOptions): UsePaymentSplitResult => {
  const splitInfo = useMemo<PaymentSplitInfo>(() => {
    const split = calculatePaymentSplit(amount, platformFeePercentage);

    return {
      total: split.total,
      platformFee: split.platformFee,
      platformFeePercentage,
      instructorAmount: split.instructorAmount,
      currency,
    };
  }, [amount, platformFeePercentage, currency]);

  const isValid = useMemo(() => {
    return (
      amount > 0 &&
      platformFeePercentage >= 0 &&
      platformFeePercentage < 1 &&
      splitInfo.instructorAmount > 0
    );
  }, [amount, platformFeePercentage, splitInfo.instructorAmount]);

  return {
    splitInfo,
    isValid,
  };
};
