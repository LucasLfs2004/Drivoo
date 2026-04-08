import dayjs from 'dayjs';
import React from 'react';

import {
  Calendar,
  buildCalendarMonthCells,
  type CalendarCellModel,
  type CalendarDayTone,
} from '../../../shared/ui/base';
import { CALENDAR_WEEK_DAYS } from '../utils/availability';

export type AvailabilityCalendarCellModel = {
  date: string;
  label: string;
  marker?: string;
  tone?: AvailabilityCalendarDayTone;
  outsideMonth?: boolean;
  selected?: boolean;
  today?: boolean;
  disabled?: boolean;
};

export type AvailabilityCalendarDayTone =
  | 'default'
  | 'available'
  | 'blocked'
  | 'booking'
  | 'preserved'
  | 'extra'
  | 'partial';

type Props = {
  title?: string;
  visibleMonth: dayjs.Dayjs;
  onChangeMonth: (nextMonth: dayjs.Dayjs) => void;
  canGoToPreviousMonth?: boolean;
  canGoToNextMonth?: boolean;
  cells: AvailabilityCalendarCellModel[];
  onSelectDate?: (date: string) => void;
};

const availabilityToneMap: Record<AvailabilityCalendarDayTone, CalendarDayTone> = {
  default: 'default',
  available: 'brand',
  blocked: 'danger',
  booking: 'info',
  preserved: 'warning',
  extra: 'success',
  partial: 'info',
};

export const AvailabilityCalendar: React.FC<Props> = ({
  title,
  visibleMonth,
  onChangeMonth,
  canGoToPreviousMonth = true,
  canGoToNextMonth = true,
  cells,
  onSelectDate,
}) => {
  const calendarCells: CalendarCellModel[] = cells.map(cell => ({
    date: cell.date,
    label: cell.label,
    tone: availabilityToneMap[cell.tone ?? 'default'],
    showIndicator: Boolean(cell.marker),
    indicatorTone: availabilityToneMap[cell.tone ?? 'default'],
    outsideMonth: cell.outsideMonth,
    selected: cell.selected,
    today: cell.today,
    disabled: cell.disabled,
  }));

  return (
    <Calendar
      title={title}
      visibleMonth={visibleMonth}
      onChangeMonth={onChangeMonth}
      canGoToPreviousMonth={canGoToPreviousMonth}
      canGoToNextMonth={canGoToNextMonth}
      cells={calendarCells}
      onSelectDate={onSelectDate}
      weekDays={CALENDAR_WEEK_DAYS.map(day => ({
        key: String(day.day),
        label: day.shortLabel,
      }))}
    />
  );
};

export const buildCalendarBaseCells = (visibleMonth: dayjs.Dayjs) =>
  buildCalendarMonthCells(visibleMonth);
