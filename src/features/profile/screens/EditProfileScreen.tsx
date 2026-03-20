import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { FormInput } from '../../../components/forms/FormInput';
import { useAuth } from '../../../core/auth';
import { theme } from '../../../themes';
import { AlunoProfileStackParamList } from '../../../types/navigation';
import type { Usuario } from '../../../types/auth';

type Props = NativeStackScreenProps<AlunoProfileStackParamList, 'EditProfile'>;

interface EditProfileFormData {
  primeiroNome: string;
  ultimoNome: string;
  telefone: string;
  email: string;
}

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { usuario, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      primeiroNome: usuario?.perfil?.primeiroNome || '',
      ultimoNome: usuario?.perfil?.ultimoNome || '',
      telefone: usuario?.telefone || '',
      email: usuario?.email || '',
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      setLoading(true);

      if (updateProfile) {
        await updateProfile({
          perfil: {
            ...usuario?.perfil,
            primeiroNome: data.primeiroNome,
            ultimoNome: data.ultimoNome,
          } as Usuario['perfil'],
          telefone: data.telefone,
          email: data.email,
        });
      }

      Alert.alert('Sucesso', 'Seu perfil foi atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar seu perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isDirty) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Descartar Alterações',
      'Você tem alterações não salvas. Deseja descartá-las?',
      [
        { text: 'Continuar Editando', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() },
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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <Text style={styles.headerSubtitle}>
            Atualize suas informações pessoais
          </Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {usuario?.perfil?.primeiroNome?.[0]}
              {usuario?.perfil?.ultimoNome?.[0]}
            </Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Alterar Foto</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <Controller
            control={control}
            name="primeiroNome"
            rules={{
              required: 'Nome é obrigatório',
              minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
            }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Primeiro Nome"
                value={value}
                onChangeText={onChange}
                error={errors.primeiroNome?.message}
                placeholder="Digite seu primeiro nome"
              />
            )}
          />

          <Controller
            control={control}
            name="ultimoNome"
            rules={{
              required: 'Sobrenome é obrigatório',
              minLength: {
                value: 2,
                message: 'Sobrenome deve ter pelo menos 2 caracteres',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Sobrenome"
                value={value}
                onChangeText={onChange}
                error={errors.ultimoNome?.message}
                placeholder="Digite seu sobrenome"
              />
            )}
          />

          <Controller
            control={control}
            name="telefone"
            rules={{
              required: 'Telefone é obrigatório',
              pattern: {
                value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
                message: 'Formato inválido. Use (11) 98765-4321',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Telefone"
                value={value}
                onChangeText={onChange}
                error={errors.telefone?.message}
                placeholder="(11) 98765-4321"
                keyboardType="phone-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Email"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={handleCancel}
            disabled={loading}
            style={styles.cancelButton}
          />
          <Button
            title={loading ? 'Salvando...' : 'Salvar Alterações'}
            onPress={handleSubmit(onSubmit)}
            disabled={loading || !isDirty}
            style={styles.saveButton}
          />
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
  avatarSection: {
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
  changePhotoButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  changePhotoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  formCard: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  actionsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  cancelButton: {
    marginBottom: theme.spacing.sm,
  },
  saveButton: {
    marginBottom: theme.spacing.md,
  },
});
