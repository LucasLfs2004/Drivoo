import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { useAuth } from '../../../core/auth';
import { theme } from '../../../theme';
import {
  useInstructorVehiclesQuery,
  useMyInstructorProfileQuery,
} from '../../instructors';

interface NavigationLike {
  navigate: (screen: string) => void;
}

interface Props {
  navigation: NavigationLike;
}

export const InstrutorProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { usuario, logout } = useAuth();
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: hasProfileError,
  } = useMyInstructorProfileQuery();
  const { data: vehicles = [] } = useInstructorVehiclesQuery();

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const primaryVehicle = vehicles.find(vehicle => vehicle.ativo) ?? vehicles[0];
  const initials = profile
    ? `${profile.primeiroNome[0] ?? ''}${profile.ultimoNome[0] ?? ''}`.toUpperCase()
    : `${usuario?.perfil?.primeiroNome?.[0] ?? ''}${usuario?.perfil?.ultimoNome?.[0] ?? ''}`;

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Carregando perfil do instrutor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasProfileError || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Nao foi possivel carregar o perfil do instrutor.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>
            Instrutor {profile.primeiroNome} {profile.ultimoNome}
          </Text>
          <Text style={styles.email}>{usuario?.email}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>
              ⭐ {profile.avaliacoes.media.toFixed(1)}
            </Text>
            <Text style={styles.ratingText}>
              ({profile.avaliacoes.quantidade} avaliações)
            </Text>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informações Profissionais</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Categorias</Text>
            <Text style={styles.infoValue}>
              {profile.categorias.length > 0 ? profile.categorias.join(', ') : 'Nao informado'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Experiência</Text>
            <Text style={styles.infoValue}>
              {profile.experienciaAnos} ano{profile.experienciaAnos === 1 ? '' : 's'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Valor/Hora</Text>
            <Text style={styles.infoValue}>
              R$ {profile.precos.valorHora.toFixed(2)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Gênero</Text>
            <Text style={styles.infoValue}>
              {profile.genero === 'feminino'
                ? 'Feminino'
                : profile.genero === 'masculino'
                  ? 'Masculino'
                  : profile.genero === 'outro'
                    ? 'Outro'
                    : 'Nao informado'}
            </Text>
          </View>
          <View style={[styles.infoItem, styles.infoItemStacked]}>
            <Text style={styles.infoLabel}>Bio</Text>
            <Text style={[styles.infoValue, styles.infoValueStacked]}>
              {profile.bio?.trim() ? profile.bio : 'Nenhuma bio cadastrada.'}
            </Text>
          </View>
          <View style={[styles.infoItem, styles.infoItemStacked]}>
            <Text style={styles.infoLabel}>Especialidades</Text>
            <Text style={[styles.infoValue, styles.infoValueStacked]}>
              {profile.especialidades.length > 0
                ? profile.especialidades.join(', ')
                : 'Nenhuma especialidade cadastrada.'}
            </Text>
          </View>
        </Card>

        <Card style={styles.vehicleCard}>
          <Text style={styles.sectionTitle}>Veículo</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Modelo</Text>
            <Text style={styles.infoValue}>
              {primaryVehicle?.modelo || profile.veiculo.modelo || 'Nao informado'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ano</Text>
            <Text style={styles.infoValue}>
              {primaryVehicle?.ano || profile.veiculo.ano || '--'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Transmissão</Text>
            <Text style={styles.infoValue}>
              {(primaryVehicle?.transmissao || profile.veiculo.transmissao) === 'automatico'
                ? 'Automático'
                : 'Manual'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Placa</Text>
            <Text style={styles.infoValue}>{primaryVehicle?.placa || 'Nao informada'}</Text>
          </View>
        </Card>

        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <Button
            title="Editar Perfil"
            variant="outline"
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.actionButton}
          />
          <Button
            title="Credenciais"
            variant="outline"
            onPress={() =>
              Alert.alert(
                'Credenciais',
                'A tela de credenciais ainda não existe no app.'
              )
            }
            style={styles.actionButton}
          />
          <Button
            title="Configurações"
            variant="outline"
            onPress={() => navigation.navigate('Settings')}
            style={styles.actionButton}
          />
          <Button
            title="Ajuda e Suporte"
            variant="outline"
            onPress={() => navigation.navigate('Support')}
            style={styles.actionButton}
          />
          <Button
            title="Sair"
            variant="destructive"
            onPress={handleLogout}
            style={styles.actionButton}
          />
        </Card>
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
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  rating: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  vehicleCard: {
    marginBottom: theme.spacing.lg,
  },
  actionsCard: {
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    marginBottom: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.semantic.error,
    textAlign: 'center',
  },
  infoItemStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  infoValueStacked: {
    width: '100%',
    textAlign: 'left',
  },
});
