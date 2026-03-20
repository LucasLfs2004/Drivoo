import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '../../../theme';
import { Card, Typography } from '../../../shared/ui/base';
import { loadProgress } from '../../../services/progressStorage';

interface CompactProgressCardProps {
  onPress: () => void;
}

const RECOMMENDED_LESSONS = 10;

export const CompactProgressCard: React.FC<CompactProgressCardProps> = ({ onPress }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [categoryA, setCategoryA] = useState(0);
  const [categoryB, setCategoryB] = useState(0);

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const data = await loadProgress();
        setCategoryA(data.categoryA);
        setCategoryB(data.categoryB);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgressData();
  }, []);

  const percentageA = Math.round((categoryA / RECOMMENDED_LESSONS) * 100);
  const percentageB = Math.round((categoryB / RECOMMENDED_LESSONS) * 100);

  if (isLoading) {
    return (
      <Card variant="elevated" padding="md">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary[500]} />
        </View>
      </Card>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" padding="md">
        <View style={styles.container}>
          <View style={styles.header}>
            <Typography variant="h4" weight="semibold">
              Meu Progresso
            </Typography>
            <ChevronRight size={20} color={theme.colors.text.secondary} />
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Typography variant="caption" color="secondary">
                  Categoria A
                </Typography>
                <Typography variant="body" weight="medium">
                  {categoryA}/{RECOMMENDED_LESSONS} aulas
                </Typography>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(percentageA, 100)}%` },
                    ]}
                  />
                </View>
                <Typography variant="caption" weight="medium" color="primary">
                  {percentageA}%
                </Typography>
              </View>
            </View>

            <View style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Typography variant="caption" color="secondary">
                  Categoria B
                </Typography>
                <Typography variant="body" weight="medium">
                  {categoryB}/{RECOMMENDED_LESSONS} aulas
                </Typography>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(percentageB, 100)}%` },
                    ]}
                  />
                </View>
                <Typography variant="caption" weight="medium" color="primary">
                  {percentageB}%
                </Typography>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    gap: theme.spacing.sm,
  },
  categoryRow: {
    gap: theme.spacing.xs,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.coolGray[200],
    borderRadius: theme.borders.radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borders.radius.full,
  },
});
