import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Typography } from '../../../shared/ui/base';
import { theme } from '../../../theme';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  unlocked: boolean;
}

interface AchievementsCardProps {
  achievements: Achievement[];
}

const AchievementBadge: React.FC<Achievement> = ({ icon, title, unlocked }) => {
  return (
    <View style={[styles.badge, !unlocked && styles.badgeLocked]}>
      <View style={styles.badgeIcon}>
        <Typography variant="h2">{icon}</Typography>
      </View>
      <Typography
        variant="caption"
        color={unlocked ? 'primary' : 'tertiary'}
        align="center"
        style={styles.badgeTitle}
      >
        {title}
      </Typography>
    </View>
  );
};

export const AchievementsCard: React.FC<AchievementsCardProps> = ({
  achievements,
}) => {
  return (
    <Card variant="elevated" padding="md" style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h4">🏆 Conquistas</Typography>
        <Typography variant="caption" color="secondary">
          {achievements.filter((achievement) => achievement.unlocked).length}/{achievements.length}
        </Typography>
      </View>

      <View style={styles.badgeRow}>
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} {...achievement} />
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  badge: {
    alignItems: 'center',
    width: theme.scaleUtils.moderateScale(80),
  },
  badgeLocked: {
    opacity: 0.4,
  },
  badgeIcon: {
    width: theme.scaleUtils.moderateScale(64),
    height: theme.scaleUtils.moderateScale(64),
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    borderWidth: theme.borders.width.thick,
    borderColor: theme.colors.primary[200],
  },
  badgeTitle: {
    fontSize: theme.typography.fontSize.xs,
  },
});
