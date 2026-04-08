import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../shared/ui/base/Card';
import { theme } from '../../../theme';
import type { AvailabilityInterval } from '../types/availability';
import { formatIntervalsSummary, getDayLabel } from '../utils/availability';

type Props = {
  day: number;
  intervals: AvailabilityInterval[];
  onPress?: () => void;
  changeLabel?: string;
  highlighted?: boolean;
};

export const AvailabilityDayCard: React.FC<Props> = ({
  day,
  intervals,
  onPress,
  changeLabel,
  highlighted = false,
}) => {
  const content = (
    <Card style={[styles.card, highlighted && styles.cardHighlighted]}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.dayLabel}>{getDayLabel(day)}</Text>
          {changeLabel ? (
            <View style={styles.changeBadge}>
              <Text style={styles.changeBadgeText}>{changeLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.summary, !intervals.length && styles.summaryMuted]}>
          {formatIntervalsSummary(intervals)}
        </Text>
      </View>
      {onPress ? <ChevronRight color={theme.colors.text.tertiary} size={18} /> : null}
    </Card>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
};

const styles = StyleSheet.create({
  card: {
    // marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.light,
  },
  cardHighlighted: {
    borderColor: theme.colors.primary[300],
    backgroundColor: '#F7FBFF',
  },
  content: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  dayLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  changeBadge: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borders.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  changeBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  summary: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
  },
  summaryMuted: {
    color: theme.colors.text.secondary,
  },
});
