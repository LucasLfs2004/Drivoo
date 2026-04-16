import type {
  InstructorDetails,
} from '../features/instructors';

import { instructorDetailsApi } from '../features/instructors/api/instructorDetailsApi';
import { mapInstructorDetails } from '../features/instructors/mappers/mapInstructorDetails';

export const instructorService = {
  async getDetails(instructorId: string): Promise<InstructorDetails> {
    const response = await instructorDetailsApi.getDetails(instructorId);
    return mapInstructorDetails(response);
  },
};
