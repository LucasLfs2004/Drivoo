/**
 * Error Handling Components - Usage Examples
 *
 * This file demonstrates how to use the error handling components
 * and hooks in your application.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ErrorAlert } from '../ErrorAlert';
import { ErrorBoundary } from '../ErrorBoundary';
import { Button } from '../Button';
import { Typography } from '../Typography';
import { useApiError } from '../../../hooks/useApiError';
import { theme } from '../../../themes';
import { ApiError } from '../../../services/api/errorHandler';

/**
 * Example 1: Using ErrorAlert for displaying API errors
 */
export const ErrorAlertExample: React.FC = () => {
    const [showError, setShowError] = useState(false);

    const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        statusCode: 0,
        type: 'network',
    };

    return (
        <View style={styles.container}>
            <Typography variant="h4" weight="semibold" style={styles.title}>
                ErrorAlert Example
            </Typography>

            {showError && (
                <ErrorAlert
                    title="Erro de Conexão"
                    message={networkError.message}
                    onRetry={() => {
                        console.log('Retrying...');
                        setShowError(false);
                    }}
                    onDismiss={() => setShowError(false)}
                    retryLabel="Tentar Novamente"
                    dismissLabel="Descartar"
                />
            )}

            <Button
                title="Mostrar Erro"
                onPress={() => setShowError(true)}
                variant="primary"
            />
        </View>
    );
};

/**
 * Example 2: Using ErrorBoundary to catch component errors
 */
export const ErrorBoundaryExample: React.FC = () => {
    const [shouldThrow, setShouldThrow] = useState(false);

    const ThrowingComponent = () => {
        if (shouldThrow) {
            throw new Error('Erro intencional para demonstração');
        }
        return (
            <View>
                <Typography variant="body">Componente funcionando normalmente</Typography>
                <Button
                    title="Simular Erro"
                    onPress={() => setShouldThrow(true)}
                    variant="destructive"
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Typography variant="h4" weight="semibold" style={styles.title}>
                ErrorBoundary Example
            </Typography>

            <ErrorBoundary
                onError={(error, errorInfo) => {
                    console.error('Error caught by boundary:', error);
                }}
            >
                <ThrowingComponent />
            </ErrorBoundary>
        </View>
    );
};

/**
 * Example 3: Using useApiError hook for retry logic
 */
export const UseApiErrorExample: React.FC = () => {
    const { error, isRetrying, retryCount, canRetry, setError, clearError, retry } =
        useApiError(3);

    const simulateApiCall = async () => {
        try {
            // Simulate API call that fails
            throw new Error('API request failed');
        } catch (err) {
            const apiError: ApiError = {
                code: 'API_ERROR',
                message: 'Falha ao buscar dados',
                statusCode: 500,
                type: 'server',
            };
            setError(apiError);
        }
    };

    const handleRetry = async () => {
        await retry(simulateApiCall);
    };

    return (
        <View style={styles.container}>
            <Typography variant="h4" weight="semibold" style={styles.title}>
                useApiError Hook Example
            </Typography>

            {error && (
                <View style={styles.errorInfo}>
                    <Typography variant="body" color="error">
                        Erro: {error.message}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                        Tentativas: {retryCount}/3
                    </Typography>
                </View>
            )}

            <View style={styles.buttonGroup}>
                <Button
                    title="Simular Erro de API"
                    onPress={simulateApiCall}
                    variant="primary"
                />
                {canRetry() && (
                    <Button
                        title={`Tentar Novamente (${retryCount})`}
                        onPress={handleRetry}
                        loading={isRetrying}
                        variant="secondary"
                    />
                )}
                {error && (
                    <Button
                        title="Limpar Erro"
                        onPress={clearError}
                        variant="outline"
                    />
                )}
            </View>
        </View>
    );
};

/**
 * Example 4: Complete error handling flow
 */
export const CompleteErrorHandlingExample: React.FC = () => {
    const [error, setError] = useState<ApiError | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { error: apiError, retry, canRetry, clearError } = useApiError();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('Network timeout'));
                }, 2000);
            });
        } catch (err) {
            const apiError: ApiError = {
                code: 'NETWORK_ERROR',
                message: 'Falha na conexão. Tente novamente.',
                statusCode: 0,
                type: 'network',
            };
            setError(apiError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ErrorBoundary>
            <View style={styles.container}>
                <Typography variant="h4" weight="semibold" style={styles.title}>
                    Complete Error Handling
                </Typography>

                {error && (
                    <ErrorAlert
                        title="Erro ao Carregar Dados"
                        message={error.message}
                        onRetry={() => {
                            setError(null);
                            fetchData();
                        }}
                        onDismiss={() => setError(null)}
                    />
                )}

                <Button
                    title="Carregar Dados"
                    onPress={fetchData}
                    loading={isLoading}
                    variant="primary"
                />
            </View>
        </ErrorBoundary>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borders.radius.lg,
    },
    title: {
        marginBottom: theme.spacing.md,
    },
    errorInfo: {
        backgroundColor: theme.colors.background.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borders.radius.md,
        marginBottom: theme.spacing.md,
        borderLeftWidth: theme.borders.width.thick,
        borderLeftColor: theme.colors.semantic.error,
    },
    buttonGroup: {
        gap: theme.spacing.md,
    },
});
