import {
  mapInstructorFinancialFormToPayload,
  mapInstructorFinancialProfile,
  mapInstructorStripeOnboardingLink,
} from '../src/features/instructors/mappers/mapInstructorFinancial';

describe('Instructor financial mapping', () => {
  it('maps financial profile response to domain model', () => {
    expect(
      mapInstructorFinancialProfile({
        stripe_account_id: 'acct_123',
        status_conta_stripe: 'pending',
        tipo_fiscal: 'PF',
        elegibilidade_financeira: 'pendente',
        pendencias: ['stripe_onboarding_pendente'],
        cpf: '00000000000',
        telefone: '11999999999',
        data_nascimento: '1990-01-01',
        aceite_contratual_em: '2026-05-02T10:00:00Z',
        aceite_responsabilidade_fiscal_em: '2026-05-02T10:05:00Z',
        stripe_requirements_pendentes: ['external_account'],
      })
    ).toEqual({
      stripeAccountId: 'acct_123',
      stripeAccountStatus: 'pending',
      fiscalType: 'PF',
      eligibility: 'pendente',
      pendingItems: ['stripe_onboarding_pendente'],
      cpf: '000.000.000-00',
      phone: '(11) 99999-9999',
      birthDate: '01/01/1990',
      contractAccepted: true,
      taxResponsibilityAccepted: true,
      contractAcceptedAt: '2026-05-02T10:00:00Z',
      taxResponsibilityAcceptedAt: '2026-05-02T10:05:00Z',
      cnpj: '',
      legalName: '',
      tradeName: '',
      fiscalAddress: '',
      stripePendingRequirements: ['external_account'],
      stripeOnboardingCompletedAt: null,
    });
  });

  it('maps MEI form values to backend payload', () => {
    expect(
      mapInstructorFinancialFormToPayload({
        fiscalType: 'MEI',
        cpf: '000.000.000-00',
        phone: '(11) 99999-9999',
        birthDate: '01/01/1990',
        contractAccepted: true,
        taxResponsibilityAccepted: true,
        cnpj: '00000000000000',
        legalName: 'Nome Empresarial',
        tradeName: 'Nome Fantasia',
        fiscalAddress: 'Rua X, 123',
      })
    ).toEqual({
      tipo_fiscal: 'MEI',
      cpf: '00000000000',
      telefone: '11999999999',
      data_nascimento: '1990-01-01',
      aceite_contratual: true,
      aceite_responsabilidade_fiscal: true,
      cnpj: '00000000000000',
      razao_social: 'Nome Empresarial',
      nome_fantasia: 'Nome Fantasia',
      endereco_fiscal: 'Rua X, 123',
    });
  });

  it('maps Stripe onboarding link response', () => {
    expect(
      mapInstructorStripeOnboardingLink({
        instrutor_id: 'instrutor-1',
        stripe_account_id: 'acct_123',
        onboarding_url: 'https://connect.stripe.com/setup/test',
        expires_at: '2026-05-01T10:00:00Z',
        created_account: true,
      })
    ).toEqual({
      instructorId: 'instrutor-1',
      stripeAccountId: 'acct_123',
      onboardingUrl: 'https://connect.stripe.com/setup/test',
      expiresAt: '2026-05-01T10:00:00Z',
      createdAccount: true,
    });
  });
});
