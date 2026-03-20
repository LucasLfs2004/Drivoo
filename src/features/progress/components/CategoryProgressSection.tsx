import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bike, Car } from 'lucide-react-native';
import { theme } from '../../../theme';
import { Typography, Badge } from '../../../shared/ui/base';
import { LessonCounter } from './LessonCounter';

interface CategoryProgressSectionProps {
  category: 'A' | 'B';
  categoryLabel: string;
  completedLessons: number;
  isEditing: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleEdit: () => void;
  maxLessons?: number;
  recommendedLessons?: number;
  minimumLessons?: number;
}

const CategoryProgressSectionComponent: React.FC<CategoryProgressSectionProps> = ({
  category,
  categoryLabel,
  completedLessons,
  isEditing,
  onIncrement,
  onDecrement,
  onToggleEdit,
  maxLessons = 20,
  recommendedLessons = 10,
  minimumLessons = 2,
}) => {
  const percentage = Math.round((completedLessons / recommendedLessons) * 100);
  const hasReachedMinimum = completedLessons >= minimumLessons;
  const hasReachedRecommended = completedLessons >= recommendedLessons;

  const Icon = category === 'A' ? Bike : Car;
  const iconColor = theme.colors.primary[500];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon size={24} color={iconColor} />
          <Typography variant="h4" weight="semibold">
            {categoryLabel}
          </Typography>
        </View>

        <View style={styles.badgesRow}>
          {hasReachedMinimum && (
            <Badge variant="success" size="sm">
              Minimo Atingido
            </Badge>
          )}
          {hasReachedRecommended && (
            <Badge variant="primary" size="sm">
              Meta Recomendada
            </Badge>
          )}
        </View>
      </View>

      <View style={styles.counterSection}>
        <LessonCounter
          count={completedLessons}
          isEditing={isEditing}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onToggleEdit={onToggleEdit}
          maxLessons={maxLessons}
        />
        <Typography variant="caption" color="secondary" style={styles.recommendedText}>
          Recomendado: {recommendedLessons} aulas
        </Typography>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(percentage, 100)}%` },
            ]}
          />
        </View>
        <Typography variant="body" weight="medium" color="primary">
          {percentage}%
        </Typography>
      </View>

      {!hasReachedMinimum && (
        <Typography variant="caption" color="secondary" style={styles.minInfo}>
          Minimo de {minimumLessons} aulas para tirar a CNH
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  counterSection: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  recommendedText: {
    textAlign: 'center',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.coolGray[200],
    borderRadius: theme.borders.radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borders.radius.full,
  },
  minInfo: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export const CategoryProgressSection = React.memo(
  CategoryProgressSectionComponent,
  (prevProps, nextProps) =>
    prevProps.category === nextProps.category &&
    prevProps.categoryLabel === nextProps.categoryLabel &&
    prevProps.completedLessons === nextProps.completedLessons &&
    prevProps.isEditing === nextProps.isEditing
);
