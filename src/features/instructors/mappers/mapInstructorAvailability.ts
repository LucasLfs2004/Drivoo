import type {
  InstructorAvailabilityAggregateApiResponse,
  InstructorAvailabilityBulkApiRequest,
  InstructorBookingsPreviewApiResponse,
} from '../types/api';
import type {
  AvailabilityException,
  InstructorAvailabilityDraft,
  InstructorBookingPreview,
  WeeklyAvailability,
} from '../types/availability';
import { createEmptyWeeklyAvailability, normalizeWeeklyAvailability } from '../utils/availability';

const normalizeTime = (value?: string | null) => (value ?? '').slice(0, 5);

export const mapInstructorAvailability = (
  response: InstructorAvailabilityAggregateApiResponse
): InstructorAvailabilityDraft => {
  const weekly = response.semanal.reduce<WeeklyAvailability>((acc, item) => {
    acc[item.dia_semana] = (item.intervalos ?? []).map(interval => ({
      start: normalizeTime(interval.hora_inicio),
      end: normalizeTime(interval.hora_fim),
    }));

    return acc;
  }, createEmptyWeeklyAvailability());

  const exceptions = (response.excecoes ?? []).map<AvailabilityException>(item => {
    if (item.tipo_disponibilidade === 'EXCECAO_BLOQUEIO') {
      return {
        id: `blocked-${item.data_especifica}`,
        type: 'blocked',
        date: item.data_especifica,
      };
    }

    return {
      id: `available-${item.data_especifica}`,
      type: 'available',
      date: item.data_especifica,
      intervals: (item.intervalos ?? []).map(interval => ({
        start: normalizeTime(interval.hora_inicio),
        end: normalizeTime(interval.hora_fim),
      })),
    };
  });

  return {
    timezone: response.timezone ?? 'America/Sao_Paulo',
    weekly: normalizeWeeklyAvailability(weekly),
    exceptions: exceptions.sort((left, right) => left.date.localeCompare(right.date)),
  };
};

export const mapInstructorAvailabilityToBulkPayload = (
  draft: InstructorAvailabilityDraft,
  initialDraft?: InstructorAvailabilityDraft
): InstructorAvailabilityBulkApiRequest => {
  const weeklyItems = Object.entries(draft.weekly)
      .filter(([day, intervals]) => {
        if (!initialDraft) {
          return true;
        }

        const previousIntervals = initialDraft.weekly[Number(day)] ?? [];
        return JSON.stringify(previousIntervals) !== JSON.stringify(intervals);
      })
      .map(([day, intervals]) => ({
        tipo_disponibilidade: 'SEMANAL' as const,
        dias_semana: [Number(day)],
        intervalos: intervals.map(interval => ({
          hora_inicio: interval.start,
          hora_fim: interval.end,
        })),
      }));

  const exceptionItems = draft.exceptions
      .filter(item => {
        if (!initialDraft) {
          return true;
        }

        const previousException = initialDraft.exceptions.find(
          current =>
            current.date === item.date &&
            current.type === item.type
        );

        if (!previousException) {
          return true;
        }

        return JSON.stringify(previousException) !== JSON.stringify(item);
      })
      .map(item => {
      if (item.type === 'blocked') {
        return {
          tipo_disponibilidade: 'EXCECAO_BLOQUEIO' as const,
          datas_especificas: [item.date],
        };
      }

      return {
        tipo_disponibilidade: 'EXCECAO_DISPONIVEL' as const,
        datas_especificas: [item.date],
        intervalos: item.intervals.map(interval => ({
          hora_inicio: interval.start,
          hora_fim: interval.end,
        })),
      };
    });

  const deletedExceptionItems = initialDraft
    ? initialDraft.exceptions
        .filter(previous =>
          !draft.exceptions.some(current => current.id === previous.id)
        )
        .map(previous => ({
          tipo_disponibilidade: 'EXCLUIR_EXCECAO' as const,
          datas_especificas: [previous.date],
        }))
    : [];

  return {
    modo: 'SUBSTITUIR',
    itens: [...weeklyItems, ...exceptionItems, ...deletedExceptionItems],
  };
};

export const mapInstructorBookingsPreview = (
  response: InstructorBookingsPreviewApiResponse
): InstructorBookingPreview[] =>
  (response.itens ?? []).map(item => ({
    id: item.id,
    date: item.data,
    start: normalizeTime(item.hora_inicio),
    end: normalizeTime(item.hora_fim),
    status: item.status === 'PENDENTE' ? 'pending' : 'confirmed',
  }));
