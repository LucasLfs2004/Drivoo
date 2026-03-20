import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '@/components/shared/header';
import { Button, Card } from '../../../shared/ui/base';
import { CompactProgressCard } from '../../../features/progress';
import { theme } from '../../../themes';
import type { AlunoHomeStackParamList } from '../../../types/navigation';
import { AchievementsCard } from '../components/AchievementsCard';
import { EnhancedLessonCard } from '../components/EnhancedLessonCard';
import { TipCard } from '../components/TipCard';

type NavigationProp = NativeStackNavigationProp<AlunoHomeStackParamList>;

export const AlunoHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleShowcasePress = () => {
    navigation.navigate('ComponentShowcase');
  };

  const handleDesignSystemPress = () => {
    navigation.navigate('DesignSystem');
  };

  const handleSearchInstructorsPress = () => {
    navigation.getParent()?.navigate('Search');
  };

  const handleMyLessonsPress = () => {
    navigation.getParent()?.navigate('Bookings');
  };

  const handleProgressPress = () => {
    navigation.navigate('ProgressDetails');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.content}>
        <Header />

        <CompactProgressCard onPress={handleProgressPress} />

        <EnhancedLessonCard
          instructorName="Ricardo Silva"
          rating={4.8}
          totalLessons={150}
          date="02/03"
          time="10:00"
          location="Avenida Belmira Marin, 123"
          lessonType="Aula Prática"
          status="confirmed"
          onViewRoute={() => console.log('Ver rota')}
          onViewDetails={() => navigation.navigate('InstructorDetails', { instructorId: '1' })}
        />

        <Card style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionButtons}>
            <Button
              title="Buscar Instrutores"
              variant="primary"
              style={styles.actionButton}
              onPress={handleSearchInstructorsPress}
            />
            <Button
              title="Minhas Aulas"
              variant="outline"
              style={styles.actionButton}
              onPress={handleMyLessonsPress}
            />
          </View>
        </Card>

        <TipCard
          tip="Lembre-se de verificar os espelhos antes de mudar de faixa. Essa é uma das principais causas de reprovação no exame prático!"
          onViewMore={() => console.log('Ver mais dicas')}
        />

        <AchievementsCard
          achievements={[
            { id: '1', icon: '🎯', title: 'Primeira Aula', unlocked: true },
            { id: '2', icon: '🔥', title: '5 Aulas Seguidas', unlocked: true },
            { id: '3', icon: '⭐', title: 'Nota Máxima', unlocked: false },
            { id: '4', icon: '🏆', title: '10 Aulas', unlocked: false },
          ]}
        />

        <Card style={styles.developmentCard}>
          <Text style={styles.sectionTitle}>🎨 Design System</Text>
          <Text style={styles.developmentText}>
            Visualize todos os componentes UI criados
          </Text>
          <View style={styles.devButtons}>
            <Button
              title="Ver Componentes"
              variant="secondary"
              onPress={handleShowcasePress}
              style={styles.devButton}
            />
            <Button
              title="Design System"
              variant="outline"
              onPress={handleDesignSystemPress}
              style={styles.devButton}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  quickActions: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  developmentCard: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.accent[50],
    borderColor: theme.colors.accent[200],
    borderWidth: 1,
  },
  developmentText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  devButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  devButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
