import type { InstructorAvailableSlot } from '../types/domain';

export const mapInstructorAvailableSlot = (
  slot: string | { horario?: string; hora?: string; disponivel?: boolean },
  index: number
): InstructorAvailableSlot => {
  if (typeof slot === 'string') {
    return {
      id: `${slot}-${index}`,
      time: slot,
      available: true,
    };
  }

  const time = slot.horario ?? slot.hora ?? `${index}:00`;

  return {
    id: `${time}-${index}`,
    time,
    available: slot.disponivel ?? true,
  };
};
