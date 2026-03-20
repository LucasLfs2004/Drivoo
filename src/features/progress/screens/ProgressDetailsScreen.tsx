import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../../themes';
import { IconButton, Typography } from '../../../shared/ui/base';
import { EnhancedProgressCard } from '../components/EnhancedProgressCard';

export const ProgressDetailsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton icon={ArrowLeft} variant="ghost" onPress={() => navigation.goBack()} />
        <Typography variant="h3" weight="bold">
          Progresso Detalhado
        </Typography>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <EnhancedProgressCard />

        <View style={styles.infoSection}>
          <Typography variant="h4" weight="semibold" style={styles.infoTitle}>
            Sobre as Aulas Praticas
          </Typography>

          <View style={styles.infoCard}>
            <Typography variant="body" color="secondary">
              - Minimo de 2 aulas praticas sao necessarias para realizar o exame
            </Typography>
            <Typography variant="body" color="secondary">
              - Recomendamos 10 aulas para melhor preparacao
            </Typography>
            <Typography variant="body" color="secondary">
              - Voce pode fazer aulas nas categorias A e B simultaneamente
            </Typography>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: theme.borders.width.base,
    borderBottomColor: theme.colors.border.light,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  infoSection: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  infoTitle: {
    marginBottom: theme.spacing.xs,
  },
  infoCard: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.lg,
    gap: theme.spacing.sm,
  },
});
