import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { useAuth } from '../../../core/auth';
import { theme } from '../../../theme';

export const AdminSettingsScreen: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta de administrador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>
            Configurações da plataforma
          </Text>
        </View>

        <Card style={styles.systemCard}>
          <Text style={styles.sectionTitle}>Sistema</Text>
          <Button
            title="Configurações Gerais"
            variant="outline"
            style={styles.settingButton}
          />
          <Button
            title="Configurações de Pagamento"
            variant="outline"
            style={styles.settingButton}
          />
          <Button
            title="Notificações"
            variant="outline"
            style={styles.settingButton}
          />
        </Card>

        <Card style={styles.platformCard}>
          <Text style={styles.sectionTitle}>Plataforma</Text>
          <Button
            title="Taxas e Comissões"
            variant="outline"
            style={styles.settingButton}
          />
          <Button
            title="Políticas"
            variant="outline"
            style={styles.settingButton}
          />
          <Button
            title="Termos de Uso"
            variant="outline"
            style={styles.settingButton}
          />
        </Card>

        <Card style={styles.accountCard}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <Button
            title="Perfil do Administrador"
            variant="outline"
            style={styles.settingButton}
          />
          <Button
            title="Segurança"
            variant="outline"
            style={styles.settingButton}
          />
          <Button
            title="Sair"
            variant="destructive"
            onPress={handleLogout}
            style={styles.settingButton}
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
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  systemCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  platformCard: {
    marginBottom: theme.spacing.lg,
  },
  accountCard: {
    marginBottom: theme.spacing.lg,
  },
  settingButton: {
    marginBottom: theme.spacing.sm,
  },
});