import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            gcTime: 1000 * 60 * 10, // 10 minutos (antes: cacheTime)
            retry: 1,
            retryDelay: attemptIndex =>
                Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: 1,
            retryDelay: attemptIndex =>
                Math.min(1000 * 2 ** attemptIndex, 30000),
        },
    },
});
