import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../../themes';

export interface BookingCardProps {
  id: string;
  instructorName: string;
  instructorAvatar?: string;
  date: Date;
  duration: number; // em minutos
  price: number;
  currency?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  vehicleType?: 'manual' | 'automatic';
  location?: string;
  onPress?: () => void;
  onCancelPress?: () => void;
  onReschedulePress?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  id,
  instructorName,
  instructorAvatar,
  date,
  duration,
  price,
  currency = 'R$',
  status,
  vehicleType,
  location,
  onPress,
  onCancelPress,
  onReschedulePress,
  style,
  compact = false,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'scheduled':
        return theme.colors.primary[500];
      case 'completed':
        return theme.colors.semantic.success;
      case 'cancelled':
        return theme.colors.semantic.error;
      case 'in_progress':
        return theme.colors.semantic.warning;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      case 'in_progress':
        return 'Em andamento';
      default:
        return 'Desconhecido';
    }
  };

  const renderAvatar = () => {
    if (instructorAvatar) {
      return (
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
      );
    }
    
    // Default avatar with initials
    const initials = instructorName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return (
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const renderActions = () => {
    if (status === 'completed' || status === 'cancelled') {
      return null;
    }

    return (
      <View style={styles.actionsContainer}>
        {status === 'scheduled' && onReschedulePress && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={onReschedulePress}
          >
            <Text style={styles.rescheduleButtonText}>Reagendar</Text>
          </TouchableOpacity>
        )}
        {status === 'scheduled' && onCancelPress && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={onCancelPress}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          {renderAvatar()}
          <View style={styles.compactInfo}>
            <Text style={styles.compactInstructorName}>{instructorName}</Text>
            <Text style={styles.compactDateTime}>
              {formatDate(date)} • {formatTime(date)}
            </Text>
          </View>
          <View style={styles.compactStatus}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        {renderAvatar()}
        <View style={styles.headerInfo}>
          <Text style={styles.instructorName}>{instructorName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {currency} {price.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>
            {formatDate(date)} às {formatTime(date)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>⏱️</Text>
          <Text style={styles.detailText}>
            Duração: {formatDuration(duration)}
          </Text>
        </View>

        {vehicleType && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🚗</Text>
            <Text style={styles.detailText}>
              {vehicleType === 'manual' ? 'Manual' : 'Automático'}
            </Text>
          </View>
        )}

        {location && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{location}</Text>
          </View>
        )}
      </View>

      {renderActions()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borders.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
    borderWidth: theme.borders.width.thin,
    borderColor: theme.colors.border.light,
  },
  compactCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
    borderWidth: theme.borders.width.thin,
    borderColor: theme.colors.border.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  headerInfo: {
    flex: 1,
  },
  compactInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  instructorName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  compactInstructorName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  compactDateTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borders.radius.full,
    alignSelf: 'flex-start',
  },
  compactStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.semantic.success,
  },
  details: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailIcon: {
    fontSize: theme.typography.fontSize.md,
    marginRight: theme.spacing.sm,
    width: 20,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.md,
    borderWidth: theme.borders.width.base,
  },
  rescheduleButton: {
    backgroundColor: theme.colors.background.primary,
    borderColor: theme.colors.primary[500],
  },
  rescheduleButtonText: {
    color: theme.colors.primary[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  cancelButton: {
    backgroundColor: theme.colors.background.primary,
    borderColor: theme.colors.semantic.error,
  },
  cancelButtonText: {
    color: theme.colors.semantic.error,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
