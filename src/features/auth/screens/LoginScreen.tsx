import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../../shared/ui/base/Button';
import { FormInput } from '../../../components/forms/FormInput';
import { useAuth } from '../../../core/auth';
import { theme } from '../../../themes';
import type { AuthStackScreenProps } from '../../../types/navigation';
import type { LoginCredentials } from '../../../types/auth';

type Props = AuthStackScreenProps<'Login'>;

interface LoginFormData extends LoginCredentials {}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login: contextLogin, carregando, error: contextError, usuario } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!usuario) return;

    if (usuario.papel === 'aluno') {
      navigation.navigate('AlunoTabs' as any);
    } else if (usuario.papel === 'instrutor') {
      navigation.navigate('InstrutorTabs' as any);
    } else if (usuario.papel === 'admin') {
      navigation.navigate('AdminDrawer' as any);
    }
    reset();
  }, [usuario, navigation, reset]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await contextLogin(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Falha no login. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    }
  };

  const validateEmail = (email: string): string | true => {
    if (!email) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    return true;
  };

  const validatePassword = (password: string): string | true => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Entrar no Drivoo</Text>
          <Text style={styles.subtitle}>Conecte-se com instrutores qualificados</Text>

          {contextError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{contextError}</Text>
            </View>
          )}

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
                  placeholder="Email"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{ validate: validatePassword }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  placeholder="Senha"
                  error={errors.password?.message}
                />
              )}
            />

            <Button
              title={carregando ? 'Entrando...' : 'Entrar'}
              onPress={handleSubmit(onSubmit)}
              disabled={carregando || !isValid}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.footer}>
            <Button
              title="Esqueceu a senha?"
              variant="ghost"
              onPress={() => navigation.navigate('ForgotPassword')}
            />

            <Button
              title="Criar conta"
              variant="outline"
              onPress={() => navigation.navigate('Register', {})}
              style={styles.registerButton}
            />
          </View>
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
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: '#C62828',
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  loginButton: {
    marginTop: theme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  registerButton: {
    width: '100%',
  },
});
