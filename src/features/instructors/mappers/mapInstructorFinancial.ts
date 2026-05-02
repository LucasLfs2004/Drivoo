import type {
  InstructorFinancialApiResponse,
  InstructorFinancialUpdateApiRequest,
  InstructorStripeOnboardingLinkApiResponse,
} from '../types/api';
import type {
  InstructorFinancialFormValues,
  InstructorFinancialProfile,
  InstructorStripeOnboardingLink,
} from '../types/domain';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const formatCpfToDisplay = (value?: string | null): string => {
  const digits = onlyDigits(value ?? '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9
  )}-${digits.slice(9)}`;
};

const formatPhoneToDisplay = (value?: string | null): string => {
  const digits = onlyDigits(value ?? '').slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatApiDateToDisplay = (value?: string | null): string => {
  if (!value) return '';

  const trimmedValue = value.trim();
  const isoDateMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!isoDateMatch) {
    return trimmedValue;
  }

  const [, year, month, day] = isoDateMatch;
  return `${day}/${month}/${year}`;
};

const formatDisplayDateToApi = (value: string): string => {
  const trimmedValue = value.trim();
  const displayDateMatch = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!displayDateMatch) {
    return trimmedValue;
  }

  const [, day, month, year] = displayDateMatch;
  return `${year}-${month}-${day}`;
};

export const mapInstructorFinancialProfile = (
  response: InstructorFinancialApiResponse
): InstructorFinancialProfile => ({
  stripeAccountId: response.stripe_account_id ?? null,
  stripeAccountStatus: response.status_conta_stripe ?? 'pending',
  fiscalType: response.tipo_fiscal ?? null,
  eligibility: response.elegibilidade_financeira ?? null,
  pendingItems: response.pendencias ?? [],
  cpf: formatCpfToDisplay(response.cpf),
  phone: formatPhoneToDisplay(response.telefone),
  birthDate: formatApiDateToDisplay(response.data_nascimento),
  contractAccepted: Boolean(
    response.aceite_contratual_em ?? response.aceite_contratual
  ),
  taxResponsibilityAccepted: Boolean(
    response.aceite_responsabilidade_fiscal_em ??
      response.aceite_responsabilidade_fiscal
  ),
  contractAcceptedAt: response.aceite_contratual_em ?? null,
  taxResponsibilityAcceptedAt:
    response.aceite_responsabilidade_fiscal_em ?? null,
  cnpj: response.cnpj ?? '',
  legalName: response.razao_social ?? '',
  tradeName: response.nome_fantasia ?? '',
  fiscalAddress: response.endereco_fiscal ?? '',
  stripePendingRequirements: response.stripe_requirements_pendentes ?? [],
  stripeOnboardingCompletedAt: response.stripe_onboarding_completed_at ?? null,
});

export const mapInstructorFinancialFormToPayload = (
  values: InstructorFinancialFormValues
): InstructorFinancialUpdateApiRequest => ({
  tipo_fiscal: values.fiscalType,
  cpf: onlyDigits(values.cpf),
  telefone: onlyDigits(values.phone),
  data_nascimento: formatDisplayDateToApi(values.birthDate),
  aceite_contratual: values.contractAccepted,
  aceite_responsabilidade_fiscal: values.taxResponsibilityAccepted,
  ...(values.fiscalType === 'MEI'
    ? {
        cnpj: values.cnpj.trim(),
        razao_social: values.legalName.trim(),
        nome_fantasia: values.tradeName.trim() || null,
        endereco_fiscal: values.fiscalAddress.trim(),
      }
    : {
        cnpj: null,
        razao_social: null,
        nome_fantasia: null,
        endereco_fiscal: null,
      }),
});

export const mapInstructorStripeOnboardingLink = (
  response: InstructorStripeOnboardingLinkApiResponse
): InstructorStripeOnboardingLink => ({
  instructorId: response.instrutor_id,
  stripeAccountId: response.stripe_account_id,
  onboardingUrl: response.onboarding_url,
  expiresAt: response.expires_at,
  createdAccount: response.created_account,
});
