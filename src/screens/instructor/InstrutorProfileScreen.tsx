import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../themes';

export const InstrutorProfileScreen: React.FC = ({ navigation }: any) => {
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditInstructorProfile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {usuario?.perfil?.primeiroNome?.[0]}{usuario?.perfil?.ultimoNome?.[0]}
            </Text>
          </View>
          <Text style={styles.name}>
            Instrutor {usuario?.perfil?.primeiroNome} {usuario?.perfil?.ultimoNome}
          </Text>
          <Text style={styles.email}>{usuario?.email}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ 0.0</Text>
            <Text style={styles.ratingText}>(0 avaliações)</Text>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informações Profissionais</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>DETRAN ID</Text>
            <Text style={styles.infoValue}>Não informado</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Licença</Text>
            <Text style={styles.infoValue}>Não informado</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Categorias</Text>
            <Text style={styles.infoValue}>A, B</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Valor/Hora</Text>
            <Text style={styles.infoValue}>R$ 0,00</Text>
          </View>
        </Card>

        <Card style={styles.vehicleCard}>
          <Text style={styles.sectionTitle}>Veículo</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Marca/Modelo</Text>
            <Text style={styles.infoValue}>Não informado</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ano</Text>
            <Text style={styles.infoValue}>--</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Transmissão</Text>
            <Text style={styles.infoValue}>Manual</Text>
          </View>
        </Card>

        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <Button
            title="Editar Perfil"
            variant="outline"
            onPress={handleEditProfile}
            style={styles.actionButton}
          />
          <Button
            title="Credenciais"
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Configurações"
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Ajuda e Suporte"
            variant="outline"
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
});