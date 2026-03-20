import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/forms/FormInput';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../themes';
import type { AuthStackScreenProps } from '../../types/navigation';
import type { RegisterUser } from '../../types/auth';

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
  // Campos do aluno
  possuiVeiculo?: boolean;
  veiculo_modelo?: string;
  veiculo_ano?: string;
  veiculo_placa?: string;
  veiculo_tipo_cambio?: 'MANUAL' | 'AUTOMATICO';
  // Campos do instrutor
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

export const RegisterScreen: React.FC<Props> = ({ navigation, route }) => {
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
      userType: userType,
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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();

      console.log('Data de nascimento recebida:', data.data_nascimento);

      // Função auxiliar para converter data de forma segura
      const formatarDataParaAPI = (dataString: string, verifyBirthRules: boolean = true): string => {
        if (!dataString) {
          throw new Error('Data de nascimento é obrigatória');
        }

        // Verificar formato DD/MM/AAAA
        const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dataRegex.test(dataString)) {
          throw new Error('Formato de data inválido. Use DD/MM/AAAA');
        }

        // Converter para objeto Date
        const [dia, mes, ano] = dataString.split('/').map(Number);
        const dataObj = new Date(ano, mes - 1, dia);

        // Verificar se a data é válida
        if (isNaN(dataObj.getTime())) {
          throw new Error('Data de nascimento inválida');
        }

        // Verificar se a data não é futura
        if (verifyBirthRules) {
          const hoje = new Date();
          if (dataObj > hoje) {
            throw new Error('Data de nascimento não pode ser futura');
          }

          // Verificar idade mínima (16 anos)
          const idadeMinima = new Date();
          idadeMinima.setFullYear(idadeMinima.getFullYear() - 16);
          if (dataObj > idadeMinima) {
            throw new Error('É necessário ter pelo menos 16 anos');
          }

          // Verificar idade máxima (100 anos)
          const idadeMaxima = new Date();
          idadeMaxima.setFullYear(idadeMaxima.getFullYear() - 100);
          if (dataObj < idadeMaxima) {
            throw new Error('Data de nascimento inválida');
          }
        }


        // Formatar para YYYY-MM-DD
        return `${ano}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
      };

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

        // Adicionar veículo se habilitado
        if (possuiVeiculo && data.veiculo_modelo && data.veiculo_ano && data.veiculo_placa) {
          registerData.veiculo = {
            modelo: data.veiculo_modelo,
            ano: parseInt(data.veiculo_ano, 10),
            placa: data.veiculo_placa,
            tipo_cambio: data.veiculo_tipo_cambio || 'MANUAL',
          };
        }

        console.log('Dados de registro (Aluno):', registerData);
        await register(registerData);
      } else if (userType === 'instrutor') {
        if (!data.cnh_numero || !data.cnh_vencimento || !data.valor_hora) {
          throw new Error('Dados da CNH e valor/hora são obrigatórios');
        }

        if (!data.cnh_categorias?.length) {
          throw new Error('Selecione pelo menos uma categoria de CNH');
        }

        if (!data.rua || !data.numero || !data.bairro) {
          throw new Error('Rua, número e bairro são obrigatórios para instrutores');
        }

        if (!data.veiculo_marca || !data.veiculo_modelo_instrutor || !data.veiculo_ano_instrutor || !data.veiculo_placa_instrutor) {
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

        console.log('Dados de registro (Instrutor):', registerData);
        await register(registerData);
      }

      // Navegar para a tela principal após registro bem-sucedido
      Alert.alert(
        'Sucesso',
        'Conta criada com sucesso! Bem-vindo ao Drivoo.',
        [{
          text: 'OK', onPress: () => {
            // A navegação será automática pelo RootNavigator
          }
        }]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha no registro. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    }
  };

  const validateRequired = (value: string | undefined): string | true => {
    if (!value || value.trim() === '') return 'Campo obrigatório';
    return true;
  };

  const validateEmail = (email: string): string | true => {
    if (!email) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    return true;
  };

  const validateSenha = (senha: string): string | true => {
    if (!senha) return 'Senha é obrigatória';
    if (senha.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    return true;
  };

  const validateConfirmarSenha = (confirmarSenha: string): string | true => {
    if (!confirmarSenha) return 'Confirmação de senha é obrigatória';
    if (confirmarSenha !== senhaWatch) return 'Senhas não coincidem';
    return true;
  };

  const validateCPF = (cpf: string): string | true => {
    if (!cpf) return 'CPF é obrigatório';
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(cpf.replace(/\D/g, ''))) return 'CPF deve conter 11 dígitos';
    return true;
  };

  const validateTelefone = (telefone: string): string | true => {
    if (!telefone) return 'Telefone é obrigatório';
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) return 'Telefone inválido';
    return true;
  };

  const validateDataNascimento = (data: string | undefined): string | true => {
    if (!data) return 'Data de nascimento é obrigatória';
    const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dataRegex.test(data)) return 'Formato: DD/MM/AAAA';
    return true;
  };

  const validateCEP = (cep: string): string | true => {
    if (!cep) return 'CEP é obrigatório';
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return 'CEP inválido';
    return true;
  };

  const formatCPF = (value: string): string => {
    const cpfLimpo = value.replace(/\D/g, '');
    if (cpfLimpo.length <= 3) return cpfLimpo;
    if (cpfLimpo.length <= 6) return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3)}`;
    if (cpfLimpo.length <= 9) return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6)}`;
    return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9, 11)}`;
  };

  const formatTelefone = (value: string): string => {
    const telefoneLimpo = value.replace(/\D/g, '');
    if (telefoneLimpo.length <= 2) return telefoneLimpo;
    if (telefoneLimpo.length <= 6) return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2)}`;
    if (telefoneLimpo.length <= 10) return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2, 6)}-${telefoneLimpo.slice(6)}`;
    return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2, 7)}-${telefoneLimpo.slice(7, 11)}`;
  };

  const formatDataNascimento = (value: string): string => {
    const dataLimpa = value.replace(/\D/g, '');
    if (dataLimpa.length <= 2) return dataLimpa;
    if (dataLimpa.length <= 4) return `${dataLimpa.slice(0, 2)}/${dataLimpa.slice(2)}`;
    return `${dataLimpa.slice(0, 2)}/${dataLimpa.slice(2, 4)}/${dataLimpa.slice(4, 8)}`;
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
          <Text style={styles.subtitle}>
            Junte-se à comunidade Drivoo
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Seleção de Tipo de Usuário */}
          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeLabel}>Tipo de Conta</Text>
            <View style={styles.userTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'aluno' && styles.userTypeButtonActive,
                ]}
                onPress={() => handleUserTypeChange('aluno')}
              >
                <Text
                  style={[
                    styles.userTypeButtonText,
                    userType === 'aluno' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Aluno
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'instrutor' && styles.userTypeButtonActive,
                ]}
                onPress={() => handleUserTypeChange('instrutor')}
              >
                <Text
                  style={[
                    styles.userTypeButtonText,
                    userType === 'instrutor' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Instrutor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>

            <Controller
              control={control}
              name="nome"
              rules={{ validate: validateRequired }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Nome"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Seu nome"
                  error={errors.nome?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="sobrenome"
              rules={{ validate: validateRequired }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Sobrenome"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Seu sobrenome"
                  error={errors.sobrenome?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="cpf"
              rules={{ validate: validateCPF }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="CPF"
                  value={formatCPF(value)}
                  onChangeText={(text) => onChange(formatCPF(text))}
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
                  value={formatDataNascimento(value)}
                  onChangeText={(text) => onChange(formatDataNascimento(text))}
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
                  onChangeText={(text) => onChange(formatTelefone(text))}
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
                  onChangeText={(text) => onChange(formatCEP(text))}
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
                    trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary[500] }}
                    thumbColor={possuiVeiculo ? theme.colors.primary[500] : theme.colors.border.light}
                  />
                </View>

                {possuiVeiculo && (
                  <>
                    <Controller
                      control={control}
                      name="veiculo_modelo"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormInput
                          label="Modelo do Veículo"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Ex: Gol, Uno, etc."
                          error={errors.veiculo_modelo?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="veiculo_ano"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormInput
                          label="Ano do Veículo"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="numeric"
                          placeholder="Ex: 2020"
                          error={errors.veiculo_ano?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="veiculo_placa"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormInput
                          label="Placa do Veículo"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="ABC-1234"
                          error={errors.veiculo_placa?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="veiculo_tipo_cambio"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.cambioContainer}>
                          <Text style={styles.cambioLabel}>Tipo de Câmbio</Text>
                          <View style={styles.cambioButtons}>
                            <TouchableOpacity
                              style={[
                                styles.cambioButton,
                                value === 'MANUAL' && styles.cambioButtonActive,
                              ]}
                              onPress={() => onChange('MANUAL')}
                            >
                              <Text
                                style={[
                                  styles.cambioButtonText,
                                  value === 'MANUAL' && styles.cambioButtonTextActive,
                                ]}
                              >
                                Manual
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.cambioButton,
                                value === 'AUTOMATICO' && styles.cambioButtonActive,
                              ]}
                              onPress={() => onChange('AUTOMATICO')}
                            >
                              <Text
                                style={[
                                  styles.cambioButtonText,
                                  value === 'AUTOMATICO' && styles.cambioButtonTextActive,
                                ]}
                              >
                                Automático
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    />
                  </>
                )}
              </>
            )}

            {/* Campos específicos do Instrutor */}
            {userType === 'instrutor' && (
              <>
                <Text style={styles.sectionTitle}>Informações da CNH</Text>

                <Controller
                  control={control}
                  name="cnh_numero"
                  rules={{ required: 'Número da CNH é obrigatório' }}
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
                  rules={{ validate: (value) => validateDataNascimento(value) }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Vencimento da CNH"
                      value={formatDataNascimento(value || '')}
                      onChangeText={(text) => onChange(formatDataNascimento(text))}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      placeholder="DD/MM/AAAA"
                      error={errors.cnh_vencimento?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="cnh_categorias"
                  rules={{
                    validate: (value) =>
                      value && value.length > 0 ? true : 'Selecione pelo menos uma categoria de CNH'
                  }}
                  render={({ field: { onChange, value } }) => {
                    const categoriasSelecionadas = value || [];

                    const toggleCategoria = (categoria: string) => {
                      if (categoriasSelecionadas.includes(categoria)) {
                        onChange(categoriasSelecionadas.filter(item => item !== categoria));
                        return;
                      }

                      onChange([...categoriasSelecionadas, categoria]);
                    };

                    return (
                      <View style={styles.cnhCategoriasContainer}>
                        <Text style={styles.cambioLabel}>Categorias da CNH</Text>
                        <View style={styles.cambioButtons}>
                          {['A', 'B'].map(categoria => {
                            const selecionada = categoriasSelecionadas.includes(categoria);

                            return (
                              <TouchableOpacity
                                key={categoria}
                                style={[
                                  styles.cambioButton,
                                  selecionada && styles.cambioButtonActive,
                                ]}
                                onPress={() => toggleCategoria(categoria)}
                              >
                                <Text
                                  style={[
                                    styles.cambioButtonText,
                                    selecionada && styles.cambioButtonTextActive,
                                  ]}
                                >
                                  {categoria}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                        {errors.cnh_categorias?.message && (
                          <Text style={styles.fieldErrorText}>{errors.cnh_categorias.message}</Text>
                        )}
                      </View>
                    );
                  }}
                />

                <Text style={styles.sectionTitle}>Endereço do Instrutor</Text>

                <Controller
                  control={control}
                  name="rua"
                  rules={{ validate: userType === 'instrutor' ? validateRequired : undefined }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Rua"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Ex: Rua das Flores"
                      error={errors.rua?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="numero"
                  rules={{ validate: userType === 'instrutor' ? validateRequired : undefined }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Número"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Ex: 123"
                      error={errors.numero?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="bairro"
                  rules={{ validate: userType === 'instrutor' ? validateRequired : undefined }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Bairro"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Ex: Vila Madalena"
                      error={errors.bairro?.message}
                    />
                  )}
                />

                <Text style={styles.sectionTitle}>Informações Profissionais</Text>

                <Controller
                  control={control}
                  name="valor_hora"
                  rules={{ required: 'Valor/hora é obrigatório' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Valor por Hora (R$)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                      placeholder="Ex: 80.00"
                      error={errors.valor_hora?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="bio"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Biografia (Opcional)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Conte um pouco sobre você"
                      multiline
                      numberOfLines={4}
                      error={errors.bio?.message}
                    />
                  )}
                />

                <Text style={styles.sectionTitle}>Veículo</Text>

                <Controller
                  control={control}
                  name="veiculo_marca"
                  rules={{ required: 'Marca do veículo é obrigatória' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Marca do Veículo"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Ex: Volkswagen, Fiat, etc."
                      error={errors.veiculo_marca?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="veiculo_modelo_instrutor"
                  rules={{ required: 'Modelo do veículo é obrigatório' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Modelo do Veículo"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Ex: Gol, Uno, etc."
                      error={errors.veiculo_modelo_instrutor?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="veiculo_ano_instrutor"
                  rules={{ required: 'Ano do veículo é obrigatório' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Ano do Veículo"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      placeholder="Ex: 2020"
                      error={errors.veiculo_ano_instrutor?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="veiculo_placa_instrutor"
                  rules={{ required: 'Placa do veículo é obrigatória' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Placa do Veículo"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="ABC-1234"
                      error={errors.veiculo_placa_instrutor?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="veiculo_tipo_cambio_instrutor"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.cambioContainer}>
                      <Text style={styles.cambioLabel}>Tipo de Câmbio</Text>
                      <View style={styles.cambioButtons}>
                        <TouchableOpacity
                          style={[
                            styles.cambioButton,
                            value === 'MANUAL' && styles.cambioButtonActive,
                          ]}
                          onPress={() => onChange('MANUAL')}
                        >
                          <Text
                            style={[
                              styles.cambioButtonText,
                              value === 'MANUAL' && styles.cambioButtonTextActive,
                            ]}
                          >
                            Manual
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.cambioButton,
                            value === 'AUTOMATICO' && styles.cambioButtonActive,
                          ]}
                          onPress={() => onChange('AUTOMATICO')}
                        >
                          <Text
                            style={[
                              styles.cambioButtonText,
                              value === 'AUTOMATICO' && styles.cambioButtonTextActive,
                            ]}
                          >
                            Automático
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
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
  userTypeContainer: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  userTypeLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borders.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
  },
  userTypeButtonActive: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[500],
  },
  userTypeButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  userTypeButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
    marginBottom: theme.spacing.lg,
  },
  switchLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  cnhCategoriasContainer: {
    marginBottom: theme.spacing.lg,
  },
  cambioContainer: {
    marginBottom: theme.spacing.lg,
  },
  cambioLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  cambioButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cambioButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borders.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
  },
  cambioButtonActive: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[500],
  },
  cambioButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  cambioButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  fieldErrorText: {
    marginTop: theme.spacing.sm,
    color: '#C62828',
    fontSize: theme.typography.fontSize.sm,
  },
});
