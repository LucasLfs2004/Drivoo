/**
 * Utilitários para formatação de moeda
 */

/**
 * Normaliza código de moeda para formato ISO válido
 * Converte símbolos como 'R$' para códigos ISO como 'BRL'
 */
export const normalizeCurrencyCode = (currency: string): string => {
  const currencyMap: Record<string, string> = {
    'R$': 'BRL',
    'US$': 'USD',
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
  };

  return currencyMap[currency] || currency || 'BRL';
};

/**
 * Formata valor monetário para exibição
 */
export const formatCurrency = (
  value: number,
  currency: string = 'BRL',
  locale: string = 'pt-BR'
): string => {
  const validCurrency = normalizeCurrencyCode(currency);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: validCurrency,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback para formato simples
    return `R$ ${value.toFixed(2)}`;
  }
};

/**
 * Formata valor monetário sem símbolo
 */
export const formatCurrencyValue = (
  value: number,
  locale: string = 'pt-BR'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Converte valor de centavos para reais
 */
export const centsToReais = (cents: number): number => {
  return cents / 100;
};

/**
 * Converte valor de reais para centavos
 */
export const reaisToCents = (reais: number): number => {
  return Math.round(reais * 100);
};
