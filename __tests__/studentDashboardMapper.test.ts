import { mapStudentDashboard } from '../src/features/home/mappers/mapStudentDashboard';

describe('Student dashboard mapper', () => {
  it('maps the current /dashboard/aluno response into the home domain model', () => {
    const dashboard = mapStudentDashboard({
      tipo: 'aluno',
      proxima_aula: {
        id: 'booking-1',
        instrutor: {
          id: 'instructor-1',
          nome: 'Ana',
          sobrenome: 'Souza',
          foto_url: 'https://example.com/ana.jpg',
        },
        inicio: '2026-05-03T13:00:00.000Z',
        fim: '2026-05-03T14:00:00.000Z',
        status: 'CONFIRMADO',
        endereco: {
          completo: 'Rua Teste, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000',
        },
        veiculo: {
          modelo: 'Honda Fit',
          tipo_cambio: 'MANUAL',
        },
      },
      progresso: {
        aulas_concluidas: 4,
        horas_pratica: 6.5,
        ultima_aula: '2026-04-30T10:00:00.000Z',
      },
      resumo_agendamentos: {
        proximas: 1,
        concluidas: 4,
        canceladas: 2,
      },
      estatisticas: {
        instrutores_diferentes: 2,
        avaliacao_media_dada: 4.5,
      },
    });

    expect(dashboard.type).toBe('aluno');
    expect(dashboard.nextLesson?.id).toBe('booking-1');
    expect(dashboard.nextLesson?.status).toBe('confirmed');
    expect(dashboard.nextLesson?.instructor.fullName).toBe('Ana Souza');
    expect(dashboard.nextLesson?.address.full).toBe('Rua Teste, 123');
    expect(dashboard.nextLesson?.vehicle.transmission).toBe('MANUAL');
    expect(dashboard.progress.completedLessons).toBe(4);
    expect(dashboard.progress.practiceHours).toBe(6.5);
    expect(dashboard.bookingSummary.upcoming).toBe(1);
    expect(dashboard.bookingSummary.completed).toBe(4);
    expect(dashboard.bookingSummary.canceled).toBe(2);
    expect(dashboard.stats.uniqueInstructors).toBe(2);
    expect(dashboard.stats.averageRatingGiven).toBe(4.5);
  });

  it('keeps the home stable when optional dashboard sections are missing', () => {
    const dashboard = mapStudentDashboard({
      tipo: 'aluno',
      proxima_aula: null,
    });

    expect(dashboard.nextLesson).toBeNull();
    expect(dashboard.progress.completedLessons).toBe(0);
    expect(dashboard.progress.practiceHours).toBe(0);
    expect(dashboard.bookingSummary.upcoming).toBe(0);
    expect(dashboard.stats.averageRatingGiven).toBe(0);
  });
});
