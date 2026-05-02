import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../shared/ui/base/AppHeader';
import { Button } from '../../../shared/ui/base/Button';
import { Card } from '../../../shared/ui/base/Card';
import { FormInput, FormSelect } from '../../../shared/ui/forms';
import { theme } from '../../../theme';
import type { InstrutorProfileStackParamList } from '../../../types/navigation';
import {
  mapInstructorFinancialFormToPayload,
} from '../mappers/mapInstructorFinancial';
import {
  useCreateStripeOnboardingLinkMutation,
  useUpdateInstructorFinancialMutation,
} from '../hooks/useInstructorFinancialMutations';
import { useInstructorFinancialQuery } from '../hooks/useInstructorFinancialQuery';
import type {
  InstructorFinancialFormValues,
  InstructorFiscalType,
} from '../types/domain';

type Props = NativeStackScreenProps<
  InstrutorProfileStackParamList,
  'FinancialSettings'
>;

const fiscalTypeOptions = [
  { label: 'Pessoa física', value: 'PF' },
  { label: 'MEI', value: 'MEI' },
];

const defaultFormValues: InstructorFinancialFormValues = {
  fiscalType: 'PF',
  cpf: '',
  phone: '',
  birthDate: '',
  contractAccepted: false,
  taxResponsibilityAccepted: false,
  cnpj: '',
  legalName: '',
  tradeName: '',
  fiscalAddress: '',
};

const formatCpfInput = (value: string) => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 11);

  if (cleanValue.length <= 3) return cleanValue;
  if (cleanValue.length <= 6) {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
  }
  if (cleanValue.length <= 9) {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(
      3,
      6
    )}.${cleanValue.slice(6)}`;
  }

  return `${cleanValue.slice(0, 3)}.${cleanValue.slice(
    3,
    6
  )}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9)}`;
};

const formatPhoneInput = (value: string) => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 11);

  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 7) {
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
  }
  if (cleanValue.length <= 10) {
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(
      2,
      6
    )}-${cleanValue.slice(6)}`;
  }

  return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(
    2,
    7
  )}-${cleanValue.slice(7)}`;
};

const formatBirthDateInput = (value: string) => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 8);

  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 4) {
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
  }

  return `${cleanValue.slice(0, 2)}/${cleanValue.slice(
    2,
    4
  )}/${cleanValue.slice(4)}`;
};

const formatAcceptedAt = (value?: string | null) => {
  if (!value) return null;

  const acceptedAt = new Date(value);
  if (Number.isNaN(acceptedAt.getTime())) {
    return value;
  }

  return acceptedAt.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusTone = (pendingCount: number, completedAt: string | null) => {
  if (completedAt && pendingCount === 0) {
    return {
      title: 'Recebimentos configurados',
      description: 'Sua conta está pronta para receber repasses.',
      color: theme.colors.semantic.success,
    };
  }

  if (pendingCount > 0) {
    return {
      title: 'Pendências financeiras',
      description: 'Complete os dados abaixo e finalize o onboarding na Stripe.',
      color: theme.colors.semantic.warning,
    };
  }

  return {
    title: 'Configuração em análise',
    description: 'Consulte o status após finalizar a etapa hospedada da Stripe.',
    color: theme.colors.semantic.info,
  };
};

const buildFormValues = (
  profile?: ReturnType<typeof useInstructorFinancialQuery>['data']
): InstructorFinancialFormValues => ({
  fiscalType: profile?.fiscalType ?? 'PF',
  cpf: profile?.cpf ?? '',
  phone: profile?.phone ?? '',
  birthDate: profile?.birthDate ?? '',
  contractAccepted: profile?.contractAccepted ?? false,
  taxResponsibilityAccepted: profile?.taxResponsibilityAccepted ?? false,
  cnpj: profile?.cnpj ?? '',
  legalName: profile?.legalName ?? '',
  tradeName: profile?.tradeName ?? '',
  fiscalAddress: profile?.fiscalAddress ?? '',
});

export const InstructorFinancialSettingsScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const stripeReturn = route.params?.stripeReturn;
  const financialQuery = useInstructorFinancialQuery();
  const updateFinancialMutation = useUpdateInstructorFinancialMutation();
  const createStripeLinkMutation = useCreateStripeOnboardingLinkMutation();
  const { refetch: refetchFinancialProfile } = financialQuery;
  const [formValues, setFormValues] =
    useState<InstructorFinancialFormValues>(defaultFormValues);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const contractAcceptedAt = financialQuery.data?.contractAcceptedAt ?? null;
  const taxResponsibilityAcceptedAt =
    financialQuery.data?.taxResponsibilityAcceptedAt ?? null;
  const isContractAcceptanceLocked = Boolean(contractAcceptedAt);
  const isTaxAcceptanceLocked = Boolean(taxResponsibilityAcceptedAt);
  const formattedContractAcceptedAt = formatAcceptedAt(contractAcceptedAt);
  const formattedTaxResponsibilityAcceptedAt = formatAcceptedAt(
    taxResponsibilityAcceptedAt
  );

  useEffect(() => {
    if (financialQuery.data && !isFormDirty) {
      setFormValues(buildFormValues(financialQuery.data));
    }
  }, [financialQuery.data, isFormDirty]);

  useEffect(() => {
    if (stripeReturn) {
      refetchFinancialProfile();
    }
  }, [refetchFinancialProfile, stripeReturn]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        refetchFinancialProfile();
      }
    });

    return () => subscription.remove();
  }, [refetchFinancialProfile]);

  const statusTone = useMemo(
    () =>
      getStatusTone(
        financialQuery.data?.pendingItems.length ?? 0,
        financialQuery.data?.stripeOnboardingCompletedAt ?? null
      ),
    [financialQuery.data]
  );

  const updateField = <TKey extends keyof InstructorFinancialFormValues>(
    field: TKey,
    value: InstructorFinancialFormValues[TKey]
  ) => {
    setIsFormDirty(true);
    setFormValues(current => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const missingFields: string[] = [];

    if (formValues.cpf.replace(/\D/g, '').length !== 11) {
      missingFields.push('CPF válido');
    }
    if (!/^(\d{10}|\d{11})$/.test(formValues.phone.replace(/\D/g, ''))) {
      missingFields.push('Telefone válido');
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formValues.birthDate.trim())) {
      missingFields.push('Data de nascimento no formato DD/MM/AAAA');
    }
    if (!formValues.contractAccepted) missingFields.push('Aceite contratual');
    if (!formValues.taxResponsibilityAccepted) {
      missingFields.push('Responsabilidade fiscal');
    }

    if (formValues.fiscalType === 'MEI') {
      if (!formValues.cnpj.trim()) missingFields.push('CNPJ');
      if (!formValues.legalName.trim()) missingFields.push('Razão social');
      if (!formValues.fiscalAddress.trim()) missingFields.push('Endereço fiscal');
    }

    return missingFields;
  };

  const handleSave = async () => {
    const missingFields = validateForm();

    if (missingFields.length) {
      Alert.alert(
        'Dados incompletos',
        `Preencha: ${missingFields.join(', ')}.`
      );
      return;
    }

    try {
      const payload = mapInstructorFinancialFormToPayload(formValues);
      const savedProfile = await updateFinancialMutation.mutateAsync(payload);
      setFormValues({
        ...buildFormValues(savedProfile),
        contractAccepted: payload.aceite_contratual,
        taxResponsibilityAccepted: payload.aceite_responsabilidade_fiscal,
      });
      setIsFormDirty(false);
      Alert.alert('Dados salvos', 'As informações financeiras foram atualizadas.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar os dados financeiros.';
      Alert.alert('Erro ao salvar', message);
    }
  };

  const handleOpenStripe = async () => {
    try {
      const link = await createStripeLinkMutation.mutateAsync();
      const canOpen = await Linking.canOpenURL(link.onboardingUrl);

      if (!canOpen) {
        throw new Error('Não foi possível abrir o link da Stripe.');
      }

      await Linking.openURL(link.onboardingUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar o onboarding da Stripe.';
      Alert.alert('Stripe indisponível', message);
    }
  };

  if (financialQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Carregando recebimentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Recebimentos"
          subtitle="Configure seus dados financeiros e a conta Stripe"
          onBackPress={() => navigation.goBack()}
        />

        {stripeReturn && (
          <Card style={styles.card}>
            <Text style={styles.returnTitle}>
              {stripeReturn === 'refresh'
                ? 'Link da Stripe expirado'
                : 'Retorno da Stripe'}
            </Text>
            <Text style={styles.returnText}>
              Atualizamos o status financeiro com o backend. Se ainda houver pendências,
              continue a configuração com um novo link da Stripe.
            </Text>
          </Card>
        )}

        <Card style={styles.card}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusDot, { backgroundColor: statusTone.color }]} />
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>{statusTone.title}</Text>
              <Text style={styles.statusDescription}>{statusTone.description}</Text>
            </View>
          </View>

          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Conta Stripe</Text>
              <Text style={styles.metaValue}>
                {financialQuery.data?.stripeAccountId ?? 'Não criada'}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Status</Text>
              <Text style={styles.metaValue}>
                {financialQuery.data?.stripeAccountStatus ?? 'pending'}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Elegibilidade</Text>
              <Text style={styles.metaValue}>
                {financialQuery.data?.eligibility ?? 'Pendente'}
              </Text>
            </View>
          </View>

          {!!financialQuery.data?.pendingItems.length && (
            <View style={styles.pendingBox}>
              <Text style={styles.pendingTitle}>Pendências</Text>
              {financialQuery.data.pendingItems.map(item => (
                <Text key={item} style={styles.pendingItem}>
                  {item}
                </Text>
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Dados fiscais</Text>
          <FormSelect
            label="Tipo fiscal"
            value={formValues.fiscalType}
            options={fiscalTypeOptions}
            onSelect={value => updateField('fiscalType', value as InstructorFiscalType)}
            required
          />
          <FormInput
            label="CPF"
            value={formValues.cpf}
            onChangeText={value => updateField('cpf', formatCpfInput(value))}
            keyboardType="number-pad"
            placeholder="000.000.000-00"
            required
          />
          <FormInput
            label="Telefone"
            value={formValues.phone}
            onChangeText={value => updateField('phone', formatPhoneInput(value))}
            keyboardType="phone-pad"
            placeholder="(00) 00000-0000"
            required
          />
          <FormInput
            label="Data de nascimento"
            value={formValues.birthDate}
            onChangeText={value =>
              updateField('birthDate', formatBirthDateInput(value))
            }
            keyboardType="number-pad"
            placeholder="dd/mm/aaaa"
            required
          />

          {formValues.fiscalType === 'MEI' && (
            <View style={styles.meiFields}>
              <FormInput
                label="CNPJ"
                value={formValues.cnpj}
                onChangeText={value => updateField('cnpj', value)}
                keyboardType="number-pad"
                placeholder="00000000000000"
                required
              />
              <FormInput
                label="Razão social"
                value={formValues.legalName}
                onChangeText={value => updateField('legalName', value)}
                required
              />
              <FormInput
                label="Nome fantasia"
                value={formValues.tradeName}
                onChangeText={value => updateField('tradeName', value)}
              />
              <FormInput
                label="Endereço fiscal"
                value={formValues.fiscalAddress}
                onChangeText={value => updateField('fiscalAddress', value)}
                required
              />
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Aceites</Text>
          <View style={styles.acceptanceRow}>
            <View style={styles.acceptanceInfo}>
              <Text style={styles.acceptanceTitle}>Aceite contratual</Text>
              <Text style={styles.acceptanceDescription}>
                Declaro estar de acordo com os termos comerciais do Drivoo.
              </Text>
              {formattedContractAcceptedAt && (
                <Text style={styles.acceptanceDate}>
                  Aceito em {formattedContractAcceptedAt}
                </Text>
              )}
            </View>
            <Switch
              value={formValues.contractAccepted}
              onValueChange={value => updateField('contractAccepted', value)}
              disabled={isContractAcceptanceLocked}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[500],
              }}
              thumbColor={theme.colors.background.primary}
            />
          </View>

          <View style={styles.acceptanceRow}>
            <View style={styles.acceptanceInfo}>
              <Text style={styles.acceptanceTitle}>Aceite fiscal</Text>
              <Text style={styles.acceptanceDescription}>
                Confirmo que os dados fiscais informados são corretos.
              </Text>
              {formattedTaxResponsibilityAcceptedAt && (
                <Text style={styles.acceptanceDate}>
                  Aceito em {formattedTaxResponsibilityAcceptedAt}
                </Text>
              )}
            </View>
            <Switch
              value={formValues.taxResponsibilityAccepted}
              onValueChange={value =>
                updateField('taxResponsibilityAccepted', value)
              }
              disabled={isTaxAcceptanceLocked}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary[500],
              }}
              thumbColor={theme.colors.background.primary}
            />
          </View>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Salvar dados financeiros"
            onPress={handleSave}
            loading={updateFinancialMutation.isPending}
            disabled={updateFinancialMutation.isPending}
          />
          <Button
            title="Configurar recebimentos com Stripe"
            variant="outline"
            onPress={handleOpenStripe}
            loading={createStripeLinkMutation.isPending}
            disabled={createStripeLinkMutation.isPending}
          />
          <Button
            title="Atualizar status"
            variant="ghost"
            onPress={() => financialQuery.refetch()}
            disabled={financialQuery.isFetching}
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
    gap: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    marginTop: theme.spacing.md,
  },
  card: {
    gap: theme.spacing.md,
  },
  returnTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  returnText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  statusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statusDot: {
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  statusContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  statusTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusDescription: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  metaList: {
    gap: theme.spacing.sm,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  metaValue: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'right',
  },
  pendingBox: {
    backgroundColor: theme.colors.warning[50],
    borderColor: theme.colors.warning[500],
    borderRadius: theme.borders.radius.md,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  pendingTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  pendingItem: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  meiFields: {
    gap: theme.spacing.xs,
  },
  acceptanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  acceptanceInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  acceptanceTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  acceptanceDescription: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  acceptanceDate: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.fontSize.xs,
    lineHeight: 16,
  },
  actions: {
    gap: theme.spacing.md,
  },
});
