import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RefreshCw } from 'lucide-react-native';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useUserQuery } from '../../services/queries/useUserQuery';
import { theme } from '../../themes';
import { AlunoProfileStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AlunoProfileStackParamList, 'ProfileScreen'>;

export const AlunoProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const { data: user, isLoading, error, refetch } = useUserQuery();

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled automatically by RootNavigator
              // when isAuthenticated becomes false
            } catch (logoutError) {
              console.error('Logout failed:', logoutError);
              Alert.alert('Erro', 'Falha ao fazer logout. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  // Extract initials from user name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return (parts[0]?.[0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  // Show loading state
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

  // Show error state
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
        // Navigate to bookings tab
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
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(user?.name)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => refetch()}
            >
              <RefreshCw
                size={20}
                color={theme.colors.primary[500]}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>
            {user?.name || 'Usuário'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
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

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
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

        {/* Logout Button */}
        <Button
          title="Sair da Conta"
          variant="destructive"
          onPress={handleLogout}
          style={styles.logoutButton}
        />

        {/* App Version */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  refreshButton: {
    position: 'absolute',
    right: 0,
    padding: theme.spacing.sm,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.background.secondary,
    ...theme.shadows.sm,
  },
  avatarText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
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
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.primary[50],
  },
  editButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
  },
  statsCard: {
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border.light,
  },
  menuSection: {
    marginBottom: theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.elevated,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borders.radius.md,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuIconText: {
    fontSize: 24,
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
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  logoutButton: {
    marginBottom: theme.spacing.lg,
  },
  versionText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
});