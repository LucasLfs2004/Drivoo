import type {
  InstructorAvailableSlot,
  InstructorDetails,
} from '../features/instructors';

import { instructorAvailabilityApi } from '../features/instructors/api/instructorAvailabilityApi';
import { instructorDetailsApi } from '../features/instructors/api/instructorDetailsApi';
import { mapInstructorAvailableSlot } from '../features/instructors/mappers/mapInstructorAvailableSlots';
import { mapInstructorDetails } from '../features/instructors/mappers/mapInstructorDetails';

export const instructorService = {
  async getDetails(instructorId: string): Promise<InstructorDetails> {
    const response = await instructorDetailsApi.getDetails(instructorId);
    return mapInstructorDetails(response);
  },

  async getAvailableSlots(
    instructorId: string,
    date: string,
    durationMinutes = 60
  ): Promise<InstructorAvailableSlot[]> {
    const response = await instructorAvailabilityApi.getAvailableSlots(
      instructorId,
      date,
      durationMinutes
    );

    return response.horarios.map(mapInstructorAvailableSlot);
  },
};
