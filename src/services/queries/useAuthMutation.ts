import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { authService } from '../auth/authService';
import {
    LoginCredentials,
    RegisterCredentials,
    LoginResponse,
    RegisterResponse,
} from '../api/types';

/**
 * Hook for login mutation
 * Handles user login with email and password
 * Automatically stores tokens on success
 *
 * @returns UseMutationResult with login mutation state and functions
 *
 * Usage:
 * ```
 * const { mutate, isPending, error, data } = useLoginMutation();
 *
 * const handleLogin = async (email: string, password: string) => {
 *   mutate({ email, password });
 * };
 * ```
 *
 * Validates: Requirements 2.1, 2.2
 */
export const useLoginMutation = (): UseMutationResult<
    LoginResponse,
    Error,
    LoginCredentials
> => {
    return useMutation({
        mutationFn: (credentials: LoginCredentials) =>
            authService.login(credentials),
    });
};

/**
 * Hook for register mutation
 * Handles user registration with name, email, password, and user type
 * Automatically stores tokens on success
 *
 * @returns UseMutationResult with register mutation state and functions
 *
 * Usage:
 * ```
 * const { mutate, isPending, error, data } = useRegisterMutation();
 *
 * const handleRegister = async (
 *   name: string,
 *   email: string,
 *   password: string,
 *   userType: 'student' | 'instructor' | 'admin'
 * ) => {
 *   mutate({ name, email, password, userType });
 * };
 * ```
 *
 * Validates: Requirements 2.1, 2.2
 */
export const useRegisterMutation = (): UseMutationResult<
    RegisterResponse,
    Error,
    RegisterCredentials
> => {
    return useMutation({
        mutationFn: (credentials: RegisterCredentials) =>
            authService.register(credentials),
    });
};
