import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Vibration } from 'react-native';
import { theme } from '../../../theme';
import { Card, Typography, Divider } from '../../../shared/ui/base';
import { CategoryProgressSection } from './CategoryProgressSection';
import { loadProgress, saveProgress } from '../../../services/progressStorage';
import { debounceAsync } from '../../../utils/debounce';

interface ProgressState {
  categoryA: {
    completedLessons: number;
    isEditing: boolean;
  };
  categoryB: {
    completedLessons: number;
    isEditing: boolean;
  };
  isLoading: boolean;
  error: string | null;
}

const RECOMMENDED_LESSONS = 10;
const MINIMUM_LESSONS = 2;
const MAX_LESSONS = 20;
const DEBOUNCE_DELAY = 300;
const HAPTIC_FEEDBACK_DURATION = 50;

export const EnhancedProgressCard: React.FC = () => {
  const [state, setState] = useState<ProgressState>({
    categoryA: { completedLessons: 0, isEditing: false },
    categoryB: { completedLessons: 0, isEditing: false },
    isLoading: true,
    error: null,
  });

  const pendingSavesRef = useRef<{ categoryA?: number; categoryB?: number }>({});

  const debouncedSaveA = useRef(
    debounceAsync(async (lessons: number) => {
      await saveProgress('A', lessons);
      delete pendingSavesRef.current.categoryA;
    }, DEBOUNCE_DELAY)
  ).current;

  const debouncedSaveB = useRef(
    debounceAsync(async (lessons: number) => {
      await saveProgress('B', lessons);
      delete pendingSavesRef.current.categoryB;
    }, DEBOUNCE_DELAY)
  ).current;

  const triggerHapticFeedback = useCallback(() => {
    try {
      Vibration.vibrate(HAPTIC_FEEDBACK_DURATION);
    } catch (error) {
      console.debug('Haptic feedback not available:', error);
    }
  }, []);

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const data = await loadProgress();
        setState(prev => ({
          ...prev,
          categoryA: { ...prev.categoryA, completedLessons: data.categoryA },
          categoryB: { ...prev.categoryB, completedLessons: data.categoryB },
          isLoading: false,
        }));
      } catch (error) {
        console.error('Failed to load progress:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erro ao carregar progresso',
        }));
      }
    };

    loadProgressData();
  }, []);

  const handleIncrement = async (category: 'A' | 'B') => {
    const categoryKey = category === 'A' ? 'categoryA' : 'categoryB';
    const currentLessons = state[categoryKey].completedLessons;
    if (currentLessons >= MAX_LESSONS) return;

    const newLessons = currentLessons + 1;
    triggerHapticFeedback();

    setState(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], completedLessons: newLessons },
    }));

    pendingSavesRef.current[categoryKey] = newLessons;

    try {
      if (category === 'A') {
        await debouncedSaveA(newLessons);
      } else {
        await debouncedSaveB(newLessons);
      }
    } catch (err) {
      console.error('Failed to save increment:', err);
      setState(prev => ({
        ...prev,
        [categoryKey]: { ...prev[categoryKey], completedLessons: currentLessons },
      }));
    }
  };

  const handleDecrement = async (category: 'A' | 'B') => {
    const categoryKey = category === 'A' ? 'categoryA' : 'categoryB';
    const currentLessons = state[categoryKey].completedLessons;
    if (currentLessons <= 0) return;

    const newLessons = currentLessons - 1;
    triggerHapticFeedback();

    setState(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], completedLessons: newLessons },
    }));

    pendingSavesRef.current[categoryKey] = newLessons;

    try {
      if (category === 'A') {
        await debouncedSaveA(newLessons);
      } else {
        await debouncedSaveB(newLessons);
      }
    } catch (err) {
      console.error('Failed to save decrement:', err);
      setState(prev => ({
        ...prev,
        [categoryKey]: { ...prev[categoryKey], completedLessons: currentLessons },
      }));
    }
  };

  const handleToggleEdit = (category: 'A' | 'B') => {
    const categoryKey = category === 'A' ? 'categoryA' : 'categoryB';
    setState(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], isEditing: !prev[categoryKey].isEditing },
    }));
  };

  if (state.isLoading) {
    return (
      <Card variant="elevated" padding="lg">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Typography variant="body" color="secondary">
            Carregando progresso...
          </Typography>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <View style={styles.container}>
        <Typography variant="h3" weight="bold" style={styles.title}>
          Meu Progresso
        </Typography>

        <Typography variant="caption" color="secondary" style={styles.subtitle}>
          Acompanhe suas aulas praticas
        </Typography>

        <Divider spacing="md" />

        <CategoryProgressSection
          category="A"
          categoryLabel="Categoria A - Moto"
          completedLessons={state.categoryA.completedLessons}
          isEditing={state.categoryA.isEditing}
          onIncrement={() => handleIncrement('A')}
          onDecrement={() => handleDecrement('A')}
          onToggleEdit={() => handleToggleEdit('A')}
          maxLessons={MAX_LESSONS}
          recommendedLessons={RECOMMENDED_LESSONS}
          minimumLessons={MINIMUM_LESSONS}
        />

        <Divider spacing="md" />

        <CategoryProgressSection
          category="B"
          categoryLabel="Categoria B - Carro"
          completedLessons={state.categoryB.completedLessons}
          isEditing={state.categoryB.isEditing}
          onIncrement={() => handleIncrement('B')}
          onDecrement={() => handleDecrement('B')}
          onToggleEdit={() => handleToggleEdit('B')}
          maxLessons={MAX_LESSONS}
          recommendedLessons={RECOMMENDED_LESSONS}
          minimumLessons={MINIMUM_LESSONS}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});
