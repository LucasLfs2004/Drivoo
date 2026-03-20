import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNotificationContext } from '../../../contexts/NotificationContext';
import type { NotificationSettings } from '../types/domain';
import { colors, spacing, typography } from '../../../themes/variables';

export function NotificationSettingsScreen() {
  const {
    settings,
    permissions,
    loading,
    updateSettings,
    requestPermissions,
  } = useNotificationContext();

  const [localSettings, setLocalSettings] = useState<NotificationSettings>({
    enabled: true,
    bookingNotifications: true,
    chatNotifications: true,
    reminderNotifications: true,
    sound: true,
    vibration: true,
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (key === 'enabled' && value && !permissions?.granted) {
      const perms = await requestPermissions();
      if (!perms.granted) {
        Alert.alert(
          'Permissão Necessária',
          'Por favor, habilite as notificações nas configurações do dispositivo.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const previousSettings = localSettings;
    const nextSettings = { ...localSettings, [key]: value };
    setLocalSettings(nextSettings);

    try {
      await updateSettings(nextSettings);
    } catch {
      Alert.alert('Erro', 'Falha ao atualizar configurações');
      setLocalSettings(previousSettings);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <Text style={styles.sectionDescription}>
          Gerencie como você recebe notificações do Drivoo
        </Text>
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Habilitar Notificações</Text>
          <Text style={styles.settingDescription}>
            Ativar ou desativar todas as notificações
          </Text>
        </View>
        <Switch
          value={localSettings.enabled}
          onValueChange={value => handleToggle('enabled', value)}
          trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
          thumbColor={colors.neutral[50]}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionSubtitle}>Tipos de Notificação</Text>
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Agendamentos</Text>
          <Text style={styles.settingDescription}>
            Notificações sobre novas aulas e confirmações
          </Text>
        </View>
        <Switch
          value={localSettings.bookingNotifications}
          onValueChange={value => handleToggle('bookingNotifications', value)}
          disabled={!localSettings.enabled}
          trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
          thumbColor={colors.neutral[50]}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Mensagens</Text>
          <Text style={styles.settingDescription}>
            Notificações de novas mensagens no chat
          </Text>
        </View>
        <Switch
          value={localSettings.chatNotifications}
          onValueChange={value => handleToggle('chatNotifications', value)}
          disabled={!localSettings.enabled}
          trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
          thumbColor={colors.neutral[50]}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Lembretes</Text>
          <Text style={styles.settingDescription}>
            Lembretes antes das aulas agendadas
          </Text>
        </View>
        <Switch
          value={localSettings.reminderNotifications}
          onValueChange={value => handleToggle('reminderNotifications', value)}
          disabled={!localSettings.enabled}
          trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
          thumbColor={colors.neutral[50]}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionSubtitle}>Comportamento</Text>
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Som</Text>
          <Text style={styles.settingDescription}>
            Reproduzir som ao receber notificações
          </Text>
        </View>
        <Switch
          value={localSettings.sound}
          onValueChange={value => handleToggle('sound', value)}
          disabled={!localSettings.enabled}
          trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
          thumbColor={colors.neutral[50]}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Vibração</Text>
          <Text style={styles.settingDescription}>
            Vibrar ao receber notificações
          </Text>
        </View>
        <Switch
          value={localSettings.vibration}
          onValueChange={value => handleToggle('vibration', value)}
          disabled={!localSettings.enabled}
          trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
          thumbColor={colors.neutral[50]}
        />
      </View>

      {permissions && (
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>Status de Permissão</Text>
          <View style={styles.permissionStatus}>
            <Text style={styles.permissionText}>
              Status:{' '}
              <Text
                style={[
                  styles.permissionValue,
                  {
                    color: permissions.granted
                      ? colors.success[600]
                      : colors.semantic.error,
                  },
                ]}
              >
                {permissions.granted ? 'Concedida' : 'Negada'}
              </Text>
            </Text>
            {!permissions.granted && permissions.canAskAgain && (
              <TouchableOpacity style={styles.requestButton} onPress={requestPermissions}>
                <Text style={styles.requestButtonText}>Solicitar Permissão</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    color: colors.neutral[600],
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    color: colors.neutral[600],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[600],
  },
  permissionStatus: {
    backgroundColor: colors.neutral[0],
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  permissionText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    color: colors.neutral[700],
  },
  permissionValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  requestButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  requestButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
