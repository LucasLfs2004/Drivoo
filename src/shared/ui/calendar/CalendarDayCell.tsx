import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';

export type CalendarDayTone =
  | 'default'
  | 'neutral'
  | 'brand'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

type Props = {
  dayLabel: string;
  tone?: CalendarDayTone;
  showIndicator?: boolean;
  indicatorTone?: CalendarDayTone;
  indicatorColor?: string;
  outsideMonth?: boolean;
  selected?: boolean;
  today?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

const toneStyles: Record<
  CalendarDayTone,
  { backgroundColor: string; markerColor: string }
> = {
  default: {
    backgroundColor: theme.colors.background.primary,
    markerColor: theme.colors.text.tertiary,
  },
  neutral: {
    backgroundColor: theme.colors.coolGray[200],
    markerColor: theme.colors.coolGray[700],
  },
  brand: {
    backgroundColor: theme.colors.primary[100],
    markerColor: theme.colors.primary[600],
  },
  info: {
    backgroundColor: theme.colors.secondary[100],
    markerColor: theme.colors.secondary[600],
  },
  success: {
    backgroundColor: theme.colors.success[100],
    markerColor: theme.colors.success[600],
  },
  warning: {
    backgroundColor: '#FFF0D9',
    markerColor: theme.colors.warning[700],
  },
  danger: {
    backgroundColor: '#FDEAEA',
    markerColor: '#D14343',
  },
};

export const CalendarDayCell: React.FC<Props> = ({
  dayLabel,
  tone = 'default',
  showIndicator = false,
  indicatorTone,
  indicatorColor,
  outsideMonth = false,
  selected = false,
  today = false,
  disabled = false,
  onPress,
}) => {
  const toneStyle = toneStyles[tone];
  const resolvedIndicatorColor =
    indicatorColor ??
    (indicatorTone ? toneStyles[indicatorTone].markerColor : toneStyle.markerColor);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        styles.cell,
        { backgroundColor: toneStyle.backgroundColor },
        today && styles.todayCell,
        selected && styles.selectedCell,
        outsideMonth && styles.outsideMonthCell,
        disabled && styles.disabledCell,
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.dayText,
            { color: selected ? theme.colors.text.inverse : theme.colors.text.primary },
            outsideMonth && styles.outsideMonthText,
            disabled && styles.disabledText,
          ]}
        >
          {dayLabel}
        </Text>
        {showIndicator ? (
          <View
            style={[
              styles.markerDot,
              {
                backgroundColor: selected
                  ? theme.colors.text.inverse
                  : resolvedIndicatorColor,
              },
              disabled && styles.disabledMarkerDot,
            ]}
          />
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    minHeight: 42,
    aspectRatio: 1,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCell: {
    backgroundColor: theme.colors.primary[500],
  },
  todayCell: {
    backgroundColor: theme.colors.coolGray[200],
  },
  outsideMonthCell: {
    opacity: 0.35,
  },
  disabledCell: {
    opacity: 0.45,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dayText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    lineHeight: 18,
  },
  markerDot: {
    width: 5,
    height: 5,
    borderRadius: theme.borders.radius.full,
  },
  outsideMonthText: {
    color: theme.colors.text.tertiary,
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
  disabledMarkerDot: {
    opacity: 0.4,
  },
});
