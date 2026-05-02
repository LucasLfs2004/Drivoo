import { useAppMutation } from '../../../shared/hooks';
import { instructorMutationOptions } from './mutationOptions';

export const useUpdateInstructorFinancialMutation = () =>
  useAppMutation(instructorMutationOptions.updateFinancial());

export const useCreateStripeOnboardingLinkMutation = () =>
  useAppMutation(instructorMutationOptions.createStripeOnboardingLink());
