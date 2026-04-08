import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { theme } from '../../../theme';
import {
  Calendar,
  buildCalendarMonthCells,
  type CalendarCellModel,
} from '../base';

type Props = {
  title?: string;
  value?: string | null;
  visibleMonth: dayjs.Dayjs;
  onChangeMonth: (nextMonth: dayjs.Dayjs) => void;
  onChange?: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  disablePastDates?: boolean;
  canGoToPreviousMonth?: boolean;
  canGoToNextMonth?: boolean;
  showFooter?: boolean;
  emptyFooterText?: string;
  footerLabel?: string;
  valueFormat?: string;
  renderFooter?: (params: {
    value?: string | null;
    formattedValue?: string | null;
  }) => React.ReactNode;
};

export const DatePickerCalendar: React.FC<Props> = ({
  title,
  value,
  visibleMonth,
  onChangeMonth,
  onChange,
  minDate,
  maxDate,
  disablePastDates = false,
  canGoToPreviousMonth,
  canGoToNextMonth,
  showFooter = true,
  emptyFooterText = 'Selecione uma data',
  footerLabel = 'Data selecionada',
  valueFormat = 'DD/MM/YYYY',
  renderFooter,
}) => {
  const resolvedMinDate = useMemo(() => {
    if (disablePastDates) {
      const today = dayjs().startOf('day');

      if (!minDate) {
        return today;
      }

      const min = dayjs(minDate).startOf('day');
      return min.isAfter(today) ? min : today;
    }

    return minDate ? dayjs(minDate).startOf('day') : null;
  }, [disablePastDates, minDate]);

  const resolvedMaxDate = useMemo(
    () => (maxDate ? dayjs(maxDate).endOf('day') : null),
    [maxDate]
  );

  const cells = useMemo<CalendarCellModel[]>(
    () =>
      buildCalendarMonthCells(visibleMonth).map(cell => {
        const cellDate = dayjs(cell.date);
        const isBeforeMin = resolvedMinDate
          ? cellDate.isBefore(resolvedMinDate, 'day')
          : false;
        const isAfterMax = resolvedMaxDate ? cellDate.isAfter(resolvedMaxDate, 'day') : false;

        return {
          ...cell,
          selected: value === cell.date,
          disabled: isBeforeMin || isAfterMax,
          tone: value === cell.date ? 'brand' : cell.today ? 'neutral' : 'default',
        };
      }),
    [visibleMonth, resolvedMaxDate, resolvedMinDate, value]
  );

  const allowPreviousMonth = useMemo(() => {
    if (typeof canGoToPreviousMonth === 'boolean') {
      return canGoToPreviousMonth;
    }

    if (!resolvedMinDate) {
      return true;
    }

    return visibleMonth.startOf('month').isAfter(resolvedMinDate.startOf('month'));
  }, [canGoToPreviousMonth, resolvedMinDate, visibleMonth]);

  const allowNextMonth = useMemo(() => {
    if (typeof canGoToNextMonth === 'boolean') {
      return canGoToNextMonth;
    }

    if (!resolvedMaxDate) {
      return true;
    }

    return visibleMonth.startOf('month').isBefore(resolvedMaxDate.startOf('month'));
  }, [canGoToNextMonth, resolvedMaxDate, visibleMonth]);

  const formattedValue = useMemo(() => {
    if (!value) {
      return null;
    }

    return dayjs(value).format(valueFormat);
  }, [value, valueFormat]);

  const footerContent = renderFooter ? (
    renderFooter({ value, formattedValue })
  ) : showFooter ? (
    <Text style={styles.footerText}>
      {formattedValue ? `${footerLabel}: ${formattedValue}` : emptyFooterText}
    </Text>
  ) : null;

  return (
    <Calendar
      title={title}
      footer={footerContent}
      visibleMonth={visibleMonth}
      onChangeMonth={onChangeMonth}
      canGoToPreviousMonth={allowPreviousMonth}
      canGoToNextMonth={allowNextMonth}
      cells={cells}
      onSelectDate={onChange}
    />
  );
};

const styles = StyleSheet.create({
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});
