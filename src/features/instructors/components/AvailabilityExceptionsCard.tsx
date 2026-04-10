import dayjs from 'dayjs';
import { CalendarPlus2, Trash2 } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { Button } from '../../../shared/ui/base/Button';
import { Card } from '../../../shared/ui/base/Card';
import { theme } from '../../../theme';
import type { AvailabilityException } from '../types/availability';
import { formatIntervalsSummary } from '../utils/availability';

type Props = {
  exceptions: AvailabilityException[];
  title?: string;
  actionLabel?: string;
  onPressAction?: () => void;
  onRemoveException?: (exceptionId: string) => void;
  changeLabels?: Map<string, string>;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onPressEmptyAction?: () => void;
  style?: ViewStyle;
};

export const AvailabilityExceptionsCard: React.FC<Props> = ({
  exceptions,
  title = 'Exceções',
  actionLabel,
  onPressAction,
  onRemoveException,
  changeLabels,
  emptyTitle = 'Nenhuma exceção criada',
  emptyDescription = 'Use exceções para abrir horários extras ou bloquear datas específicas sem mexer na semana base.',
  emptyActionLabel,
  onPressEmptyAction,
  style,
}) => {
  return (
    <Card style={StyleSheet.flatten([styles.card, style])}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerMeta}>
          <View style={styles.countBadge}>
            <CalendarPlus2 color={theme.colors.primary[500]} size={14} />
            <Text style={styles.countBadgeText}>{exceptions.length} cadastrada(s)</Text>
          </View>
          {actionLabel && onPressAction ? (
            <Button title={actionLabel} variant="ghost" size="sm" onPress={onPressAction} />
          ) : null}
        </View>
      </View>

      {exceptions.length ? (
        <View style={styles.list}>
          {exceptions.map(item => (
            <View key={item.id} style={styles.row}>
              <View style={styles.content}>
                <View style={styles.rowHeader}>
                  <Text style={styles.date}>{dayjs(item.date).format('DD/MM/YYYY')}</Text>
                  {changeLabels?.get(item.id) ? (
                    <View style={styles.statusChip}>
                      <Text style={styles.statusChipText}>{changeLabels.get(item.id)}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.description}>
                  {item.type === 'blocked'
                    ? 'Bloqueio total para este dia'
                    : `Disponível: ${formatIntervalsSummary(item.intervals)}`}
                </Text>
              </View>
              {onRemoveException ? (
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => onRemoveException(item.id)}
                >
                  <Trash2 color={theme.colors.semantic.error} size={16} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyDescription}>{emptyDescription}</Text>
          {emptyActionLabel && onPressEmptyAction ? (
            <Button
              title={emptyActionLabel}
              variant="outline"
              size="sm"
              onPress={onPressEmptyAction}
            />
          ) : null}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FCFDFF',
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.light,
    rowGap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.primary[50],
  },
  countBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  list: {
    rowGap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: theme.borders.width.base,
    borderBottomColor: theme.colors.border.light,
  },
  content: {
    flex: 1,
    rowGap: theme.spacing.xs,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  date: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.primary[50],
  },
  statusChipText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2F2',
  },
  emptyState: {
    alignItems: 'flex-start',
    rowGap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptyDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.sm,
  },
});
