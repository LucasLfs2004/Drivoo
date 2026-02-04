import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../themes';
import ClassCard from "../../components/class/classCard";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AlunoHomeStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<AlunoHomeStackParamList>;

export const AlunoHomeScreen: React.FC = () => {
  const { usuario } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleShowcasePress = () => {
    navigation.navigate('ComponentShowcase');
  };

  const handleSearchInstructorsPress = () => {
    // Navigate to search tab
    navigation.getParent()?.navigate('Search');
  };

  const handleScheduleLessonPress = () => {
    // Navigate to search tab
    navigation.getParent()?.navigate('Search');
  };

  const handleClassCardPress = () => {
    // Navigate to instructor details - using a mock instructor ID
    navigation.navigate('InstructorDetails', { instructorId: '1' });
  };

  const handleMyLessonsPress = () => {
    // Navigate to bookings tab
    navigation.getParent()?.navigate('Bookings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, {usuario?.perfil?.primeiroNome}! 👋
          </Text>
          <Text style={styles.subtitle}>
            Pronto para sua próxima aula?
          </Text>
        </View>

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

        <Card style={styles.developmentCard}>
          <Text style={styles.sectionTitle}>🎨 Desenvolvimento</Text>
          <Text style={styles.developmentText}>
            Visualize todos os componentes UI criados
          </Text>
          <Button
            title="Ver Componentes"
            variant="secondary"
            onPress={handleShowcasePress}
            style={styles.showcaseButton}
          />
        </Card>

        <Card style={styles.nextLesson}>
          <Text style={styles.sectionTitle}>Próxima Aula</Text>
          <ClassCard onPress={handleClassCardPress} />
          <Text style={styles.noLessons}>
            Você não tem aulas agendadas
          </Text>
          <Button
            title="Agendar Aula"
            variant="primary"
            size="sm"
            style={styles.scheduleButton}
            onPress={handleScheduleLessonPress}
          />
        </Card>

        <Card style={styles.progress}>
          <Text style={styles.sectionTitle}>Seu Progresso</Text>
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
    // backgroundColor: theme.colors.background.primary,
    backgroundColor: "#E6ECEF",
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
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
  showcaseButton: {
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  nextLesson: {
    marginBottom: theme.spacing.lg,
  },
  noLessons: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
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