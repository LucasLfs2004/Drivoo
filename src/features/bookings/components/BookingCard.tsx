import React from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { CalendarDays, Car, ChevronRight, Clock3, MapPin } from 'lucide-react-native';
import { theme } from '../../../theme';
import { formatCurrency } from '../../../utils/currency';
import type { BookingCheckoutStatusValue } from '../types/domain';

export interface BookingCardProps {
  id: string;
  instructorName: string;
  instructorAvatar?: string;
  date: Date;
  duration: number; // em minutos
  price: number;
  currency?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  apiStatus?: BookingCheckoutStatusValue | string | null;
  vehicleType?: 'manual' | 'automatic';
  vehicleLabel?: string;
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
  apiStatus,
  vehicleType,
  vehicleLabel,
  location,
  onPress,
  style,
  compact = true,
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
    if (apiStatus === 'PENDENTE_PAGAMENTO') {
      return theme.colors.semantic.warning;
    }

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
    if (apiStatus === 'PENDENTE_PAGAMENTO') {
      return 'Pagamento pendente';
    }

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
          <Image source={{ uri: instructorAvatar }} style={styles.avatarImage} />
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

  const dateLabel = `${formatDate(date)} às ${formatTime(date)}`;
  const vehicleLabelText =
    vehicleLabel ?? (vehicleType ? (vehicleType === 'manual' ? 'Manual' : 'Automático') : null);
  const priceLabel = formatCurrency(price, currency);

  if (compact) {
    return (
      <TouchableOpacity style={[styles.compactCard, style]} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.compactHeader}>
          <View style={styles.identity}>
            {renderAvatar()}
            <View style={styles.compactInfo}>
              <Text style={styles.compactInstructorName} numberOfLines={1}>
                {instructorName}
              </Text>
              <Text style={styles.compactDateTime}>{dateLabel}</Text>
            </View>
          </View>
          <ChevronRight color={theme.colors.text.tertiary} size={18} />
        </View>

        <View style={styles.compactMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          <Text style={styles.metaText}>{formatDuration(duration)}</Text>
          <Text style={styles.priceText}>{priceLabel}</Text>
        </View>

        {location ? (
          <View style={styles.locationRow}>
            <MapPin color={theme.colors.text.tertiary} size={14} />
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        {renderAvatar()}
        <View style={styles.headerInfo}>
          <Text style={styles.instructorName}>{instructorName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{priceLabel}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <CalendarDays color={theme.colors.text.tertiary} size={18} />
          <Text style={styles.detailText}>{dateLabel}</Text>
        </View>

        <View style={styles.detailRow}>
          <Clock3 color={theme.colors.text.tertiary} size={18} />
          <Text style={styles.detailText}>Duração: {formatDuration(duration)}</Text>
        </View>

        {vehicleLabelText && (
          <View style={styles.detailRow}>
            <Car color={theme.colors.text.tertiary} size={18} />
            <Text style={styles.detailText}>{vehicleLabelText}</Text>
          </View>
        )}

        {location && (
          <View style={styles.detailRow}>
            <MapPin color={theme.colors.text.tertiary} size={18} />
            <Text style={styles.detailText}>{location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: theme.borders.width.thin,
    borderColor: theme.colors.border.light,
  },
  compactCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: theme.borders.width.thin,
    borderColor: theme.colors.border.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: theme.spacing.sm,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
    minWidth: 0,
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
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borders.radius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  metaText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  priceText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.semantic.success,
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
    rowGap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  locationText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});
