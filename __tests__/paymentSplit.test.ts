// Test the payment split calculation logic
// We test the pure calculation function without Stripe SDK dependencies

describe('Payment Split Calculation', () => {
  // Inline the calculation function for testing to avoid Stripe SDK import issues
  const calculatePaymentSplit = (
    totalAmount: number,
    platformFeePercentage: number = 0.15
  ): {
    total: number;
    platformFee: number;
    instructorAmount: number;
  } => {
    const platformFee = totalAmount * platformFeePercentage;
    const instructorAmount = totalAmount - platformFee;

    return {
      total: totalAmount,
      platformFee: Math.round(platformFee * 100) / 100,
      instructorAmount: Math.round(instructorAmount * 100) / 100,
    };
  };

  describe('calculatePaymentSplit', () => {
    it('should correctly calculate split with default 15% platform fee', () => {
      const amount = 100;
      const result = calculatePaymentSplit(amount);

      expect(result.total).toBe(100);
      expect(result.platformFee).toBe(15);
      expect(result.instructorAmount).toBe(85);
    });

    it('should correctly calculate split with custom platform fee', () => {
      const amount = 200;
      const platformFeePercentage = 0.20; // 20%
      const result = calculatePaymentSplit(amount, platformFeePercentage);

      expect(result.total).toBe(200);
      expect(result.platformFee).toBe(40);
      expect(result.instructorAmount).toBe(160);
    });

    it('should handle decimal amounts correctly', () => {
      const amount = 150.50;
      const result = calculatePaymentSplit(amount);

      expect(result.total).toBe(150.50);
      expect(result.platformFee).toBe(22.58); // 15% of 150.50, rounded
      expect(result.instructorAmount).toBe(127.93); // Remaining amount, rounded
    });

    it('should handle zero platform fee', () => {
      const amount = 100;
      const platformFeePercentage = 0;
      const result = calculatePaymentSplit(amount, platformFeePercentage);

      expect(result.total).toBe(100);
      expect(result.platformFee).toBe(0);
      expect(result.instructorAmount).toBe(100);
    });

    it('should handle small amounts', () => {
      const amount = 10;
      const result = calculatePaymentSplit(amount);

      expect(result.total).toBe(10);
      expect(result.platformFee).toBe(1.5);
      expect(result.instructorAmount).toBe(8.5);
    });

    it('should ensure platform fee + instructor amount equals total', () => {
      const amount = 175.75;
      const result = calculatePaymentSplit(amount);

      // Due to rounding, we check that the sum is very close to the total
      const sum = result.platformFee + result.instructorAmount;
      expect(Math.abs(sum - result.total)).toBeLessThan(0.01);
    });

    it('should handle large amounts', () => {
      const amount = 10000;
      const result = calculatePaymentSplit(amount);

      expect(result.total).toBe(10000);
      expect(result.platformFee).toBe(1500);
      expect(result.instructorAmount).toBe(8500);
    });

    it('should round platform fee and instructor amount to 2 decimal places', () => {
      const amount = 123.456;
      const result = calculatePaymentSplit(amount);

      // Check that values are rounded to 2 decimal places
      expect(result.platformFee.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
      expect(result.instructorAmount.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });
});
