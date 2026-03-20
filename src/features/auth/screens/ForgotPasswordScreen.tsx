import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../../shared/ui/base/Button';
import { FormInput } from '../../../components/forms/FormInput';
import { AuthApiService } from '../api/authApiService';
import { theme } from '../../../themes';
import type { AuthStackScreenProps } from '../../../types/navigation';
import type { ForgotPasswordRequest } from '../../../types/auth';

type Props = AuthStackScreenProps<'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<ForgotPasswordRequest>({
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordRequest) => {
    try {
      await AuthApiService.forgotPassword(data);
      reset();
      Alert.alert(
        'Email Enviado',
        'Instruções para redefinir sua senha foram enviadas para seu email.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Falha ao enviar email. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    }
  };

  const validateEmail = (email: string): string | true => {
    if (!email) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Esqueceu a Senha?</Text>
        <Text style={styles.subtitle}>
          Digite seu email para receber instruções de redefinição
        </Text>

        <View style={styles.form}>
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
                placeholder="seu@email.com"
                error={errors.email?.message}
              />
            )}
          />

          <Button
            title={isSubmitting ? 'Enviando...' : 'Enviar Instruções'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || !isValid}
            style={styles.resetButton}
          />
        </View>

        <View style={styles.footer}>
          <Button
            title="Voltar ao Login"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  resetButton: {
    marginTop: theme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
});
