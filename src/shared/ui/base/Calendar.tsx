import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';
import { CalendarDayCell, type CalendarDayTone } from './CalendarDayCell';
import { Card } from './Card';

export const DEFAULT_CALENDAR_WEEK_DAYS = [
  { key: 'sun', label: 'SUN' },
  { key: 'mon', label: 'MON' },
  { key: 'tue', label: 'TUE' },
  { key: 'wed', label: 'WED' },
  { key: 'thu', label: 'THU' },
  { key: 'fri', label: 'FRI' },
  { key: 'sat', label: 'SAT' },
] as const;

export type CalendarCellModel = {
  date: string;
  label: string;
  tone?: CalendarDayTone;
  showIndicator?: boolean;
  indicatorTone?: CalendarDayTone;
  indicatorColor?: string;
  outsideMonth?: boolean;
  selected?: boolean;
  today?: boolean;
  disabled?: boolean;
};

type Props = {
  title?: string;
  footer?: React.ReactNode;
  visibleMonth: dayjs.Dayjs;
  onChangeMonth: (nextMonth: dayjs.Dayjs) => void;
  canGoToPreviousMonth?: boolean;
  canGoToNextMonth?: boolean;
  cells: CalendarCellModel[];
  onSelectDate?: (date: string) => void;
  weekDays?: ReadonlyArray<{ key: string; label: string }>;
};

export const Calendar: React.FC<Props> = ({
  title,
  footer,
  visibleMonth,
  onChangeMonth,
  canGoToPreviousMonth = true,
  canGoToNextMonth = true,
  cells,
  onSelectDate,
  weekDays = DEFAULT_CALENDAR_WEEK_DAYS,
}) => {
  const weeks = useMemo(() => {
    const grouped: CalendarCellModel[][] = [];

    for (let index = 0; index < cells.length; index += 7) {
      grouped.push(cells.slice(index, index + 7));
    }

    return grouped;
  }, [cells]);

  return (
    <Card >
      <View style={styles.header}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <View style={styles.monthSwitcher}>
          <Pressable
            onPress={() => onChangeMonth(visibleMonth.subtract(1, 'month'))}
            disabled={!canGoToPreviousMonth}
            style={[styles.navButton, !canGoToPreviousMonth && styles.disabledNavButton]}
          >
            <ChevronLeft color={theme.colors.text.primary} size={18} />
          </Pressable>
          <Text style={styles.monthLabel}>{visibleMonth.format('MMMM YYYY')}</Text>
          <Pressable
            onPress={() => onChangeMonth(visibleMonth.add(1, 'month'))}
            disabled={!canGoToNextMonth}
            style={[styles.navButton, !canGoToNextMonth && styles.disabledNavButton]}
          >
            <ChevronRight color={theme.colors.text.primary} size={18} />
          </Pressable>
        </View>
      </View>

      <View style={styles.weekHeader}>
        {weekDays.map(day => (
          <Text key={day.key} style={styles.weekHeaderText}>
            {day.label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={`calendar-week-${weekIndex}`} style={styles.weekRow}>
            {week.map(cell => (
              <CalendarDayCell
                key={cell.date}
                dayLabel={cell.label}
                tone={cell.tone}
                showIndicator={cell.showIndicator}
                indicatorTone={cell.indicatorTone}
                indicatorColor={cell.indicatorColor}
                outsideMonth={cell.outsideMonth}
                selected={cell.selected}
                today={cell.today}
                disabled={cell.disabled}
                onPress={onSelectDate ? () => onSelectDate(cell.date) : undefined}
              />
            ))}
          </View>
        ))}
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Card>
  );
};

export const buildCalendarMonthCells = (visibleMonth: dayjs.Dayjs) => {
  const startOfMonth = visibleMonth.startOf('month');
  const startOffset = startOfMonth.day();
  const gridStart = startOfMonth.subtract(startOffset, 'day');

  return Array.from({ length: 35 }, (_, index) => gridStart.add(index, 'day')).map(cell => ({
    date: cell.format('YYYY-MM-DD'),
    label: cell.format('DD'),
    outsideMonth: cell.month() !== visibleMonth.month(),
    today: cell.isSame(dayjs(), 'day'),
  }));
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  monthSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textTransform: 'capitalize',
  },
  disabledNavButton: {
    opacity: 0.35,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  grid: {
    gap: 6,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 6,
  },
  footer: {
    marginTop: theme.spacing.md,
  },
});
