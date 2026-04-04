import type { AgendaSemanal, SlotTempo } from '../../../types/auth';
import type {
  InstructorSchedule,
  InstructorAvailability,
} from '../types/domain';
import type {
  InstructorScheduleAvailabilityApiResponse,
  MyInstructorScheduleApiResponse,
} from '../types/api';

const DEFAULT_TIME_SLOTS: SlotTempo[] = [
  { horaInicio: '08:00', horaFim: '10:00', disponivel: false },
  { horaInicio: '10:00', horaFim: '12:00', disponivel: false },
  { horaInicio: '14:00', horaFim: '16:00', disponivel: false },
  { horaInicio: '16:00', horaFim: '18:00', disponivel: false },
  { horaInicio: '18:00', horaFim: '20:00', disponivel: false },
];

const dayIndexToKey = [
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
  'domingo',
] as const;

const createDefaultAgenda = (): AgendaSemanal => ({
  segunda: { disponivel: false, horarios: DEFAULT_TIME_SLOTS.map(slot => ({ ...slot })) },
  terca: { disponivel: false, horarios: DEFAULT_TIME_SLOTS.map(slot => ({ ...slot })) },
  quarta: { disponivel: false, horarios: DEFAULT_TIME_SLOTS.map(slot => ({ ...slot })) },
  quinta: { disponivel: false, horarios: DEFAULT_TIME_SLOTS.map(slot => ({ ...slot })) },
  sexta: { disponivel: false, horarios: DEFAULT_TIME_SLOTS.map(slot => ({ ...slot })) },
  sabado: { disponivel: false, horarios: DEFAULT_TIME_SLOTS.map(slot => ({ ...slot })) },
  domingo: { disponivel: false, horarios: DEFAULT_TIME_SLOTS.map(slot => ({ ...slot })) },
});

const normalizeTime = (value: string) => value.slice(0, 5);

const mapAvailability = (
  availability: InstructorScheduleAvailabilityApiResponse
): InstructorAvailability => ({
  id: availability.id,
  dayIndex: availability.dia_semana,
  dayName: availability.dia_nome,
  startTime: normalizeTime(availability.hora_inicio),
  endTime: normalizeTime(availability.hora_fim),
  breakStart: availability.intervalo_inicio
    ? normalizeTime(availability.intervalo_inicio)
    : undefined,
  breakEnd: availability.intervalo_fim
    ? normalizeTime(availability.intervalo_fim)
    : undefined,
  active: availability.ativo,
});

export const mapInstructorSchedule = (
  response: MyInstructorScheduleApiResponse
): InstructorSchedule => {
  const availabilities = response.map(mapAvailability);
  const agenda = createDefaultAgenda();

  for (const availability of availabilities) {
    const dayKey = dayIndexToKey[availability.dayIndex];
    if (!dayKey) {
      continue;
    }

    const dayAgenda = agenda[dayKey];
    dayAgenda.disponivel = dayAgenda.disponivel || availability.active;

    const existingSlotIndex = dayAgenda.horarios.findIndex(
      slot =>
        slot.horaInicio === availability.startTime &&
        slot.horaFim === availability.endTime
    );

    if (existingSlotIndex >= 0) {
      dayAgenda.horarios[existingSlotIndex] = {
        ...dayAgenda.horarios[existingSlotIndex],
        disponivel: availability.active,
      };
      continue;
    }

    dayAgenda.horarios.push({
      horaInicio: availability.startTime,
      horaFim: availability.endTime,
      disponivel: availability.active,
    });
  }

  return {
    agenda,
    availabilities,
  };
};
