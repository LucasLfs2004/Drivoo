import {
  mapInstructorFinancialFormToPayload,
  mapInstructorFinancialProfile,
  mapInstructorStripeOnboardingLink,
} from '../src/features/instructors/mappers/mapInstructorFinancial';
import { mapInstructorFinancialSummary as mapInstructorEarningsFinancialSummary } from '../src/features/instructors/mappers/mapInstructorEarnings';

describe('Instructor financial mapping', () => {
  it('maps financial summary response to domain model', () => {
    expect(
      mapInstructorEarningsFinancialSummary({
        instrutor_id: 'instrutor-1',
        periodo: {
          data_inicio: '2026-04-01',
          data_fim: '2026-04-30',
          dias: 30,
        },
        financeiro: {
          recebido: 1240,
          disponivel_para_repasse: 320,
          em_processamento: 100,
          a_liberar: 580,
          bloqueado_em_analise: 180,
          falha_repasse: 0,
          previsto_aulas_futuras_confirmadas: 1100,
          valor_concluido_periodo: 1240,
          valor_concluido_periodo_anterior: 1000,
          variacao_concluido_percentual: 24,
        },
        aulas_futuras_confirmadas: {
          quantidade: 8,
          valor_instrutor: 1100,
        },
        periodo_resumo: {
          aulas_no_periodo: 20,
          aulas_criadas: 12,
          aulas_agendadas: 8,
          aulas_previstas: 10,
          aulas_concluidas: 9,
          aulas_canceladas: 2,
          nao_compareceu: 1,
          valor_agendado: 900,
          valor_concluido: 1240,
          valor_previsto: 1300,
        },
        evolucao_financeira: {
          tipo: 'acumulado',
          total: 1240,
          pontos: [
            {
              data: '2026-04-01',
              valor: 240,
              acumulado: 240,
              quantidade_aulas: 2,
            },
            {
              data: '2026-04-15',
              valor: 1000,
              acumulado: 1240,
              quantidade_aulas: 7,
            },
          ],
        },
        resumo_aulas_por_status: [
          {
            status: 'CONCLUIDA',
            label: 'Concluídas',
            quantidade: 9,
          },
        ],
        aulas_recentes: [
          {
            id: 'aula-1',
            data: '2026-04-15',
            hora_inicio: '14:00',
            hora_fim: '15:00',
            duracao_minutos: 60,
            aluno: {
              id: 'aluno-1',
              nome: 'João Silva',
              foto_url: null,
            },
            status: 'CONCLUIDA',
            status_label: 'Concluída',
            local: {
              resumo: 'Centro - SP',
              bairro: 'Centro',
              cidade: 'São Paulo',
              estado: 'SP',
              endereco_completo: 'Rua Teste, 123',
            },
            valor_instrutor: 127.5,
            valor_total: 150,
            avaliado: true,
          },
        ],
      }),
    ).toEqual({
      instructorId: 'instrutor-1',
      period: {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        days: 30,
      },
      amounts: {
        received: 1240,
        completedInPeriod: 1240,
        completedInPreviousPeriod: 1000,
        completedVariationPercent: 24,
        availableForPayout: 320,
        processing: 100,
        toRelease: 580,
        blockedUnderReview: 180,
        payoutFailed: 0,
        forecastFutureConfirmedLessons: 1100,
      },
      futureConfirmedLessons: {
        count: 8,
        instructorAmount: 1100,
      },
      periodMovement: {
        lessonsInPeriod: 20,
        created: 12,
        scheduled: 8,
        forecasted: 10,
        completed: 9,
        canceled: 2,
        noShow: 1,
        scheduledAmount: 900,
        completedAmount: 1240,
        forecastedAmount: 1300,
      },
      financialEvolution: {
        type: 'acumulado',
        total: 1240,
        points: [
          {
            id: '2026-04-01',
            date: '2026-04-01',
            label: '01/04',
            value: 240,
            accumulated: 240,
            lessonsCount: 2,
          },
          {
            id: '2026-04-15',
            date: '2026-04-15',
            label: '15/04',
            value: 1000,
            accumulated: 1240,
            lessonsCount: 7,
          },
        ],
      },
      lessonsByStatus: [
        {
          id: 'CONCLUIDA',
          status: 'CONCLUIDA',
          label: 'Concluídas',
          count: 9,
        },
      ],
      recentLessons: [
        {
          id: 'aula-1',
          date: '2026-04-15',
          startTime: '14:00',
          endTime: '15:00',
          durationMinutes: 60,
          student: {
            id: 'aluno-1',
            name: 'João Silva',
            avatar: undefined,
          },
          status: 'CONCLUIDA',
          statusLabel: 'Concluída',
          location: {
            summary: 'Centro - SP',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            fullAddress: 'Rua Teste, 123',
          },
          instructorAmount: 127.5,
          totalAmount: 150,
          evaluated: true,
        },
      ],
      isEmpty: false,
    });
  });

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
      }),
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
      }),
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
      }),
    ).toEqual({
      instructorId: 'instrutor-1',
      stripeAccountId: 'acct_123',
      onboardingUrl: 'https://connect.stripe.com/setup/test',
      expiresAt: '2026-05-01T10:00:00Z',
      createdAccount: true,
    });
  });
});
