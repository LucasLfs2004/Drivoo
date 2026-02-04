import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/forms/FormInput';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../themes';
import type { AuthStackScreenProps } from '../../types/navigation';
import type { LoginCredentials } from '../../types/auth';

type Props = AuthStackScreenProps<'Login'>;

interface LoginFormData extends LoginCredentials {
  // Additional form-specific fields can be added here
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, carregando, error, clearError, loginAsAluno, loginAsInstrutor, loginAsAdmin } = useAuth();
  
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

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);
      reset();
    } catch (loginError) {
      const errorMessage = loginError instanceof Error ? loginError.message : 'Falha no login. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    }
  };

  const handleQuickLogin = async (loginFunction: () => Promise<void>, userType: string) => {
    try {
      clearError();
      await loginFunction();
    } catch (quickLoginError) {
      const errorMessage = quickLoginError instanceof Error ? quickLoginError.message : `Falha no login como ${userType}`;
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
      <View style={styles.content}>
        <Text style={styles.title}>Entrar no Drivoo</Text>
        <Text style={styles.subtitle}>
          Conecte-se com instrutores qualificados
        </Text>

        {/* Development Quick Login Section */}
        <View style={styles.devSection}>
          <Text style={styles.devTitle}>🚀 Acesso Rápido (Desenvolvimento)</Text>
          <View style={styles.devButtons}>
            <Button
              title="Entrar como Aluno"
              variant="outline"
              onPress={() => handleQuickLogin(loginAsAluno, 'aluno')}
              disabled={carregando}
              style={styles.devButton}
            />
            <Button
              title="Entrar como Instrutor"
              variant="outline"
              onPress={() => handleQuickLogin(loginAsInstrutor, 'instrutor')}
              disabled={carregando}
              style={styles.devButton}
            />
            <Button
              title="Entrar como Admin"
              variant="outline"
              onPress={() => handleQuickLogin(loginAsAdmin, 'admin')}
              disabled={carregando}
              style={styles.devButton}
            />
          </View>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
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
                placeholder="aluno@drivoo.com, instrutor@drivoo.com ou admin@drivoo.com"
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
                placeholder="123456"
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

        <View style={styles.credentialsInfo}>
          <Text style={styles.credentialsTitle}>Credenciais de Teste:</Text>
          <Text style={styles.credentialsText}>• aluno@drivoo.com / 123456</Text>
          <Text style={styles.credentialsText}>• instrutor@drivoo.com / 123456</Text>
          <Text style={styles.credentialsText}>• admin@drivoo.com / 123456</Text>
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
  },
  devSection: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.md,
    marginBottom: theme.spacing.lg,
  },
  devTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  devButtons: {
    gap: theme.spacing.sm,
  },
  devButton: {
    backgroundColor: theme.colors.background.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.medium,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE', // Light red background
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: '#C62828', // Dark red text
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
  credentialsInfo: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
  },
  credentialsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  credentialsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
  },
});