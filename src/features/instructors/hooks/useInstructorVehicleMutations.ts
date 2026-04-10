import { useAppMutation } from '../../../shared/hooks';
import { instructorMutationOptions } from './mutationOptions';

export const useCreateInstructorVehicleMutation = () =>
  useAppMutation(instructorMutationOptions.createVehicle());

export const useUpdateInstructorVehicleMutation = () =>
  useAppMutation(instructorMutationOptions.updateVehicle());

export const useDeleteInstructorVehicleMutation = () =>
  useAppMutation(instructorMutationOptions.deleteVehicle());
