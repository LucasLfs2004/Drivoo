import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../../shared/ui/base/Button';
import { FormInput } from '../../../shared/ui/forms';
import { useAuth } from '../../../core/auth';
import { theme } from '../../../theme';
import type { AuthStackScreenProps } from '../../../types/navigation';
import type { RegisterUser } from '../../../types/auth';

type Props = AuthStackScreenProps<'Register'>;
type UserType = 'aluno' | 'instrutor';

interface RegisterFormData {
  userType: UserType;
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  cep: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  possuiVeiculo?: boolean;
  veiculo_modelo?: string;
  veiculo_ano?: string;
  veiculo_placa?: string;
  veiculo_tipo_cambio?: 'MANUAL' | 'AUTOMATICO';
  cnh_numero?: string;
  cnh_categorias?: string[];
  cnh_vencimento?: string;
  valor_hora?: string;
  bio?: string;
  veiculo_marca?: string;
  veiculo_modelo_instrutor?: string;
  veiculo_ano_instrutor?: string;
  veiculo_placa_instrutor?: string;
  veiculo_tipo_cambio_instrutor?: 'MANUAL' | 'AUTOMATICO';
}

export const RegisterScreen: React.FC<Props> = ({ route }) => {
  const { register, carregando, error, clearError } = useAuth();
  const [userType, setUserType] = useState<UserType>(route.params?.userType || 'aluno');
  const [possuiVeiculo, setPossuiVeiculo] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset: resetForm,
  } = useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      userType,
      nome: '',
      sobrenome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      cpf: '',
      telefone: '',
      data_nascimento: '',
      cep: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: 'São Paulo',
      estado: 'SP',
      possuiVeiculo: false,
      veiculo_modelo: '',
      veiculo_ano: '',
      veiculo_placa: '',
      veiculo_tipo_cambio: 'MANUAL',
      cnh_numero: '',
      cnh_categorias: [],
      cnh_vencimento: '',
      valor_hora: '',
      bio: '',
      veiculo_marca: '',
      veiculo_modelo_instrutor: '',
      veiculo_ano_instrutor: '',
      veiculo_placa_instrutor: '',
      veiculo_tipo_cambio_instrutor: 'MANUAL',
    },
  });

  const senhaWatch = watch('senha');

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    if (type !== 'aluno') {
      setPossuiVeiculo(false);
    }
    resetForm({ ...watch(), userType: type });
  };

  const formatarDataParaAPI = (
    dataString: string,
    verifyBirthRules: boolean = true
  ): string => {
    if (!dataString) throw new Error('Data de nascimento é obrigatória');

    const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dataRegex.test(dataString)) {
      throw new Error('Formato de data inválido. Use DD/MM/AAAA');
    }

    const [dia, mes, ano] = dataString.split('/').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);

    if (isNaN(dataObj.getTime())) {
      throw new Error('Data de nascimento inválida');
    }

    if (verifyBirthRules) {
      const hoje = new Date();
      if (dataObj > hoje) {
        throw new Error('Data de nascimento não pode ser futura');
      }

      const idadeMinima = new Date();
      idadeMinima.setFullYear(idadeMinima.getFullYear() - 16);
      if (dataObj > idadeMinima) {
        throw new Error('É necessário ter pelo menos 16 anos');
      }

      const idadeMaxima = new Date();
      idadeMaxima.setFullYear(idadeMaxima.getFullYear() - 100);
      if (dataObj < idadeMaxima) {
        throw new Error('Data de nascimento inválida');
      }
    }

    return `${ano}-${mes.toString().padStart(2, '0')}-${dia
      .toString()
      .padStart(2, '0')}`;
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();

      if (userType === 'aluno') {
        const registerData: RegisterUser = {
          userType: 'aluno',
          nome: data.nome,
          sobrenome: data.sobrenome,
          email: data.email,
          senha: data.senha,
          cpf: data.cpf.replace(/\D/g, ''),
          telefone: data.telefone.replace(/\D/g, ''),
          data_nascimento: formatarDataParaAPI(data.data_nascimento),
          cep: data.cep.replace(/\D/g, ''),
          cidade: data.cidade,
          estado: data.estado,
        };

        if (
          possuiVeiculo &&
          data.veiculo_modelo &&
          data.veiculo_ano &&
          data.veiculo_placa
        ) {
          registerData.veiculo = {
            modelo: data.veiculo_modelo,
            ano: parseInt(data.veiculo_ano, 10),
            placa: data.veiculo_placa,
            tipo_cambio: data.veiculo_tipo_cambio || 'MANUAL',
          };
        }

        await register(registerData);
      } else {
        if (!data.cnh_numero || !data.cnh_vencimento || !data.valor_hora) {
          throw new Error('Dados da CNH e valor/hora são obrigatórios');
        }

        if (!data.cnh_categorias?.length) {
          throw new Error('Selecione pelo menos uma categoria de CNH');
        }

        if (!data.rua || !data.numero || !data.bairro) {
          throw new Error('Rua, número e bairro são obrigatórios para instrutores');
        }

        if (
          !data.veiculo_marca ||
          !data.veiculo_modelo_instrutor ||
          !data.veiculo_ano_instrutor ||
          !data.veiculo_placa_instrutor
        ) {
          throw new Error('Dados do veículo são obrigatórios para instrutores');
        }

        const registerData: RegisterUser = {
          userType: 'instrutor',
          nome: data.nome,
          sobrenome: data.sobrenome,
          email: data.email,
          senha: data.senha,
          cpf: data.cpf.replace(/\D/g, ''),
          telefone: data.telefone.replace(/\D/g, ''),
          data_nascimento: formatarDataParaAPI(data.data_nascimento),
          cep: data.cep.replace(/\D/g, ''),
          rua: data.rua,
          numero: data.numero,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          cnh_numero: data.cnh_numero,
          cnh_categorias: data.cnh_categorias,
          cnh_vencimento: formatarDataParaAPI(data.cnh_vencimento, false),
          valor_hora: parseFloat(data.valor_hora),
          bio: data.bio,
          veiculo: {
            marca: data.veiculo_marca,
            modelo: data.veiculo_modelo_instrutor,
            ano: parseInt(data.veiculo_ano_instrutor, 10),
            placa: data.veiculo_placa_instrutor,
            tipo_cambio: data.veiculo_tipo_cambio_instrutor || 'MANUAL',
          },
        };

        await register(registerData);
      }

      Alert.alert('Sucesso', 'Conta criada com sucesso! Bem-vindo ao Drivoo.');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Falha no registro. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    }
  };

  const validateRequired = (value: string | undefined): string | true =>
    !value || value.trim() === '' ? 'Campo obrigatório' : true;

  const validateEmail = (email: string): string | true => {
    if (!email) return 'Email é obrigatório';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? true : 'Email inválido';
  };

  const validateSenha = (senha: string): string | true => {
    if (!senha) return 'Senha é obrigatória';
    return senha.length >= 6 ? true : 'Senha deve ter pelo menos 6 caracteres';
  };

  const validateConfirmarSenha = (confirmarSenha: string): string | true => {
    if (!confirmarSenha) return 'Confirmação de senha é obrigatória';
    return confirmarSenha === senhaWatch ? true : 'Senhas não coincidem';
  };

  const validateCPF = (cpf: string): string | true => {
    if (!cpf) return 'CPF é obrigatório';
    return /^\d{11}$/.test(cpf.replace(/\D/g, ''))
      ? true
      : 'CPF deve conter 11 dígitos';
  };

  const validateTelefone = (telefone: string): string | true => {
    if (!telefone) return 'Telefone é obrigatório';
    const telefoneLimpo = telefone.replace(/\D/g, '');
    return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11
      ? true
      : 'Telefone inválido';
  };

  const validateDataNascimento = (data: string | undefined): string | true => {
    if (!data) return 'Data de nascimento é obrigatória';
    return /^\d{2}\/\d{2}\/\d{4}$/.test(data) ? true : 'Formato: DD/MM/AAAA';
  };

  const validateCEP = (cep: string): string | true => {
    if (!cep) return 'CEP é obrigatório';
    return cep.replace(/\D/g, '').length === 8 ? true : 'CEP inválido';
  };

  const formatCPF = (value: string): string => {
    const cpfLimpo = value.replace(/\D/g, '');
    if (cpfLimpo.length <= 3) return cpfLimpo;
    if (cpfLimpo.length <= 6) return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3)}`;
    if (cpfLimpo.length <= 9) {
      return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6)}`;
    }
    return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(
      6,
      9
    )}-${cpfLimpo.slice(9, 11)}`;
  };

  const formatTelefone = (value: string): string => {
    const telefoneLimpo = value.replace(/\D/g, '');
    if (telefoneLimpo.length <= 2) return telefoneLimpo;
    if (telefoneLimpo.length <= 6) {
      return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2)}`;
    }
    if (telefoneLimpo.length <= 10) {
      return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(
        2,
        6
      )}-${telefoneLimpo.slice(6)}`;
    }
    return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(
      2,
      7
    )}-${telefoneLimpo.slice(7, 11)}`;
  };

  const formatData = (value: string): string => {
    const limpa = value.replace(/\D/g, '');
    if (limpa.length <= 2) return limpa;
    if (limpa.length <= 4) return `${limpa.slice(0, 2)}/${limpa.slice(2)}`;
    return `${limpa.slice(0, 2)}/${limpa.slice(2, 4)}/${limpa.slice(4, 8)}`;
  };

  const formatCEP = (value: string): string => {
    const cepLimpo = value.replace(/\D/g, '');
    if (cepLimpo.length <= 5) return cepLimpo;
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se à comunidade Drivoo</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeLabel}>Tipo de Conta</Text>
            <View style={styles.userTypeButtons}>
              {(['aluno', 'instrutor'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.userTypeButton,
                    userType === type && styles.userTypeButtonActive,
                  ]}
                  onPress={() => handleUserTypeChange(type)}
                >
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      userType === type && styles.userTypeButtonTextActive,
                    ]}
                  >
                    {type === 'aluno' ? 'Aluno' : 'Instrutor'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>

            {([
              ['nome', 'Nome', 'Seu nome'],
              ['sobrenome', 'Sobrenome', 'Seu sobrenome'],
            ] as const).map(([name, label, placeholder]) => (
              <Controller
                key={name}
                control={control}
                name={name}
                rules={{ validate: validateRequired }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    label={label}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    error={errors[name]?.message}
                  />
                )}
              />
            ))}

            <Controller
              control={control}
              name="cpf"
              rules={{ validate: validateCPF }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="CPF"
                  value={formatCPF(value)}
                  onChangeText={text => onChange(formatCPF(text))}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  placeholder="000.000.000-00"
                  error={errors.cpf?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="data_nascimento"
              rules={{ validate: validateDataNascimento }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Data de Nascimento"
                  value={formatData(value)}
                  onChangeText={text => onChange(formatData(text))}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  placeholder="DD/MM/AAAA"
                  error={errors.data_nascimento?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="telefone"
              rules={{ validate: validateTelefone }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Telefone"
                  value={formatTelefone(value)}
                  onChangeText={text => onChange(formatTelefone(text))}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  placeholder="(11) 99999-9999"
                  error={errors.telefone?.message}
                />
              )}
            />

            <Text style={styles.sectionTitle}>Informações de Contato</Text>

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
              name="senha"
              rules={{ validate: validateSenha }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  placeholder="Sua senha"
                  error={errors.senha?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmarSenha"
              rules={{ validate: validateConfirmarSenha }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Confirmar Senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  placeholder="Confirme sua senha"
                  error={errors.confirmarSenha?.message}
                />
              )}
            />

            <Text style={styles.sectionTitle}>Endereço</Text>

            <Controller
              control={control}
              name="cep"
              rules={{ validate: validateCEP }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="CEP"
                  value={formatCEP(value)}
                  onChangeText={text => onChange(formatCEP(text))}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  placeholder="00000-000"
                  error={errors.cep?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="cidade"
              rules={{ validate: validateRequired }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Cidade"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Sua cidade"
                  error={errors.cidade?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="estado"
              rules={{ validate: validateRequired }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Estado"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="UF"
                  error={errors.estado?.message}
                />
              )}
            />

            {userType === 'aluno' && (
              <>
                <Text style={styles.sectionTitle}>Veículo (Opcional)</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Possuo veículo particular</Text>
                  <Switch
                    value={possuiVeiculo}
                    onValueChange={setPossuiVeiculo}
                    trackColor={{
                      false: theme.colors.border.medium,
                      true: theme.colors.primary[500],
                    }}
                    thumbColor={
                      possuiVeiculo
                        ? theme.colors.primary[500]
                        : theme.colors.border.light
                    }
                  />
                </View>
              </>
            )}

            {userType === 'instrutor' && (
              <>
                <Text style={styles.sectionTitle}>Informações da CNH</Text>
                <Controller
                  control={control}
                  name="cnh_numero"
                  rules={{ validate: validateRequired }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Número da CNH"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Seu número de CNH"
                      error={errors.cnh_numero?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="cnh_vencimento"
                  rules={{ validate: validateDataNascimento }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Vencimento da CNH"
                      value={formatData(value || '')}
                      onChangeText={text => onChange(formatData(text))}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      placeholder="DD/MM/AAAA"
                      error={errors.cnh_vencimento?.message}
                    />
                  )}
                />
              </>
            )}

            <Button
              title={carregando ? 'Criando conta...' : 'Criar Conta'}
              onPress={handleSubmit(onSubmit)}
              disabled={carregando || !isValid}
              style={styles.submitButton}
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
  userTypeContainer: {
    marginBottom: theme.spacing.xl,
  },
  userTypeLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borders.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  userTypeButtonActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  userTypeButtonText: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  userTypeButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  form: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  switchLabel: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});
