import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { theme } from '../../themes';
import { AlunoProfileStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AlunoProfileStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  // Notification Settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);

  // Privacy Settings
  const [shareLocation, setShareLocation] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);

  // App Settings
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('pt-BR');

  const handleSaveSettings = () => {
    Alert.alert(
      'Configurações Salvas',
      'Suas preferências foram atualizadas com sucesso!'
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar Cache',
      'Isso irá remover dados temporários do aplicativo. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar limpeza de cache
            Alert.alert('Sucesso', 'Cache limpo com sucesso!');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Conta',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmação Final',
              'Digite "EXCLUIR" para confirmar a exclusão da conta.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Confirmar',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implementar exclusão de conta
                    console.log('Conta excluída');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurações</Text>
          <Text style={styles.headerSubtitle}>
            Personalize sua experiência no app
          </Text>
        </View>

        {/* Notifications */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Notificações</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notificações Push</Text>
              <Text style={styles.settingDescription}>
                Receba alertas sobre aulas e mensagens
              </Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[500],
              }}
              thumbColor={theme.colors.background.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notificações por Email</Text>
              <Text style={styles.settingDescription}>
                Receba atualizações importantes por email
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[500],
              }}
              thumbColor={theme.colors.background.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Lembretes de Aula</Text>
              <Text style={styles.settingDescription}>
                Receba lembretes antes das suas aulas
              </Text>
            </View>
            <Switch
              value={bookingReminders}
              onValueChange={setBookingReminders}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[500],
              }}
              thumbColor={theme.colors.background.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Emails Promocionais</Text>
              <Text style={styles.settingDescription}>
                Receba ofertas e novidades
              </Text>
            </View>
            <Switch
              value={promotionalEmails}
              onValueChange={setPromotionalEmails}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[500],
              }}
              thumbColor={theme.colors.background.primary}
            />
          </View>
        </Card>

        {/* Privacy */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Privacidade</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Compartilhar Localização</Text>
              <Text style={styles.settingDescription}>
                Permite que instrutores vejam sua localização
              </Text>
            </View>
            <Switch
              value={shareLocation}
              onValueChange={setShareLocation}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[500],
              }}
              thumbColor={theme.colors.background.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Perfil Visível</Text>
              <Text style={styles.settingDescription}>
                Seu perfil pode ser visto por instrutores
              </Text>
            </View>
            <Switch
              value={profileVisibility}
              onValueChange={setProfileVisibility}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[500],
              }}
              thumbColor={theme.colors.background.primary}
            />
          </View>
        </Card>

        {/* App Settings */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Aparência</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Modo Escuro</Text>
              <Text style={styles.settingDescription}>
                Em breve disponível
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled={true}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[500],
              }}
              thumbColor={theme.colors.background.primary}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Idioma</Text>
              <Text style={styles.settingDescription}>Português (Brasil)</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Data & Storage */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Dados e Armazenamento</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleClearCache}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Limpar Cache</Text>
              <Text style={styles.settingDescription}>
                Libere espaço removendo dados temporários
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Sobre</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Termos de Uso</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Política de Privacidade</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Versão do App</Text>
              <Text style={styles.settingDescription}>1.0.0</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Danger Zone */}
        <Card style={[styles.card, styles.dangerCard]}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>
            Zona de Perigo
          </Text>

          <Button
            title="Excluir Conta"
            variant="destructive"
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
          />
          <Text style={styles.dangerText}>
            Esta ação é irreversível e excluirá permanentemente todos os seus
            dados.
          </Text>
        </Card>

        {/* Save Button */}
        <Button
          title="Salvar Configurações"
          onPress={handleSaveSettings}
          style={styles.saveButton}
        />
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
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  chevron: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary,
  },
  dangerCard: {
    borderColor: theme.colors.semantic.error,
    borderWidth: 1,
  },
  dangerTitle: {
    color: theme.colors.semantic.error,
  },
  deleteButton: {
    marginBottom: theme.spacing.md,
  },
  dangerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  saveButton: {
    marginBottom: theme.spacing.xl,
  },
});
