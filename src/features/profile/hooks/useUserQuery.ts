import { useAuth } from '../../../core/auth';
import type { Usuario } from '../../../types/auth';
import { useAppQuery, type UseQueryResult } from '../../../shared/hooks';
import { userProfileApi } from '../api/userProfileApi';

export const useUserQuery = (): UseQueryResult<Usuario, Error> => {
  const { isAuthenticated, refreshCurrentUser, usuario, needsOnboarding } = useAuth();

  return useAppQuery({
    queryKey: ['profile', 'current-user'],
    queryFn: async () =>
      (await refreshCurrentUser()) ?? userProfileApi.getCurrentUser(),
    initialData: usuario ?? undefined,
    enabled: isAuthenticated && !needsOnboarding,
  });
};
