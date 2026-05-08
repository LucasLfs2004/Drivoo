import dayjs from 'dayjs';

import type {
  InstructorEarningsOverview,
  InstructorFinancialSummary,
  InstructorEarningsTrendPoint,
  InstructorPaymentStatus,
  InstructorRecentPayment,
} from '../types/domain';
import type {
  InstructorEarningsHistoryApiResponse,
  InstructorEarningsHistoryItemApiResponse,
  InstructorFinancialSummaryApiResponse,
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

const formatChartDateLabel = (date?: string): string => {
  if (!date) {
    return '';
  }

  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format('DD/MM') : date;
};

const buildPaymentDescription = (
  item: InstructorEarningsHistoryItemApiResponse | InstructorRecentPaymentItemApiResponse,
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
  index: number,
): InstructorRecentPayment => ({
  id: getString(item.id) ?? `recent-payment-${index}`,
  description: buildPaymentDescription(item),
  amount: getNumber(item.valor_liquido, item.valor, item.valor_bruto, item.amount),
  date: parseDate(item.data_pagamento, item.data),
  status: normalizePaymentStatus(item.status),
});

const mapHistoryItem = (
  item: InstructorEarningsHistoryItemApiResponse,
  index: number,
): InstructorRecentPayment => ({
  id: getString(item.id) ?? `earning-history-${index}`,
  description: buildPaymentDescription(item),
  amount: getNumber(
    item.ganho_liquido,
    item.valor_liquido,
    item.valor,
    item.valor_bruto,
    item.amount,
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

  return (candidates.find(Array.isArray) as unknown[] | undefined) ?? [];
};

const mapTrendPoint = (item: unknown, index: number): InstructorEarningsTrendPoint | null => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const value = getNumber(
    typeof record.valor === 'number' ? record.valor : null,
    typeof record.total === 'number' ? record.total : null,
    typeof record.ganhos === 'number' ? record.ganhos : null,
    typeof record.amount === 'number' ? record.amount : null,
  );

  const label =
    getString(
      typeof record.label === 'string' ? record.label : null,
      typeof record.periodo_label === 'string' ? record.periodo_label : null,
      typeof record.periodo === 'string' ? record.periodo : null,
      typeof record.mes === 'string' ? record.mes : null,
      typeof record.data === 'string' ? record.data : null,
    ) ?? `P${index + 1}`;

  const referenceDate = parseDate(
    typeof record.data === 'string' ? record.data : null,
    typeof record.periodo_inicio === 'string' ? record.periodo_inicio : null,
  );

  return {
    id: getString(typeof record.id === 'string' ? record.id : null) ?? `trend-${index}`,
    label,
    value,
    date: referenceDate,
  };
};

const calculateCurrentMonthEarnings = (historyItems: InstructorRecentPayment[]): number =>
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

export const mapInstructorFinancialSummary = (
  response: InstructorFinancialSummaryApiResponse,
): InstructorFinancialSummary => {
  const amounts = {
    received: getNumber(response.financeiro?.recebido),
    completedInPeriod: getNumber(response.financeiro?.valor_concluido_periodo),
    completedInPreviousPeriod: getNumber(response.financeiro?.valor_concluido_periodo_anterior),
    completedVariationPercent: getNumber(response.financeiro?.variacao_concluido_percentual),
    availableForPayout: getNumber(response.financeiro?.disponivel_para_repasse),
    processing: getNumber(response.financeiro?.em_processamento),
    toRelease: getNumber(response.financeiro?.a_liberar),
    blockedUnderReview: getNumber(response.financeiro?.bloqueado_em_analise),
    payoutFailed: getNumber(response.financeiro?.falha_repasse),
    forecastFutureConfirmedLessons: getNumber(
      response.financeiro?.previsto_aulas_futuras_confirmadas,
    ),
  };

  const periodMovement = {
    lessonsInPeriod: getNumber(response.periodo_resumo?.aulas_no_periodo),
    created: getNumber(response.periodo_resumo?.aulas_criadas),
    scheduled: getNumber(response.periodo_resumo?.aulas_agendadas),
    forecasted: getNumber(response.periodo_resumo?.aulas_previstas),
    completed: getNumber(response.periodo_resumo?.aulas_concluidas),
    canceled: getNumber(response.periodo_resumo?.aulas_canceladas),
    noShow: getNumber(response.periodo_resumo?.nao_compareceu),
    scheduledAmount: getNumber(response.periodo_resumo?.valor_agendado),
    completedAmount: getNumber(response.periodo_resumo?.valor_concluido),
    forecastedAmount: getNumber(response.periodo_resumo?.valor_previsto),
  };

  const amountValues = Object.values(amounts);
  const movementValues = Object.values(periodMovement);
  const financialEvolutionPoints = (response.evolucao_financeira?.pontos ?? []).map(
    (point, index) => {
      const date = getString(point.data) ?? '';

      return {
        id: date || `financial-evolution-${index}`,
        date,
        label: formatChartDateLabel(date) || `P${index + 1}`,
        value: getNumber(point.valor),
        accumulated: getNumber(point.acumulado),
        lessonsCount: getNumber(point.quantidade_aulas),
      };
    },
  );

  const lessonsByStatus = (response.resumo_aulas_por_status ?? []).map((item, index) => {
    const status = getString(item.status) ?? `status-${index}`;

    return {
      id: status,
      status,
      label: getString(item.label, status) ?? status,
      count: getNumber(item.quantidade),
    };
  });

  const recentLessons = (response.aulas_recentes ?? []).map((lesson, index) => {
    const locationSummary = getString(
      lesson.local?.resumo,
      lesson.local?.bairro && lesson.local?.estado
        ? `${lesson.local.bairro} - ${lesson.local.estado}`
        : undefined,
      lesson.local?.cidade && lesson.local?.estado
        ? `${lesson.local.cidade} - ${lesson.local.estado}`
        : undefined,
      lesson.local?.endereco_completo,
    );

    return {
      id: getString(lesson.id) ?? `recent-lesson-${index}`,
      date: getString(lesson.data) ?? '',
      startTime: getString(lesson.hora_inicio, lesson.inicio) ?? '',
      endTime: getString(lesson.hora_fim, lesson.fim) ?? '',
      durationMinutes: getNumber(lesson.duracao_minutos),
      student: {
        id: getString(lesson.aluno?.id) ?? '',
        name: getString(lesson.aluno?.nome) ?? 'Aluno',
        avatar: getString(lesson.aluno?.foto_url),
      },
      status: getString(lesson.status) ?? 'UNKNOWN',
      statusLabel: getString(lesson.status_label, lesson.status) ?? 'Sem status',
      location: {
        summary: locationSummary ?? 'Local não informado',
        neighborhood: getString(lesson.local?.bairro),
        city: getString(lesson.local?.cidade),
        state: getString(lesson.local?.estado),
        fullAddress: getString(lesson.local?.endereco_completo),
      },
      instructorAmount: getNumber(lesson.valor_instrutor),
      totalAmount: getNumber(lesson.valor_total),
      evaluated: Boolean(lesson.avaliado),
    };
  });

  return {
    instructorId: getString(response.instrutor_id) ?? '',
    period: {
      startDate: getString(response.periodo?.data_inicio) ?? '',
      endDate: getString(response.periodo?.data_fim) ?? '',
      days: getNumber(response.periodo?.dias),
    },
    amounts,
    futureConfirmedLessons: {
      count: getNumber(response.aulas_futuras_confirmadas?.quantidade),
      instructorAmount: getNumber(response.aulas_futuras_confirmadas?.valor_instrutor),
    },
    periodMovement,
    financialEvolution: {
      type: getString(response.evolucao_financeira?.tipo) ?? 'acumulado',
      total: getNumber(response.evolucao_financeira?.total),
      points: financialEvolutionPoints,
    },
    lessonsByStatus,
    recentLessons,
    isEmpty:
      amountValues.every(value => value === 0) &&
      movementValues.every(value => value === 0) &&
      getNumber(response.aulas_futuras_confirmadas?.quantidade) === 0 &&
      financialEvolutionPoints.length === 0 &&
      lessonsByStatus.length === 0 &&
      recentLessons.length === 0,
  };
};
