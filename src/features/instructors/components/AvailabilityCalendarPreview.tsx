import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';
import type { InstructorAvailabilityCalendarDayApiResponse } from '../types/api';
import type { InstructorAvailabilityDraft, InstructorBookingPreview } from '../types/availability';
import { getEffectiveIntervalsForDate } from '../utils/availability';
import {
  AvailabilityCalendar,
  buildCalendarBaseCells,
  type AvailabilityCalendarCellModel,
} from './AvailabilityCalendar';

type Props = {
  title?: string;
  draft: InstructorAvailabilityDraft;
  bookings: InstructorBookingPreview[];
  preservedBookings: InstructorBookingPreview[];
  calendarDays?: InstructorAvailabilityCalendarDayApiResponse[];
  visibleMonth: dayjs.Dayjs;
  onChangeMonth: (nextMonth: dayjs.Dayjs) => void;
  canGoToPreviousMonth?: boolean;
  canGoToNextMonth?: boolean;
  onSelectDate?: (date: string) => void;
};

const getPreviewCellState = (
  draft: InstructorAvailabilityDraft,
  date: string,
  bookings: InstructorBookingPreview[],
  preservedBookings: InstructorBookingPreview[],
  calendarDays?: InstructorAvailabilityCalendarDayApiResponse[]
) => {
  const calendarDay = calendarDays?.find(item => item.data === date);
  const exception = draft.exceptions.find(item => item.date === date);
  const dayBookings = bookings.filter(item => item.date === date);
  const preserved = preservedBookings.filter(item => item.date === date);
  const effectiveIntervals = getEffectiveIntervalsForDate(draft, date);

  if (calendarDay?.bookings_preservados.length || preserved.length) {
    return { tone: 'preserved' as const, marker: 'Preservada' };
  }

  if (calendarDay?.bookings.length || dayBookings.length) {
    return { tone: 'booking' as const, marker: 'Aula' };
  }

  if (calendarDay?.status_dia === 'BLOQUEADO' || exception?.type === 'blocked') {
    return { tone: 'blocked' as const, marker: 'Bloq' };
  }

  if (exception?.type === 'available') {
    return { tone: 'extra' as const, marker: 'Extra' };
  }

  if (calendarDay?.status_dia === 'OCUPADO_PARCIAL') {
    return { tone: 'partial' as const, marker: 'Parcial' };
  }

  if (calendarDay?.status_dia === 'DISPONIVEL' || effectiveIntervals.length) {
    return { tone: 'available' as const, marker: 'Disp' };
  }

  return { tone: 'default' as const, marker: undefined };
};

export const AvailabilityCalendarPreview: React.FC<Props> = ({
  title,
  draft,
  bookings,
  preservedBookings,
  calendarDays,
  visibleMonth,
  onChangeMonth,
  canGoToPreviousMonth,
  canGoToNextMonth,
  onSelectDate,
}) => {
  const cells = useMemo<AvailabilityCalendarCellModel[]>(
    () =>
      buildCalendarBaseCells(visibleMonth).map(cell => ({
        ...cell,
        ...getPreviewCellState(
          draft,
          cell.date,
          bookings,
          preservedBookings,
          calendarDays
        ),
      })),
    [visibleMonth, draft, bookings, preservedBookings, calendarDays]
  );

  return (
    <View>
      <AvailabilityCalendar
        title={title}
        visibleMonth={visibleMonth}
        onChangeMonth={onChangeMonth}
        canGoToPreviousMonth={canGoToPreviousMonth}
        canGoToNextMonth={canGoToNextMonth}
        cells={cells}
        onSelectDate={onSelectDate}
      />

      <View style={styles.legend}>
        <Text style={styles.legendItem}>Disp: regra semanal</Text>
        <Text style={styles.legendItem}>Extra: exceção disponível</Text>
        <Text style={styles.legendItem}>Bloq: exceção bloqueada</Text>
        <Text style={styles.legendItem}>Aula: booking dentro da janela</Text>
        <Text style={styles.legendItem}>Preservada: aula fora da nova janela</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legend: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  legendItem: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
});
