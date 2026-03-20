import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { authService } from '../api/authService';
import {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  RegisterResponse,
} from '../../../services/api/types';

export const useLoginMutation = (): UseMutationResult<
  LoginResponse,
  Error,
  LoginCredentials
> =>
  useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
  });

export const useRegisterMutation = (): UseMutationResult<
  RegisterResponse,
  Error,
  RegisterCredentials
> =>
  useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      authService.register(credentials),
  });
