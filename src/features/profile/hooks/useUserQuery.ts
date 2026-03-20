import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../../core/auth';
import type { Usuario } from '../../../types/auth';
import { userProfileApi } from '../api/userProfileApi';

export const useUserQuery = (): UseQueryResult<Usuario, Error> => {
  const { isAuthenticated, refreshCurrentUser, usuario } = useAuth();

  return useQuery({
    queryKey: ['profile', 'current-user'],
    queryFn: async () =>
      (await refreshCurrentUser()) ?? userProfileApi.getCurrentUser(),
    initialData: usuario ?? undefined,
    enabled: isAuthenticated,
  });
};
