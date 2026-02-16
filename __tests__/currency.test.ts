import {
  normalizeCurrencyCode,
  formatCurrency,
  centsToReais,
  reaisToCents,
} from '../src/utils/currency';

describe('Currency Utilities', () => {
  describe('normalizeCurrencyCode', () => {
    it('should convert R$ to BRL', () => {
      expect(normalizeCurrencyCode('R$')).toBe('BRL');
    });

    it('should convert US$ to USD', () => {
      expect(normalizeCurrencyCode('US$')).toBe('USD');
    });

    it('should convert $ to USD', () => {
      expect(normalizeCurrencyCode('$')).toBe('USD');
    });

    it('should convert € to EUR', () => {
      expect(normalizeCurrencyCode('€')).toBe('EUR');
    });

    it('should convert £ to GBP', () => {
      expect(normalizeCurrencyCode('£')).toBe('GBP');
    });

    it('should keep valid ISO codes unchanged', () => {
      expect(normalizeCurrencyCode('BRL')).toBe('BRL');
      expect(normalizeCurrencyCode('USD')).toBe('USD');
      expect(normalizeCurrencyCode('EUR')).toBe('EUR');
    });

    it('should default to BRL for empty string', () => {
      expect(normalizeCurrencyCode('')).toBe('BRL');
    });
  });

  describe('formatCurrency', () => {
    it('should format BRL currency correctly', () => {
      const result = formatCurrency(100, 'BRL');
      expect(result).toContain('100');
    });

    it('should handle R$ symbol and convert to BRL', () => {
      const result = formatCurrency(50.5, 'R$');
      expect(result).toContain('50');
    });

    it('should handle zero values', () => {
      const result = formatCurrency(0, 'BRL');
      expect(result).toContain('0');
    });

    it('should handle negative values', () => {
      const result = formatCurrency(-25.75, 'BRL');
      expect(result).toContain('25');
    });

    it('should default to BRL when no currency provided', () => {
      const result = formatCurrency(100);
      expect(result).toContain('100');
    });
  });

  describe('centsToReais', () => {
    it('should convert cents to reais correctly', () => {
      expect(centsToReais(10000)).toBe(100);
      expect(centsToReais(5050)).toBe(50.5);
      expect(centsToReais(1)).toBe(0.01);
    });

    it('should handle zero', () => {
      expect(centsToReais(0)).toBe(0);
    });
  });

  describe('reaisToCents', () => {
    it('should convert reais to cents correctly', () => {
      expect(reaisToCents(100)).toBe(10000);
      expect(reaisToCents(50.5)).toBe(5050);
      expect(reaisToCents(0.01)).toBe(1);
    });

    it('should handle zero', () => {
      expect(reaisToCents(0)).toBe(0);
    });

    it('should round to nearest cent', () => {
      expect(reaisToCents(10.555)).toBe(1056); // Rounds to 10.56
      expect(reaisToCents(10.554)).toBe(1055); // Rounds to 10.55
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain value through cents->reais->cents conversion', () => {
      const originalCents = 12345;
      const reais = centsToReais(originalCents);
      const backToCents = reaisToCents(reais);
      expect(backToCents).toBe(originalCents);
    });

    it('should maintain value through reais->cents->reais conversion', () => {
      const originalReais = 123.45;
      const cents = reaisToCents(originalReais);
      const backToReais = centsToReais(cents);
      expect(backToReais).toBe(originalReais);
    });
  });
});
