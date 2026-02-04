import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/forms/FormInput';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../themes';
import type { AuthStackScreenProps } from '../../types/navigation';
import type { 
  RegisterData, 
  RegisterDataAluno, 
  RegisterDataInstrutor, 
  UserRole 
} from '../../types/auth';

type Props = AuthStackScreenProps<'Register'>;

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  telefone: string;
  primeiroNome: string;
  ultimoNome: string;
  // Aluno specific fields
  dataNascimento?: string;
  endereco?: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  // Instrutor specific fields
  detranId?: string;
  licencaNumero?: string;
  veiculoMarca?: string;
  veiculoModelo?: string;
  veiculoAno?: string;
  veiculoPlaca?: string;
  valorHora?: string;
}

export const RegisterScreen: React.FC<Props> = ({ navigation, route }) => {
  const [userType, setUserType] = useState<UserRole>(
    route.params?.userType || 'aluno'
  );
  const { register, carregando, error, clearError } = useAuth();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      telefone: '',
      primeiroNome: '',
      ultimoNome: '',
      dataNascimento: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '',
      },
      detranId: '',
      licencaNumero: '',
      veiculoMarca: '',
      veiculoModelo: '',
      veiculoAno: '',
      veiculoPlaca: '',
      valorHora: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      
      let registerData: RegisterData;
      
      if (userType === 'aluno') {
        registerData = {
          email: data.email,
          password: data.password,
          telefone: data.telefone,
          papel: 'aluno',
          perfil: {
            primeiroNome: data.primeiroNome,
            ultimoNome: data.ultimoNome,
            dataNascimento: new Date(data.dataNascimento!),
            endereco: {
              ...data.endereco!,
              pais: 'BR',
            },
            cnh: {
              categoria: 'B',
              status: 'nenhuma',
            },
            preferencias: {
              localizacao: { latitude: -23.5505, longitude: -46.6333 }, // São Paulo default
              raio: 10,
            },
          },
        } as RegisterDataAluno;
      } else {
        registerData = {
          email: data.email,
          password: data.password,
          telefone: data.telefone,
          papel: 'instrutor',
          perfil: {
            primeiroNome: data.primeiroNome,
            ultimoNome: data.ultimoNome,
            detranId: data.detranId!,
            licenca: {
              numero: data.licencaNumero!,
              dataVencimento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
              categorias: ['B'],
            },
            veiculo: {
              marca: data.veiculoMarca!,
              modelo: data.veiculoModelo!,
              ano: parseInt(data.veiculoAno!, 10),
              transmissao: 'manual',
              placa: data.veiculoPlaca!,
            },
            disponibilidade: {
              segunda: { disponivel: false, horarios: [] },
              terca: { disponivel: false, horarios: [] },
              quarta: { disponivel: false, horarios: [] },
              quinta: { disponivel: false, horarios: [] },
              sexta: { disponivel: false, horarios: [] },
              sabado: { disponivel: false, horarios: [] },
              domingo: { disponivel: false, horarios: [] },
            },
            precos: {
              valorHora: parseFloat(data.valorHora!),
              moeda: 'BRL',
            },
            localizacao: {
              localizacaoBase: { latitude: -23.5505, longitude: -46.6333 },
              raioAtendimento: 15,
            },
            avaliacoes: {
              media: 0,
              quantidade: 0,
            },
          },
        } as RegisterDataInstrutor;
      }
      
      await register(registerData);
      reset();
      Alert.alert(
        'Sucesso',
        'Conta criada com sucesso! Bem-vindo ao Drivoo.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha no registro. Tente novamente.';
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

  const validateConfirmPassword = (confirmPassword: string): string | true => {
    if (!confirmPassword) return 'Confirmação de senha é obrigatória';
    if (confirmPassword !== password) return 'Senhas não coincidem';
    return true;
  };

  const validatePhone = (phone: string): string | true => {
    if (!phone) return 'Telefone é obrigatório';
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(phone)) return 'Formato: (11) 99999-9999';
    return true;
  };

  const validateRequired = (value: string | undefined): string | true => {
    if (!value || value.trim() === '') return 'Campo obrigatório';
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Junte-se à comunidade Drivoo
          </Text>

          <View style={styles.userTypeContainer}>
            <Button
              title="Aluno"
              variant={userType === 'aluno' ? 'primary' : 'outline'}
              onPress={() => setUserType('aluno')}
              style={styles.userTypeButton}
            />
            <Button
              title="Instrutor"
              variant={userType === 'instrutor' ? 'primary' : 'outline'}
              onPress={() => setUserType('instrutor')}
              style={styles.userTypeButton}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Informações Básicas</Text>
            
            <Controller
              control={control}
              name="primeiroNome"
              rules={{ validate: validateRequired }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Nome"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Seu nome"
                  error={errors.primeiroNome?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="ultimoNome"
              rules={{ validate: validateRequired }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Sobrenome"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Seu sobrenome"
                  error={errors.ultimoNome?.message}
                />
              )}
            />
            
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
            
            <Controller
              control={control}
              name="telefone"
              rules={{ validate: validatePhone }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Telefone"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  placeholder="(11) 99999-9999"
                  error={errors.telefone?.message}
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
                  placeholder="Sua senha"
                  error={errors.password?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="confirmPassword"
              rules={{ validate: validateConfirmPassword }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Confirmar Senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  placeholder="Confirme sua senha"
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            {/* Role-specific fields */}
            {userType === 'aluno' && (
              <>
                <Text style={styles.sectionTitle}>Informações do Aluno</Text>
                
                <Controller
                  control={control}
                  name="dataNascimento"
                  rules={{ validate: validateRequired }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Data de Nascimento"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="DD/MM/AAAA"
                      error={errors.dataNascimento?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="endereco.cep"
                  rules={{ validate: validateRequired }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="CEP"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="00000-000"
                      keyboardType="numeric"
                      error={errors.endereco?.cep?.message}
                    />
                  )}
                />
              </>
            )}

            {userType === 'instrutor' && (
              <>
                <Text style={styles.sectionTitle}>Informações do Instrutor</Text>
                
                <Controller
                  control={control}
                  name="detranId"
                  rules={{ validate: validateRequired }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="ID DETRAN"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Seu ID do DETRAN"
                      error={errors.detranId?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="licencaNumero"
                  rules={{ validate: validateRequired }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Número da Licença"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Número da sua licença"
                      error={errors.licencaNumero?.message}
                    />
                  )}
                />

                <Text style={styles.sectionTitle}>Informações do Veículo</Text>

                <Controller
                  control={control}
                  name="veiculoMarca"
                  rules={{ validate: validateRequired }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Marca do Veículo"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Ex: Volkswagen"
                      error={errors.veiculoMarca?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="veiculoModelo"
                  rules={{ validate: validateRequired }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Modelo do Veículo"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Ex: Gol"
                      error={errors.veiculoModelo?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="veiculoPlaca"
                  rules={{ validate: validateRequired }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Placa do Veículo"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="ABC-1234"
                      error={errors.veiculoPlaca?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="valorHora"
                  rules={{ validate: validateRequired }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Valor por Hora (R$)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="80.00"
                      keyboardType="numeric"
                      error={errors.valorHora?.message}
                    />
                  )}
                />
              </>
            )}

            <Button
              title={carregando ? 'Criando conta...' : 'Criar Conta'}
              onPress={handleSubmit(onSubmit)}
              disabled={carregando || !isValid}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Button
              title="Já tem uma conta? Entrar"
              variant="ghost"
              onPress={() => navigation.navigate('Login')}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
    marginBottom: theme.spacing.lg,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  userTypeButton: {
    flex: 1,
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
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  registerButton: {
    marginTop: theme.spacing.xl,
  },
  footer: {
    alignItems: 'center',
  },
});