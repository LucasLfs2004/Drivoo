import { GraduationCap, UserRound } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../core/auth';
import { Button } from '../../../shared/ui/base/Button';
import { StepFlow, type StepFlowItem } from '../../../shared/ui/flows';
import { FormInput, FormSelect } from '../../../shared/ui/forms';
import { theme } from '../../../theme';
import type { RegisterUser } from '../../../types/auth';
import type { AuthStackScreenProps } from '../../../types/navigation';
import {
  OnboardingStepper,
  type OnboardingStepDefinition,
} from '../components/OnboardingStepper';

type Props = AuthStackScreenProps<'Onboarding'>;
type UserType = 'aluno' | 'instrutor';
type VehicleTransmission = 'MANUAL' | 'AUTOMATICO';
type CNHCategory = 'A' | 'B' | 'AB';

interface OnboardingFormData {
  nome: string;
  sobrenome: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  rua: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  userType?: UserType;
  possuiVeiculo: boolean;
  veiculo_marca: string;
  veiculo_modelo: string;
  veiculo_ano: string;
  veiculo_placa: string;
  veiculo_tipo_cambio: VehicleTransmission;
  cnh_numero: string;
  cnh_vencimento: string;
  cnh_categorias: CNHCategory[];
  valor_hora: string;
  bio: string;
}

const BASE_STEPS: OnboardingStepDefinition[] = [
  {
    id: 'personal',
    title: 'Informações',
    subtitle: 'Dados básicos',
  },
  {
    id: 'account-type',
    title: 'Conta',
    subtitle: 'Instrutor ou aluno',
  },
  {
    id: 'vehicle',
    title: 'Veículo',
    subtitle: 'Dados do veículo',
  },
];

const INSTRUCTOR_STEP: OnboardingStepDefinition = {
  id: 'instructor',
  title: 'Instrutor',
  subtitle: 'CNH e valores',
};

const PERSONAL_FIELDS: Array<keyof OnboardingFormData> = [
  'nome',
  'sobrenome',
  'telefone',
  'cpf',
  'data_nascimento',
  'cep',
  'rua',
  'numero',
  'bairro',
  'cidade',
  'estado',
];

const ACCOUNT_TYPE_FIELDS: Array<keyof OnboardingFormData> = ['userType'];
const INSTRUCTOR_FIELDS: Array<keyof OnboardingFormData> = [
  'cnh_numero',
  'cnh_vencimento',
  'valor_hora',
];

const CNH_OPTIONS: CNHCategory[] = ['A', 'B', 'AB'];
const BRAZILIAN_UF_OPTIONS = [
  { label: 'Acre (AC)', value: 'AC' },
  { label: 'Alagoas (AL)', value: 'AL' },
  { label: 'Amapa (AP)', value: 'AP' },
  { label: 'Amazonas (AM)', value: 'AM' },
  { label: 'Bahia (BA)', value: 'BA' },
  { label: 'Ceara (CE)', value: 'CE' },
  { label: 'Distrito Federal (DF)', value: 'DF' },
  { label: 'Espirito Santo (ES)', value: 'ES' },
  { label: 'Goias (GO)', value: 'GO' },
  { label: 'Maranhao (MA)', value: 'MA' },
  { label: 'Mato Grosso (MT)', value: 'MT' },
  { label: 'Mato Grosso do Sul (MS)', value: 'MS' },
  { label: 'Minas Gerais (MG)', value: 'MG' },
  { label: 'Para (PA)', value: 'PA' },
  { label: 'Paraiba (PB)', value: 'PB' },
  { label: 'Parana (PR)', value: 'PR' },
  { label: 'Pernambuco (PE)', value: 'PE' },
  { label: 'Piaui (PI)', value: 'PI' },
  { label: 'Rio de Janeiro (RJ)', value: 'RJ' },
  { label: 'Rio Grande do Norte (RN)', value: 'RN' },
  { label: 'Rio Grande do Sul (RS)', value: 'RS' },
  { label: 'Rondonia (RO)', value: 'RO' },
  { label: 'Roraima (RR)', value: 'RR' },
  { label: 'Santa Catarina (SC)', value: 'SC' },
  { label: 'Sao Paulo (SP)', value: 'SP' },
  { label: 'Sergipe (SE)', value: 'SE' },
  { label: 'Tocantins (TO)', value: 'TO' },
] as const;

const validateRequired = (value: string | undefined): string | true =>
  !value || value.trim() === '' ? 'Campo obrigatório' : true;

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

const validateDate = (value: string): string | true => {
  if (!value) return 'Data obrigatória';
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? true : 'Formato: DD/MM/AAAA';
};

const formatCPF = (value: string): string => {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
};

const formatTelefone = (value: string): string => {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 2) return clean;
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
};

const formatDate = (value: string): string => {
  const clean = value.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 2) return clean;
  if (clean.length <= 4) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  return `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`;
};

const formatCEP = (value: string): string => {
  const clean = value.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
};

const formatCurrency = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const numeric = Number(digits) / 100;
  return numeric.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const formatDateToApi = (dateString: string): string => {
  const [day, month, year] = dateString.split('/').map(Number);
  return `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
};

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const {
    completeOnboarding,
    carregando,
    error,
    sessionEmail,
    needsOnboarding,
    isAuthenticated,
    clearError,
  } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const numeroInputRef = useRef<TextInput>(null);
  const lastResolvedCepRef = useRef('');
  const cepLookupRequestRef = useRef(0);

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    mode: 'onChange',
    defaultValues: {
      nome: '',
      sobrenome: '',
      telefone: '',
      cpf: '',
      data_nascimento: '',
      rua: '',
      numero: '',
      bairro: '',
      cep: '',
      cidade: '',
      estado: '',
      userType: undefined,
      possuiVeiculo: false,
      veiculo_marca: '',
      veiculo_modelo: '',
      veiculo_ano: '',
      veiculo_placa: '',
      veiculo_tipo_cambio: 'MANUAL',
      cnh_numero: '',
      cnh_vencimento: '',
      cnh_categorias: ['B'],
      valor_hora: '',
      bio: '',
    },
  });

  const userType = watch('userType');
  const possuiVeiculo = watch('possuiVeiculo');
  const cnhCategorias = watch('cnh_categorias');
  const isInstrutor = userType === 'instrutor';
  const steps = useMemo(
    () => (isInstrutor ? [...BASE_STEPS, INSTRUCTOR_STEP] : BASE_STEPS),
    [isInstrutor]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
      return;
    }

    if (!needsOnboarding) {
      navigation.goBack();
    }
  }, [isAuthenticated, navigation, needsOnboarding]);

  useEffect(() => {
    if (userType !== 'instrutor' && currentStep > 2) {
      setCurrentStep(2);
    }
  }, [currentStep, userType]);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  const lookupAddressByCep = async (cepValue: string) => {
    const cepDigits = cepValue.replace(/\D/g, '');

    if (cepDigits.length !== 8 || cepDigits === lastResolvedCepRef.current) {
      return;
    }

    const requestId = ++cepLookupRequestRef.current;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);

      if (!response.ok) {
        throw new Error('Não foi possível consultar o CEP.');
      }

      const result = (await response.json()) as ViaCepResponse;

      if (requestId !== cepLookupRequestRef.current) {
        return;
      }

      if (result.erro) {
        lastResolvedCepRef.current = '';
        setError('cep', {
          type: 'manual',
          message: 'CEP não encontrado',
        });
        return;
      }

      lastResolvedCepRef.current = cepDigits;
      clearErrors('cep');

      setValue('rua', result.logradouro?.trim() ?? '', {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('bairro', result.bairro?.trim() ?? '', {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('cidade', result.localidade?.trim() ?? '', {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('estado', result.uf?.trim().toUpperCase() ?? '', {
        shouldDirty: true,
        shouldValidate: true,
      });

      requestAnimationFrame(() => {
        numeroInputRef.current?.focus();
      });
    } catch (lookupError) {
      if (requestId !== cepLookupRequestRef.current) {
        return;
      }

      lastResolvedCepRef.current = '';
      setError('cep', {
        type: 'manual',
        message:
          lookupError instanceof Error
            ? lookupError.message
            : 'Erro ao buscar CEP. Tente novamente.',
      });
    }
  };

  const validateCepField = (
    cepValue: string,
    options?: { showRequired?: boolean }
  ): boolean => {
    const cepDigits = cepValue.replace(/\D/g, '');

    if (!cepDigits.length) {
      if (options?.showRequired) {
        setError('cep', {
          type: 'manual',
          message: 'CEP é obrigatório',
        });
        return false;
      }

      clearErrors('cep');
      return true;
    }

    if (cepDigits.length !== 8) {
      setError('cep', {
        type: 'manual',
        message: 'CEP inválido',
      });
      return false;
    }

    clearErrors('cep');
    return true;
  };

  const getVehicleFields = (): Array<keyof OnboardingFormData> => {
    if (!isInstrutor && !possuiVeiculo) {
      return [];
    }

    const fields: Array<keyof OnboardingFormData> = [
      'veiculo_modelo',
      'veiculo_ano',
      'veiculo_placa',
    ];

    if (isInstrutor) {
      fields.unshift('veiculo_marca');
    }

    return fields;
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    if (currentStep === 0) {
      const personalFieldsWithoutCep = PERSONAL_FIELDS.filter(field => field !== 'cep');
      const isPersonalDataValid = await trigger(personalFieldsWithoutCep);
      const isCepValid = validateCepField(getValues('cep'), { showRequired: true });
      return isPersonalDataValid && isCepValid;
    }

    if (currentStep === 1) {
      return trigger(ACCOUNT_TYPE_FIELDS);
    }

    if (currentStep === 2) {
      if (isInstrutor && !getValues('possuiVeiculo')) {
        Alert.alert('Veículo obrigatório', 'Instrutores precisam cadastrar um veículo para seguir.');
        return false;
      }

      const vehicleFields = getVehicleFields();
      return vehicleFields.length ? trigger(vehicleFields) : true;
    }

    if (currentStep === 3) {
      const isStepValid = await trigger(INSTRUCTOR_FIELDS);
      if (!isStepValid) {
        return false;
      }

      if (!getValues('cnh_categorias').length) {
        Alert.alert('Categoria da CNH', 'Selecione pelo menos uma categoria de CNH.');
        return false;
      }
    }

    return true;
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      clearError();

      if (!sessionEmail) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

      if (!data.userType) {
        throw new Error('Selecione o tipo da conta');
      }

      const payload: RegisterUser = {
        userType: data.userType,
        nome: data.nome.trim(),
        sobrenome: data.sobrenome.trim(),
        email: sessionEmail,
        senha: '',
        cpf: data.cpf.replace(/\D/g, ''),
        telefone: data.telefone.replace(/\D/g, ''),
        data_nascimento: formatDateToApi(data.data_nascimento),
        rua: data.rua.trim(),
        numero: data.numero.trim(),
        bairro: data.bairro.trim(),
        cep: data.cep.replace(/\D/g, ''),
        cidade: data.cidade.trim(),
        estado: data.estado.trim().toUpperCase(),
      };

      if (data.possuiVeiculo || data.userType === 'instrutor') {
        payload.veiculo = {
          marca: data.veiculo_marca.trim() || undefined,
          modelo: data.veiculo_modelo.trim(),
          ano: Number(data.veiculo_ano),
          placa: data.veiculo_placa.trim().toUpperCase(),
          tipo_cambio: data.veiculo_tipo_cambio,
        };
      }

      if (data.userType === 'instrutor') {
        payload.cnh_numero = data.cnh_numero.trim();
        payload.cnh_categorias = data.cnh_categorias;
        payload.cnh_vencimento = formatDateToApi(data.cnh_vencimento);
        payload.valor_hora = Number(data.valor_hora.replace(/\D/g, '')) / 100;
        payload.bio = data.bio.trim() || undefined;
      }

      await completeOnboarding(payload);
      Alert.alert('Cadastro concluído', 'Seu perfil foi finalizado com sucesso.');
    } catch (submitError) {
      const errorMessage =
        submitError instanceof Error
          ? submitError.message
          : 'Falha ao concluir onboarding. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    }
  };

  const renderInput = (
    name: keyof OnboardingFormData,
    label: string,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'numeric' | 'phone-pad';
      formatter?: (value: string) => string;
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
      validator?: (value: string) => string | true;
      inputRef?: React.RefObject<TextInput | null>;
      onChangeText?: (value: string) => void;
      onBlur?: (value: string) => void;
    }
  ) => (
    <Controller
      control={control}
      name={name}
      rules={{
        validate:
          name === 'cep'
            ? undefined
            : value =>
                (options?.validator ?? validateRequired)(typeof value === 'string' ? value : ''),
      }}
      render={({ field: { onChange, onBlur, value } }) => (
        <FormInput
          ref={options?.inputRef}
          label={label}
          value={value as string}
          onChangeText={text => {
            const formattedValue = options?.formatter ? options.formatter(text) : text;
            onChange(formattedValue);
            options?.onChangeText?.(formattedValue);
          }}
          onBlur={() => {
            onBlur();
            options?.onBlur?.(value as string);
          }}
          placeholder={placeholder}
          keyboardType={options?.keyboardType}
          autoCapitalize={options?.autoCapitalize}
          error={errors[name]?.message as string | undefined}
        />
      )}
    />
  );

  const renderSelect = (
    name: keyof OnboardingFormData,
    label: string,
    placeholder: string,
    options: ReadonlyArray<{ label: string; value: string }>
  ) => (
    <Controller
      control={control}
      name={name}
      rules={{
        validate: value =>
          validateRequired(typeof value === 'string' ? value : ''),
      }}
      render={({ field: { onChange, value } }) => (
        <FormSelect
          label={label}
          placeholder={placeholder}
          options={[...options]}
          value={typeof value === 'string' ? value : undefined}
          onSelect={selectedValue => {
            onChange(selectedValue);
          }}
          error={errors[name]?.message as string | undefined}
        />
      )}
    />
  );

  const renderAccountTypeCard = (
    type: UserType,
    title: string,
    description: string,
    Icon: typeof UserRound
  ) => {
    const selected = userType === type;

    return (
      <TouchableOpacity
        key={type}
        style={[styles.accountTypeCard, selected && styles.accountTypeCardSelected]}
        onPress={() => {
          setValue('userType', type, { shouldValidate: true });
          if (type === 'instrutor') {
            setValue('possuiVeiculo', true);
          }
        }}
        activeOpacity={0.9}
      >
        <View style={[styles.accountTypeIcon, selected && styles.accountTypeIconSelected]}>
          <Icon
            size={30}
            color={selected ? theme.colors.primary[500] : theme.colors.text.secondary}
            strokeWidth={2.2}
          />
        </View>
        <Text style={styles.accountTypeTitle}>{title}</Text>
        <Text style={styles.accountTypeDescription}>{description}</Text>
      </TouchableOpacity>
    );
  };

  const renderRadioOption = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity style={styles.radioOption} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderPersonalStep = () => (
    <>
      <Text style={styles.panelTitle}>Informações Pessoais</Text>
      <Text style={styles.panelSubtitle}>
        Preencha seus dados básicos e endereço para iniciar o perfil.
      </Text>

      {sessionEmail ? (
        <View style={styles.sessionBanner}>
          <Text style={styles.sessionBannerLabel}>Conta autenticada</Text>
          <Text style={styles.sessionBannerValue}>{sessionEmail}</Text>
        </View>
      ) : null}

      {renderInput('nome', 'Nome', 'Seu nome')}
      {renderInput('sobrenome', 'Sobrenome', 'Seu sobrenome')}
      {renderInput('telefone', 'Telefone', '(00) 00000-0000', {
        keyboardType: 'phone-pad',
        formatter: formatTelefone,
        validator: validateTelefone,
      })}
      {renderInput('cpf', 'CPF', '000.000.000-00', {
        keyboardType: 'numeric',
        formatter: formatCPF,
        validator: validateCPF,
      })}
      {renderInput('data_nascimento', 'Data de Nascimento', 'dd/mm/aaaa', {
        keyboardType: 'numeric',
        formatter: formatDate,
        validator: validateDate,
      })}

      <Text style={styles.sectionLabel}>Endereço</Text>
      {renderInput('cep', 'CEP', '00000-000', {
        keyboardType: 'numeric',
        formatter: formatCEP,
        onChangeText: value => {
          const cepDigits = value.replace(/\D/g, '');
          cepLookupRequestRef.current += 1;
          clearErrors('cep');

          if (cepDigits.length < 8) {
            lastResolvedCepRef.current = '';
            return;
          }

          void lookupAddressByCep(value);
        },
        onBlur: value => {
          validateCepField(value);
        },
      })}
      {renderInput('rua', 'Rua', 'Nome da rua')}
      {renderInput('numero', 'Número', '123', {
        inputRef: numeroInputRef,
      })}
      {renderInput('bairro', 'Bairro', 'Nome do bairro')}
      {renderInput('cidade', 'Cidade', 'Nome da cidade')}
      {renderSelect('estado', 'Estado', 'Selecione o estado', BRAZILIAN_UF_OPTIONS)}
    </>
  );

  const renderAccountTypeStep = () => (
    <>
      <Text style={styles.panelTitle}>Tipo de Conta</Text>
      <Text style={styles.panelSubtitle}>
        Escolha se você está procurando aulas ou deseja ensinar alunos.
      </Text>

      <View style={styles.accountTypeList}>
        {renderAccountTypeCard(
          'aluno',
          'Aluno',
          'Estou buscando um instrutor para tirar minha CNH.',
          UserRound
        )}
        {renderAccountTypeCard(
          'instrutor',
          'Instrutor',
          'Sou instrutor e quero ensinar alunos.',
          GraduationCap
        )}
      </View>
    </>
  );

  const renderVehicleStep = () => (
    <>
      <Text style={styles.panelTitle}>Informações do Veículo</Text>
      <Text style={styles.panelSubtitle}>
        {isInstrutor
          ? 'Instrutores precisam cadastrar o veículo usado nas aulas.'
          : 'Se você tiver um veículo próprio, pode adicioná-lo agora.'}
      </Text>

      <Text style={styles.sectionLabel}>Possui veículo?</Text>
      <View style={styles.radioGroup}>
        {renderRadioOption('Sim', Boolean(possuiVeiculo), () =>
          setValue('possuiVeiculo', true, { shouldValidate: true })
        )}
        {renderRadioOption('Não', !possuiVeiculo, () =>
          setValue('possuiVeiculo', false, { shouldValidate: true })
        )}
      </View>

      {(possuiVeiculo || isInstrutor) && (
        <>
          {isInstrutor
            ? renderInput('veiculo_marca', 'Marca', 'Ex: Volkswagen')
            : null}
          {renderInput('veiculo_modelo', 'Modelo', 'Ex: Gol')}
          {renderInput('veiculo_ano', 'Ano', '2020', {
            keyboardType: 'numeric',
            validator: value => {
              if (!value) return 'Ano é obrigatório';
              return /^\d{4}$/.test(value) ? true : 'Ano inválido';
            },
          })}
          {renderInput('veiculo_placa', 'Placa', 'ABC1D23', {
            autoCapitalize: 'characters',
          })}

          <Text style={styles.sectionLabel}>Câmbio</Text>
          <View style={styles.choiceRow}>
            <TouchableOpacity
              style={[
                styles.choiceChip,
                getValues('veiculo_tipo_cambio') === 'MANUAL' && styles.choiceChipSelected,
              ]}
              onPress={() =>
                setValue('veiculo_tipo_cambio', 'MANUAL', { shouldValidate: true })
              }
            >
              <Text
                style={[
                  styles.choiceChipText,
                  getValues('veiculo_tipo_cambio') === 'MANUAL' &&
                    styles.choiceChipTextSelected,
                ]}
              >
                Manual
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.choiceChip,
                getValues('veiculo_tipo_cambio') === 'AUTOMATICO' &&
                  styles.choiceChipSelected,
              ]}
              onPress={() =>
                setValue('veiculo_tipo_cambio', 'AUTOMATICO', {
                  shouldValidate: true,
                })
              }
            >
              <Text
                style={[
                  styles.choiceChipText,
                  getValues('veiculo_tipo_cambio') === 'AUTOMATICO' &&
                    styles.choiceChipTextSelected,
                ]}
              >
                Automático
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </>
  );

  const renderInstructorStep = () => (
    <>
      <Text style={styles.panelTitle}>Informações do Instrutor</Text>
      <Text style={styles.panelSubtitle}>
        Complete seus dados profissionais para liberar o perfil de instrutor.
      </Text>

      {renderInput('cnh_numero', 'Número da CNH', '00000000000')}
      {renderInput('cnh_vencimento', 'Validade da CNH', 'dd/mm/aaaa', {
        keyboardType: 'numeric',
        formatter: formatDate,
        validator: validateDate,
      })}
      {renderInput('valor_hora', 'Valor por Hora (R$)', 'R$ 0,00', {
        keyboardType: 'numeric',
        formatter: formatCurrency,
        validator: value => (value ? true : 'Valor por hora é obrigatório'),
      })}

      <Text style={styles.sectionLabel}>Categorias da CNH</Text>
      <View style={styles.choiceRow}>
        {CNH_OPTIONS.map(option => {
          const isSelected = cnhCategorias.includes(option);

          return (
            <TouchableOpacity
              key={option}
              style={[styles.choiceChip, isSelected && styles.choiceChipSelected]}
              onPress={() => {
                const current = getValues('cnh_categorias');
                const next = isSelected
                  ? current.filter(item => item !== option)
                  : [...current, option];
                setValue('cnh_categorias', next, { shouldValidate: true });
              }}
            >
              <Text
                style={[
                  styles.choiceChipText,
                  isSelected && styles.choiceChipTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormInput
            label="Bio profissional"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Conte um pouco sobre sua experiência"
          />
        )}
      />
    </>
  );

  const stepContentItems: StepFlowItem[] = [
    { id: 'personal', render: renderPersonalStep },
    { id: 'account-type', render: renderAccountTypeStep },
    { id: 'vehicle', render: renderVehicleStep },
    ...(isInstrutor ? [{ id: 'instructor', render: renderInstructorStep }] : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image source={require('../../../assets/icon-transparent.png')} style={styles.brandImage} />
            <View>
              <Text style={styles.brandTitle}>Drivoo</Text> 
            </View>
          </View>
        </View>

          <OnboardingStepper steps={steps} currentStep={currentStep} />


        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.panel}>
          <StepFlow
            steps={stepContentItems}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onBeforeNext={validateCurrentStep}
            onBeforeBack={() => true}
            contentContainerStyle={styles.stepFlowContent}
            renderFooter={({ isFirstStep, isLastStep, goNext, goBack }) => (
              <View style={styles.actions}>
                {isFirstStep ? (
                  <View style={styles.secondaryButtonPlaceholder} />
                ) : (
                  <Button
                    title="Voltar"
                    variant="outline"
                    onPress={() => {
                      void goBack();
                    }}
                    style={styles.secondaryButton}
                  />
                )}

                <Button
                  title={carregando ? 'Salvando...' : isLastStep ? 'Concluir' : 'Próximo'}
                  onPress={() => {
                    if (isLastStep) {
                      void handleSubmit(onSubmit)();
                      return;
                    }

                    void goNext();
                  }}
                  disabled={carregando}
                  style={styles.primaryButton}
                />
              </View>
            )}
          />
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.md - theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing['2xl'],
  },
  header: {
    marginBottom: theme.spacing.sm,
    marginHorizontal: 'auto',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  brandTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.accent[500],
  },
  brandImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  brandSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: '#FFF1F0',
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.lg,
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.semantic.error,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
  },
  panel: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: 24,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md - theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.coolGray[200],
    gap: theme.spacing.md,
    ...theme.shadows.md,
  },
  stepFlowContent: {
    overflow: 'hidden',
  },
  panelTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  panelSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
    marginBottom: theme.spacing.sm,
  },
  sessionBanner: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borders.radius.lg,
    padding: theme.spacing.md - theme.spacing.xs,
  },
  sessionBannerLabel: {
    color: theme.colors.primary[700],
    fontSize: theme.typography.fontSize.xs,
    marginBottom: 2,
  },
  sessionBannerValue: {
    color: theme.colors.primary[700],
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  sectionLabel: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.md,
    marginTop: theme.spacing.xs,
  },
  accountTypeList: {
    gap: theme.spacing.md,
  },
  accountTypeCard: {
    borderWidth: 1.5,
    borderColor: theme.colors.coolGray[300],
    borderRadius: 22,
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.background.elevated,
  },
  accountTypeCardSelected: {
    borderColor: theme.colors.primary[300],
    backgroundColor: theme.colors.primary[50],
  },
  accountTypeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.coolGray[100],
    marginBottom: theme.spacing.md,
  },
  accountTypeIconSelected: {
    backgroundColor: theme.colors.background.elevated,
  },
  accountTypeTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  accountTypeDescription: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
    textAlign: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.coolGray[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary[500],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary[500],
  },
  radioLabel: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  choiceChip: {
    borderRadius: theme.borders.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.coolGray[300],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.elevated,
  },
  choiceChipSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  choiceChipText: {
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  choiceChipTextSelected: {
    color: theme.colors.primary[700],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.background.elevated,
    borderColor: theme.colors.coolGray[300],
  },
  secondaryButtonPlaceholder: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#05071E',
  },
});
