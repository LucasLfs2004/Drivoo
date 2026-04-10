import { authService, type LoginFlowResponse } from '../api/auth-service';
import type { LoginCredentials } from '../../../types/auth';
import { useAppMutation, type UseMutationResult } from '../../../shared/hooks';

export const useLoginMutation = (): UseMutationResult<
  LoginFlowResponse,
  Error,
  LoginCredentials
> =>
  useAppMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
  });

export const useRegisterMutation = (): UseMutationResult<never, Error, never> =>
  useAppMutation({
    mutationFn: async () => {
      throw new Error('Use o AuthContext.register para o fluxo de onboarding do Drivoo.');
    },
  });
