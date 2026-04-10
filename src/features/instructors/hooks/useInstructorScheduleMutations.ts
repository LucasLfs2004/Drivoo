import { useAppMutation } from '../../../shared/hooks';
import { instructorMutationOptions } from './mutationOptions';

export const useCreateInstructorAvailabilityMutation = () =>
  useAppMutation(instructorMutationOptions.createSchedule());

export const useUpdateInstructorAvailabilityMutation = () =>
  useAppMutation(instructorMutationOptions.updateSchedule());

export const useDeleteInstructorAvailabilityMutation = () =>
  useAppMutation(instructorMutationOptions.deleteSchedule());
