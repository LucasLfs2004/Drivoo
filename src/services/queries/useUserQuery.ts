import { useQuery, UseQueryResult } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../auth/authContext';
import type { User } from '../api/types';

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
export const useUserQuery = (): UseQueryResult<User, Error> => {
    const { isSignedIn } = useAuth();

    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await apiClient.get<{ data: User }>('/users/me');
            return response.data.data;
        },
        enabled: isSignedIn,
    });
};
