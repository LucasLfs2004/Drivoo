import { useAppMutation } from '../../../shared/hooks';
import { instructorMutationOptions } from './mutationOptions';

export const useSaveInstructorAvailabilityMutation = () =>
  useAppMutation(instructorMutationOptions.saveAvailability());
