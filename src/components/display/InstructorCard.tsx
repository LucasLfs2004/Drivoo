import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../themes';

export interface InstructorCardProps {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  currency?: string;
  specialties?: string[];
  availability?: string;
  distance?: string;
  vehicleType?: 'manual' | 'automatic';
  onPress?: () => void;
  onBookPress?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export const InstructorCard: React.FC<InstructorCardProps> = ({
  id,
  name,
  avatar,
  rating,
  reviewCount,
  hourlyRate,
  currency = 'R$',
  specialties = [],
  availability,
  distance,
  vehicleType,
  onPress,
  onBookPress,
  style,
  compact = false,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐'); // Simplified - in real app you'd use half star icon
    }
    
    return stars.join('');
  };

  const renderAvatar = () => {
    if (avatar) {
      return <Image source={{ uri: avatar }} style={styles.avatar} />;
    }
    
    // Default avatar with initials
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return (
      <View style={styles.defaultAvatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const renderSpecialties = () => {
    if (specialties.length === 0) return null;
    
    return (
      <View style={styles.specialtiesContainer}>
        {specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyBadge}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
        {specialties.length > 3 && (
          <Text style={styles.moreSpecialties}>+{specialties.length - 3}</Text>
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
            <Text style={styles.compactName}>{name}</Text>
            <View style={styles.compactRating}>
              <Text style={styles.stars}>{renderStars(rating)}</Text>
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>
          <View style={styles.compactPrice}>
            <Text style={styles.priceText}>
              {currency} {hourlyRate}/h
            </Text>
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
          <Text style={styles.name}>{name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.stars}>{renderStars(rating)}</Text>
            <Text style={styles.ratingText}>{rating}</Text>
            <Text style={styles.reviewText}>({reviewCount})</Text>
          </View>
          {availability && (
            <Text style={styles.availability}>{availability}</Text>
          )}
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {currency} {hourlyRate}/h
          </Text>
        </View>
      </View>

      {renderSpecialties()}

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          {distance && (
            <Text style={styles.distance}>📍 {distance}</Text>
          )}
          {vehicleType && (
            <Text style={styles.vehicleType}>
              🚗 {vehicleType === 'manual' ? 'Manual' : 'Automático'}
            </Text>
          )}
        </View>
        
        {onBookPress && (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={onBookPress}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Agendar</Text>
          </TouchableOpacity>
        )}
      </View>
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  headerInfo: {
    flex: 1,
  },
  compactInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  compactName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: theme.typography.fontSize.sm,
    marginRight: theme.spacing.xs,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.xs,
  },
  reviewText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  availability: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.semantic.success,
    fontWeight: theme.typography.fontWeight.medium,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  compactPrice: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.semantic.success,
  },
  priceText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.semantic.success,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  specialtyBadge: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borders.radius.full,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  specialtyText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  moreSpecialties: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flex: 1,
  },
  distance: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  vehicleType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  bookButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.md,
  },
  bookButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});