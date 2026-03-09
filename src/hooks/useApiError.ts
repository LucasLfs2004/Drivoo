import { useState, useCallback } from 'react';
import {
    ApiError,
    isRetryableError,
} from '../services/api/errorHandler';

export interface UseApiErrorState {
    error: ApiError | null;
    isRetrying: boolean;
    retryCount: number;
    maxRetries: number;
}

export interface UseApiErrorActions {
    setError: (error: ApiError | null) => void;
    clearError: () => void;
    retry: (fn: () => Promise<void>) => Promise<void>;
    canRetry: () => boolean;
}

export type UseApiErrorReturn = UseApiErrorState & UseApiErrorActions;

const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Hook para gerenciar erros de API com retry automático
 * Suporta retry exponencial para erros de rede e servidor
 */
export function useApiError(
    maxRetries: number = DEFAULT_MAX_RETRIES
): UseApiErrorReturn {
    const [error, setError] = useState<ApiError | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const clearError = useCallback(() => {
        setError(null);
        setRetryCount(0);
    }, []);

    const canRetry = useCallback((): boolean => {
        if (!error) return false;
        if (retryCount >= maxRetries) return false;
        return isRetryableError(error);
    }, [error, retryCount, maxRetries]);

    const retry = useCallback(
        async (fn: () => Promise<void>) => {
            if (!canRetry()) {
                return;
            }

            setIsRetrying(true);

            try {
                // Exponential backoff: 1s, 2s, 4s, etc.
                const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
                await new Promise((resolve) => setTimeout(resolve, delay));

                await fn();
                clearError();
                setRetryCount(0);
            } catch (err) {
                setRetryCount((prev) => prev + 1);
                if (err instanceof Error) {
                    setError({
                        code: 'RETRY_FAILED',
                        message: err.message,
                        statusCode: 0,
                        type: 'unknown',
                    });
                }
            } finally {
                setIsRetrying(false);
            }
        },
        [canRetry, clearError, retryCount]
    );

    return {
        error,
        isRetrying,
        retryCount,
        maxRetries,
        setError,
        clearError,
        retry,
        canRetry,
    };
}
