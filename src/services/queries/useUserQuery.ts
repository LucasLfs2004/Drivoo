import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../userService';
import type { Usuario } from '../../types/auth';

/**
 * Hook to fetch current user data
 * Makes a GET request to /users/me endpoint
 * Only enabled when user is authenticated
 *
 * @returns UseQueryResult with user data, loading state, error, and refetch function
 *
 * @example
 * const { data: user, isLoading, error, refetch } = useUserQuery();
 *
 * if (isLoading) return <Text>Loading...</Text>;
 * if (error) return <Text>Error: {error.message}</Text>;
 * return <Text>Welcome, {user?.name}</Text>;
 */
export const useUserQuery = (): UseQueryResult<Usuario, Error> => {
    const { isAuthenticated, refreshCurrentUser, usuario } = useAuth();

    return useQuery({
        queryKey: ['current-user'],
        queryFn: async () => (await refreshCurrentUser()) ?? userService.getCurrentUser(),
        initialData: usuario ?? undefined,
        enabled: isAuthenticated,
    });
};
