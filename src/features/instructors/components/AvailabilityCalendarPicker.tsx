import dayjs from 'dayjs';
import React from 'react';

import { DatePickerCalendar } from '../../../shared/ui/forms';

type Props = {
  title?: string;
  visibleMonth: dayjs.Dayjs;
  selectedDate?: string | null;
  onChangeMonth: (nextMonth: dayjs.Dayjs) => void;
  onSelectDate: (date: string) => void;
  canGoToPreviousMonth?: boolean;
  canGoToNextMonth?: boolean;
  disablePastDates?: boolean;
};

export const AvailabilityCalendarPicker: React.FC<Props> = ({
  title,
  visibleMonth,
  selectedDate,
  onChangeMonth,
  onSelectDate,
  canGoToPreviousMonth,
  canGoToNextMonth,
  disablePastDates = true,
}) => {
  return (
    <DatePickerCalendar
      title={title}
      value={selectedDate}
      visibleMonth={visibleMonth}
      onChangeMonth={onChangeMonth}
      onChange={onSelectDate}
      disablePastDates={disablePastDates}
      canGoToPreviousMonth={canGoToPreviousMonth}
      canGoToNextMonth={canGoToNextMonth}
    />
  );
};
