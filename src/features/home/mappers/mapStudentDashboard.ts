import type {
  StudentDashboardApiResponse,
  StudentDashboardNextLessonApi,
} from '../types/api';
import type {
  StudentDashboard,
  StudentDashboardLessonStatus,
  StudentDashboardNextLesson,
} from '../types/domain';

const toNumber = (value: number | null | undefined): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return value;
};

const toString = (value: string | null | undefined, fallback = ''): string => {
  if (!value) {
    return fallback;
  }

  return value;
};

const toDate = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const mapLessonStatus = (
  status: string | null | undefined
): StudentDashboardLessonStatus => {
  if (status === 'CONFIRMADO') {
    return 'confirmed';
  }

  if (status === 'AGENDADO') {
    return 'scheduled';
  }

  return 'unknown';
};

const mapNextLesson = (
  lesson: StudentDashboardNextLessonApi | null | undefined
): StudentDashboardNextLesson | null => {
  if (!lesson) {
    return null;
  }

  const firstName = toString(lesson.instrutor?.nome, 'Instrutor');
  const lastName = toString(lesson.instrutor?.sobrenome);
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const apiStatus = toString(lesson.status, 'DESCONHECIDO');

  return {
    id: toString(lesson.id),
    instructor: {
      id: toString(lesson.instrutor?.id),
      firstName,
      lastName,
      fullName,
      avatarUrl: lesson.instrutor?.foto_url ?? undefined,
    },
    startAt: toDate(lesson.inicio),
    endAt: toDate(lesson.fim),
    status: mapLessonStatus(lesson.status),
    apiStatus,
    address: {
      full: toString(lesson.endereco?.completo, 'Endereço a confirmar'),
      neighborhood: lesson.endereco?.bairro ?? undefined,
      city: lesson.endereco?.cidade ?? undefined,
      state: lesson.endereco?.estado ?? undefined,
      zipCode: lesson.endereco?.cep ?? undefined,
    },
    vehicle: {
      model: toString(lesson.veiculo?.modelo, 'Veículo a confirmar'),
      transmission: lesson.veiculo?.tipo_cambio ?? undefined,
    },
  };
};

export const mapStudentDashboard = (
  response: StudentDashboardApiResponse
): StudentDashboard => ({
  type: 'aluno',
  nextLesson: mapNextLesson(response.proxima_aula),
  progress: {
    completedLessons: toNumber(response.progresso?.aulas_concluidas),
    practiceHours: toNumber(response.progresso?.horas_pratica),
    lastLessonAt: toDate(response.progresso?.ultima_aula),
  },
  bookingSummary: {
    upcoming: toNumber(response.resumo_agendamentos?.proximas),
    completed: toNumber(response.resumo_agendamentos?.concluidas),
    canceled: toNumber(response.resumo_agendamentos?.canceladas),
  },
  stats: {
    uniqueInstructors: toNumber(response.estatisticas?.instrutores_diferentes),
    averageRatingGiven: toNumber(response.estatisticas?.avaliacao_media_dada),
  },
});
