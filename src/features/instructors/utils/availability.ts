import dayjs from 'dayjs';

import type {
  AvailabilityException,
  AvailabilityInterval,
  InstructorAvailabilityDraft,
  InstructorBookingPreview,
  WeeklyAvailability,
} from '../types/availability';

export const WEEK_DAYS = [
  { day: 1, shortLabel: 'Seg', fullLabel: 'Segunda-feira' },
  { day: 2, shortLabel: 'Ter', fullLabel: 'Terça-feira' },
  { day: 3, shortLabel: 'Qua', fullLabel: 'Quarta-feira' },
  { day: 4, shortLabel: 'Qui', fullLabel: 'Quinta-feira' },
  { day: 5, shortLabel: 'Sex', fullLabel: 'Sexta-feira' },
  { day: 6, shortLabel: 'Sáb', fullLabel: 'Sábado' },
  { day: 0, shortLabel: 'Dom', fullLabel: 'Domingo' },
] as const;

export const CALENDAR_WEEK_DAYS = [
  { day: 0, shortLabel: 'Dom', fullLabel: 'Domingo' },
  { day: 1, shortLabel: 'Seg', fullLabel: 'Segunda-feira' },
  { day: 2, shortLabel: 'Ter', fullLabel: 'Terça-feira' },
  { day: 3, shortLabel: 'Qua', fullLabel: 'Quarta-feira' },
  { day: 4, shortLabel: 'Qui', fullLabel: 'Quinta-feira' },
  { day: 5, shortLabel: 'Sex', fullLabel: 'Sexta-feira' },
  { day: 6, shortLabel: 'Sáb', fullLabel: 'Sábado' },
] as const;

const DEFAULT_WEEKLY: WeeklyAvailability = {
  1: [],
  2: [
    { start: '08:00', end: '12:00' },
    { start: '14:00', end: '17:00' },
  ],
  3: [],
  4: [
    { start: '09:00', end: '12:00' },
    { start: '13:30', end: '18:00' },
  ],
  5: [
    { start: '08:00', end: '12:00' },
  ],
  6: [
    { start: '08:00', end: '11:00' },
  ],
  0: [],
};

const DEFAULT_EXCEPTIONS: AvailabilityException[] = [
  {
    id: 'exception-1',
    type: 'available',
    date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    intervals: [{ start: '19:00', end: '21:00' }],
  },
  {
    id: 'exception-2',
    type: 'blocked',
    date: dayjs().add(5, 'day').format('YYYY-MM-DD'),
  },
];

export const createPrototypeAvailabilityDraft = (): InstructorAvailabilityDraft => ({
  timezone: 'America/Sao_Paulo',
  weekly: DEFAULT_WEEKLY,
  exceptions: DEFAULT_EXCEPTIONS,
});

export const createEmptyWeeklyAvailability = (): WeeklyAvailability => ({
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
});

export const sortIntervals = (intervals: AvailabilityInterval[]) =>
  [...intervals].sort((left, right) => left.start.localeCompare(right.start));

const ONLY_DIGITS_REGEX = /\D/g;
const TIME_VALUE_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const maskTimeInput = (value: string) => {
  const digits = value.replace(ONLY_DIGITS_REGEX, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

export const isValidTimeValue = (value: string) => TIME_VALUE_REGEX.test(value);

const getTimeValueInMinutes = (value: string) => {
  if (!isValidTimeValue(value)) {
    return null;
  }

  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatIntervalsSummary = (intervals: AvailabilityInterval[]) => {
  if (!intervals.length) {
    return 'Indisponível';
  }

  return sortIntervals(intervals)
    .map(interval => `${interval.start} - ${interval.end}`)
    .join(' · ');
};

export const isPastDate = (date: string) => dayjs(date).isBefore(dayjs().startOf('day'));

export const getDayLabel = (day: number) =>
  WEEK_DAYS.find(item => item.day === day)?.fullLabel ?? 'Dia';

export const normalizeWeeklyAvailability = (weekly: WeeklyAvailability): WeeklyAvailability =>
  WEEK_DAYS.reduce<WeeklyAvailability>((acc, current) => {
    acc[current.day] = sortIntervals(weekly[current.day] ?? []);
    return acc;
  }, createEmptyWeeklyAvailability());

export const getDayValidationErrors = (intervals: AvailabilityInterval[]) => {
  const sorted = sortIntervals(intervals);

  return sorted.map((interval, index) => {
    if (!interval.start || !interval.end) {
      return 'Preencha início e fim.';
    }

    if (!isValidTimeValue(interval.start) || !isValidTimeValue(interval.end)) {
      return 'Use um horário válido no formato HH:mm.';
    }

    const startMinutes = getTimeValueInMinutes(interval.start);
    const endMinutes = getTimeValueInMinutes(interval.end);

    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      return 'O início deve ser antes do fim.';
    }

    const previous = sorted[index - 1];
    const previousEndMinutes = previous ? getTimeValueInMinutes(previous.end) : null;
    if (
      previous &&
      previousEndMinutes !== null &&
      startMinutes < previousEndMinutes
    ) {
      return 'Este horário se sobrepõe ao intervalo anterior.';
    }

    return null;
  });
};

const getWeekDayFromDate = (date: string) => dayjs(date).day();

export const getEffectiveIntervalsForDate = (
  draft: InstructorAvailabilityDraft,
  date: string
) => {
  const exception = draft.exceptions.find(item => item.date === date);

  if (exception?.type === 'blocked') {
    return [];
  }

  if (exception?.type === 'available') {
    return sortIntervals(exception.intervals);
  }

  return sortIntervals(draft.weekly[getWeekDayFromDate(date)] ?? []);
};

const intervalContains = (interval: AvailabilityInterval, booking: InstructorBookingPreview) =>
  interval.start <= booking.start && interval.end >= booking.end;

export const getPreservedBookings = (
  draft: InstructorAvailabilityDraft,
  bookings: InstructorBookingPreview[]
) =>
  bookings.filter(booking => {
    const effectiveIntervals = getEffectiveIntervalsForDate(draft, booking.date);

    if (!effectiveIntervals.length) {
      return true;
    }

    return !effectiveIntervals.some(interval => intervalContains(interval, booking));
  });

export const buildMonthMatrix = (referenceDate: dayjs.Dayjs) => {
  const startOfMonth = referenceDate.startOf('month');
  const startOffset = startOfMonth.day();
  const gridStart = startOfMonth.subtract(startOffset, 'day');

  return Array.from({ length: 35 }, (_, index) => gridStart.add(index, 'day'));
};

export const getMonthRange = (referenceDate: dayjs.Dayjs) => ({
  start: referenceDate.startOf('month').format('YYYY-MM-DD'),
  end: referenceDate.endOf('month').format('YYYY-MM-DD'),
});
