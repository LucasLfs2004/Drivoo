import dayjs from 'dayjs';

import type {
  InstructorEarningsOverview,
  InstructorEarningsTrendPoint,
  InstructorPaymentStatus,
  InstructorRecentPayment,
} from '../types/domain';
import type {
  InstructorEarningsHistoryApiResponse,
  InstructorEarningsHistoryItemApiResponse,
  InstructorRecentPaymentItemApiResponse,
  InstructorRecentPaymentsApiResponse,
} from '../types/api';

const getNumber = (...values: Array<number | null | undefined>): number => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
};

const getString = (...values: Array<string | null | undefined>): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

const normalizePaymentStatus = (value?: string | null): InstructorPaymentStatus => {
  const normalized = value?.trim().toUpperCase();

  switch (normalized) {
    case 'PAGO':
    case 'PAGAMENTO_REALIZADO':
    case 'CONCLUIDO':
    case 'COMPLETED':
      return 'paid';
    case 'PENDENTE':
    case 'PENDING':
      return 'pending';
    case 'CANCELADO':
    case 'FALHOU':
    case 'FAILED':
      return 'failed';
    default:
      return 'unknown';
  }
};

const parseDate = (...values: Array<string | null | undefined>): Date | undefined => {
  const rawValue = getString(...values);
  if (!rawValue) {
    return undefined;
  }

  const parsed = dayjs(rawValue);
  return parsed.isValid() ? parsed.toDate() : undefined;
};

const buildPaymentDescription = (
  item: InstructorEarningsHistoryItemApiResponse | InstructorRecentPaymentItemApiResponse
): string => {
  const explicitDescription = getString(item.descricao, item.description);
  if (explicitDescription) {
    return explicitDescription;
  }

  const studentName = getString(item.aluno_nome, item.student_name);
  if (studentName) {
    return studentName;
  }

  return 'Pagamento recebido';
};

const mapRecentPayment = (
  item: InstructorRecentPaymentItemApiResponse,
  index: number
): InstructorRecentPayment => ({
  id: getString(item.id) ?? `recent-payment-${index}`,
  description: buildPaymentDescription(item),
  amount: getNumber(item.valor_liquido, item.valor, item.valor_bruto, item.amount),
  date: parseDate(item.data_pagamento, item.data),
  status: normalizePaymentStatus(item.status),
});

const mapHistoryItem = (
  item: InstructorEarningsHistoryItemApiResponse,
  index: number
): InstructorRecentPayment => ({
  id: getString(item.id) ?? `earning-history-${index}`,
  description: buildPaymentDescription(item),
  amount: getNumber(
    item.ganho_liquido,
    item.valor_liquido,
    item.valor,
    item.valor_bruto,
    item.amount
  ),
  date: parseDate(item.data_pagamento, item.data_aula, item.data),
  status: normalizePaymentStatus(item.status),
});

const extractTrendItems = (response: unknown): unknown[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  const record = response as Record<string, unknown>;
  const candidates = [
    record.tendencia,
    record.historico,
    record.dados,
    record.pontos,
    record.items,
    record.series,
  ];

  return candidates.find(Array.isArray) as unknown[] | undefined ?? [];
};

const mapTrendPoint = (
  item: unknown,
  index: number
): InstructorEarningsTrendPoint | null => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const value = getNumber(
    typeof record.valor === 'number' ? record.valor : null,
    typeof record.total === 'number' ? record.total : null,
    typeof record.ganhos === 'number' ? record.ganhos : null,
    typeof record.amount === 'number' ? record.amount : null
  );

  const label =
    getString(
      typeof record.label === 'string' ? record.label : null,
      typeof record.periodo_label === 'string' ? record.periodo_label : null,
      typeof record.periodo === 'string' ? record.periodo : null,
      typeof record.mes === 'string' ? record.mes : null,
      typeof record.data === 'string' ? record.data : null
    ) ?? `P${index + 1}`;

  const referenceDate = parseDate(
    typeof record.data === 'string' ? record.data : null,
    typeof record.periodo_inicio === 'string' ? record.periodo_inicio : null
  );

  return {
    id: getString(typeof record.id === 'string' ? record.id : null) ?? `trend-${index}`,
    label,
    value,
    date: referenceDate,
  };
};

const calculateCurrentMonthEarnings = (
  historyItems: InstructorRecentPayment[]
): number =>
  historyItems.reduce((total, item) => {
    if (!item.date || !dayjs(item.date).isSame(dayjs(), 'month')) {
      return total;
    }

    if (item.status === 'failed') {
      return total;
    }

    return total + item.amount;
  }, 0);

export const mapInstructorEarningsOverview = ({
  historyResponse,
  recentPaymentsResponse,
  trendResponse,
}: {
  historyResponse: InstructorEarningsHistoryApiResponse;
  recentPaymentsResponse: InstructorRecentPaymentsApiResponse;
  trendResponse?: unknown;
}): InstructorEarningsOverview => {
  const historyItems = (historyResponse.historico ?? []).map(mapHistoryItem);
  const recentPayments = (recentPaymentsResponse.pagamentos ?? []).map(mapRecentPayment);
  const trendPoints = extractTrendItems(trendResponse)
    .map(mapTrendPoint)
    .filter((point): point is InstructorEarningsTrendPoint => point !== null);

  return {
    totalEarnings: getNumber(historyResponse.total_ganhos),
    currentMonthEarnings: calculateCurrentMonthEarnings(historyItems),
    historyCount: getNumber(historyResponse.total),
    historyItems,
    trend: {
      points: trendPoints,
      unavailable: trendPoints.length === 0,
    },
    recentPayments,
    paymentSummary: {
      totalCount: getNumber(recentPaymentsResponse.total),
      totalPaid: getNumber(recentPaymentsResponse.resumo?.total_pago),
      totalPending: getNumber(recentPaymentsResponse.resumo?.total_pendente),
    },
  };
};
