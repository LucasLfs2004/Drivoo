import { useAuth } from '@/core/auth';
import theme from '@/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../../shared/ui/base';

interface HomeHeaderProps {
  subtitle?: string;
  navigation: NativeStackNavigationProp<any>;
}

export const HomeHeader = ({
  subtitle = 'Pronto para sua próxima aula?',
  navigation,
}: HomeHeaderProps) => {
  const { usuario } = useAuth();
  return (
    <View style={styles.header}>
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Olá, {usuario?.perfil?.primeiroNome}!</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View>
        <Avatar onPress={() => navigation.navigate('Profile')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  greeting: {
    flex: 1,
    minWidth: 0,
    rowGap: theme.spacing.xs,
  },
  greetingText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  quickActions: {
    marginBottom: theme.spacing.lg,
  },
});
