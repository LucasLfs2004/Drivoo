import { useMemo } from 'react';
import { calculatePaymentSplit } from '../../../services/stripeService';
import { PaymentSplitInfo } from '../types/domain';

interface UsePaymentSplitOptions {
  amount: number;
  platformFeePercentage?: number;
  currency?: string;
}

interface UsePaymentSplitResult {
  splitInfo: PaymentSplitInfo;
  isValid: boolean;
}

export const usePaymentSplit = ({
  amount,
  platformFeePercentage = 0.15,
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

  const isValid = useMemo(
    () =>
      amount > 0 &&
      platformFeePercentage >= 0 &&
      platformFeePercentage < 1 &&
      splitInfo.instructorAmount > 0,
    [amount, platformFeePercentage, splitInfo.instructorAmount]
  );

  return {
    splitInfo,
    isValid,
  };
};
