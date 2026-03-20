import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RefreshCw } from 'lucide-react-native';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { useAuth } from '../../../core/auth';
import { theme } from '../../../themes';
import { AlunoProfileStackParamList } from '../../../types/navigation';
import { useUserQuery } from '../hooks/useUserQuery';

type Props = NativeStackScreenProps<AlunoProfileStackParamList, 'ProfileScreen'>;

export const AlunoProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { logout, usuario } = useAuth();
  const { data: user, isLoading, error, refetch } = useUserQuery();

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (logoutError) {
            console.error('Logout failed:', logoutError);
            Alert.alert('Erro', 'Falha ao fazer logout. Tente novamente.');
          }
        },
      },
    ]);
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return (parts[0]?.[0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erro ao carregar perfil</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <Button
            title="Tentar Novamente"
            variant="primary"
            onPress={() => refetch()}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      icon: '👤',
      title: 'Editar Perfil',
      description: 'Atualize suas informações pessoais',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: '⚙️',
      title: 'Configurações',
      description: 'Notificações, privacidade e mais',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: '📚',
      title: 'Minhas Aulas',
      description: 'Histórico e aulas agendadas',
      onPress: () => {
        Alert.alert('Info', 'Navegue para a aba "Aulas" para ver seus agendamentos');
      },
    },
    {
      icon: '💳',
      title: 'Pagamentos',
      description: 'Métodos de pagamento e histórico',
      onPress: () => {
        Alert.alert('Em Breve', 'Funcionalidade de pagamentos em desenvolvimento');
      },
    },
    {
      icon: '❓',
      title: 'Ajuda e Suporte',
      description: 'Central de ajuda e contato',
      onPress: () => {
        Alert.alert('Suporte', 'Entre em contato: suporte@drivoo.com.br');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(
                  [user?.perfil?.primeiroNome, user?.perfil?.ultimoNome]
                    .filter(Boolean)
                    .join(' ')
                )}
              </Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()}>
              <RefreshCw size={20} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>
            {[user?.perfil?.primeiroNome, user?.perfil?.ultimoNome]
              .filter(Boolean)
              .join(' ') || 'Usuário'}
          </Text>
          <Text style={styles.email}>{user?.email || usuario?.email}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Aulas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Horas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Progresso</Text>
            </View>
          </View>
        </Card>

        <View style={styles.menuSection}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.title}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Sair da Conta"
          variant="destructive"
          onPress={handleLogout}
          style={styles.logoutButton}
        />

        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.semantic.error,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  refreshButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: theme.spacing.sm,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.background.secondary,
  },
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  editButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.primary[50],
  },
  editButtonText: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
  },
  statsCard: {
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statLabel: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.border.medium,
  },
  menuSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.lg,
    padding: theme.spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    marginRight: theme.spacing.md,
  },
  menuIconText: {
    fontSize: theme.typography.fontSize.lg,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  menuDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  menuChevron: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary,
  },
  logoutButton: {
    marginBottom: theme.spacing.md,
  },
  versionText: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
});
