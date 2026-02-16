import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Typography } from '../../components/common/Typography';
import {
  ProgressCard,
  EnhancedLessonCard,
  TipCard,
  AchievementsCard
} from '../../components/display';
import { theme } from '../../themes';
import ClassCard from "../../components/class/classCard";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AlunoHomeStackParamList } from '../../types/navigation';
import Header from '@/components/shared/header';

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

  const handleScheduleLessonPress = () => {
    navigation.getParent()?.navigate('Search');
  };

  const handleClassCardPress = () => {
    navigation.navigate('InstructorDetails', { instructorId: '1' });
  };

  const handleMyLessonsPress = () => {
    navigation.getParent()?.navigate('Bookings');
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView style={styles.content}>
        <Header />

        {/* NOVO: Progresso da CNH */}
        <ProgressCard
          completedLessons={12}
          totalLessons={20}
          practiceHours={18}
          category="Categoria B"
        />

        {/* NOVO: Próxima Aula - Versão Melhorada */}
        <Typography variant="h3" style={styles.sectionHeader}>
          📅 Próxima Aula (Nova Versão)
        </Typography>
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
          onViewDetails={handleClassCardPress}
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

        {/* NOVO: Dica do Dia */}
        <TipCard
          tip="Lembre-se de verificar os espelhos antes de mudar de faixa. Essa é uma das principais causas de reprovação no exame prático!"
          onViewMore={() => console.log('Ver mais dicas')}
        />

        {/* NOVO: Conquistas */}
        <AchievementsCard
          achievements={[
            { id: '1', icon: '🎯', title: 'Primeira Aula', unlocked: true },
            { id: '2', icon: '🔥', title: '5 Aulas Seguidas', unlocked: true },
            { id: '3', icon: '⭐', title: 'Nota Máxima', unlocked: false },
            { id: '4', icon: '🏆', title: '10 Aulas', unlocked: false },
          ]}
        />

        {/* ANTIGO: Próxima Aula - Versão Original (para comparação) */}
        <Typography variant="h3" style={styles.sectionHeader}>
          📅 Próxima Aula (Versão Antiga)
        </Typography>
        <Card variant='filled' style={styles.nextLesson}>
          <Text style={styles.sectionTitle}>Próxima Aula</Text>
          <ClassCard onPress={handleClassCardPress} />
          <ClassCard onPress={handleClassCardPress} />
          <Button
            title="Agendar Aula"
            variant="primary"
            size="sm"
            style={styles.scheduleButton}
            onPress={handleScheduleLessonPress}
          />
        </Card>

        <Card style={styles.developmentCard}>
          <Text style={styles.sectionTitle}>🎨 Desenvolvimento</Text>
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

        <Card style={styles.progress}>
          <Text style={styles.sectionTitle}>Seu Progresso (Antigo)</Text>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Aulas Concluídas</Text>
            <Text style={styles.progressValue}>0</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Horas de Prática</Text>
            <Text style={styles.progressValue}>0h</Text>
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
  sectionHeader: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  quickActions: {
    marginBottom: theme.spacing.lg,
  },
  developmentCard: {
    marginBottom: theme.spacing.lg,
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
  nextLesson: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing.md
  },
  scheduleButton: {
    alignSelf: 'center',
  },
  progress: {
    marginBottom: theme.spacing.lg,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  progressLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  progressValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[500],
  },
});
