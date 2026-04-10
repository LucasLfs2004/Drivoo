import { useAppMutation } from '../../../shared/hooks';
import { instructorMutationOptions } from './mutationOptions';

export const useInstructorProfileUpdateMutation = () =>
  useAppMutation(instructorMutationOptions.updateProfile());
