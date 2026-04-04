import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { CarFront } from 'lucide-react-native';
import { Button } from '../../../shared/ui/base/Button';
import { FormInput } from '../../../shared/ui/forms';
import { useAuth } from '../../../core/auth';
import { theme } from '../../../theme';
import type { AuthStackScreenProps } from '../../../types/navigation';
import type { CreateAccountCredentials } from '../../../types/auth';

type Props = AuthStackScreenProps<'Register'>;

interface RegisterFormData extends CreateAccountCredentials {}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const {
    createAccount,
    carregando,
    error: contextError,
    needsOnboarding,
    isAuthenticated,
  } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  const senha = watch('senha');

  useEffect(() => {
    if (isAuthenticated && needsOnboarding) {
      navigation.replace('Onboarding');
    }
  }, [isAuthenticated, navigation, needsOnboarding]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await createAccount(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Falha ao criar conta. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    }
  };

  const validateEmail = (email: string): string | true => {
    if (!email) return 'Email é obrigatório';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? true : 'Email inválido';
  };

  const validatePassword = (password: string): string | true => {
    if (!password) return 'Senha é obrigatória';
    return password.length >= 6 ? true : 'Senha deve ter pelo menos 6 caracteres';
  };

  const validateConfirmPassword = (confirmarSenha: string): string | true => {
    if (!confirmarSenha) return 'Confirme sua senha';
    return confirmarSenha === senha ? true : 'As senhas não coincidem';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <View style={styles.logoBadge}>
            <CarFront size={22} color={theme.colors.primary[500]} strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>
            Use seu email e senha para começar. O restante do perfil será concluído no onboarding.
          </Text>
        </View>

        {contextError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{contextError}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Controller
            control={control}
            name="email"
            rules={{ validate: validateEmail }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="voce@email.com"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="senha"
            rules={{ validate: validatePassword }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                placeholder="Escolha uma senha"
                error={errors.senha?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmarSenha"
            rules={{ validate: validateConfirmPassword }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Confirmar senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                placeholder="Repita sua senha"
                error={errors.confirmarSenha?.message}
              />
            )}
          />

          <Button
            title={carregando ? 'Criando conta...' : 'Continuar'}
            onPress={handleSubmit(onSubmit)}
            disabled={carregando || !isValid}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta?</Text>
          <Button title="Entrar" variant="ghost" onPress={() => navigation.navigate('Login')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.coolGray[50],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: 28,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.coolGray[200],
    ...theme.shadows.md,
  },
  errorContainer: {
    backgroundColor: '#FFF1F0',
    borderRadius: theme.borders.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.semantic.error,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
  },
  submitButton: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  footerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
});
