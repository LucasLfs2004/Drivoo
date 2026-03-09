import React, { ReactNode, ReactElement } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { theme } from '../../themes';
import { Typography } from './Typography';
import { Button } from './Button';

export interface ErrorBoundaryProps {
    children: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    fallback?: (error: Error, retry: () => void) => ReactElement;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    retryCount: number;
}

export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Log error for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState((prevState) => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1,
        }));
    };

    render(): ReactNode {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.handleRetry);
            }

            // Default error UI
            return (
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView
                        style={styles.container}
                        contentContainerStyle={styles.contentContainer}
                    >
                        <View style={styles.errorContainer}>
                            <Typography
                                variant="h3"
                                weight="bold"
                                color="error"
                                align="center"
                                style={styles.title}
                            >
                                Algo deu errado
                            </Typography>

                            <Typography
                                variant="body"
                                color="secondary"
                                align="center"
                                style={styles.description}
                            >
                                Desculpe, ocorreu um erro inesperado. Tente novamente ou
                                entre em contato com o suporte se o problema persistir.
                            </Typography>

                            {__DEV__ && this.state.error && (
                                <View style={styles.debugContainer}>
                                    <Typography
                                        variant="label"
                                        weight="semibold"
                                        color="error"
                                        style={styles.debugTitle}
                                    >
                                        Detalhes do Erro (Dev Only)
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="primary"
                                        style={styles.debugText}
                                    >
                                        {this.state.error.message}
                                    </Typography>
                                    {this.state.errorInfo && (
                                        <Typography
                                            variant="caption"
                                            color="secondary"
                                            style={styles.debugStack}
                                        >
                                            {this.state.errorInfo.componentStack}
                                        </Typography>
                                    )}
                                </View>
                            )}

                            <View style={styles.actions}>
                                <Button
                                    title="Tentar Novamente"
                                    onPress={this.handleRetry}
                                    variant="primary"
                                    size="md"
                                    style={styles.button}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xl,
    },
    errorContainer: {
        alignItems: 'center',
    },
    title: {
        marginBottom: theme.spacing.md,
    },
    description: {
        marginBottom: theme.spacing.xl,
        lineHeight: theme.typography.lineHeight.md,
    },
    debugContainer: {
        width: '100%',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borders.radius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        borderLeftWidth: theme.borders.width.thick,
        borderLeftColor: theme.colors.semantic.error,
    },
    debugTitle: {
        marginBottom: theme.spacing.sm,
    },
    debugText: {
        marginBottom: theme.spacing.sm,
        fontFamily: 'Courier New',
    },
    debugStack: {
        fontFamily: 'Courier New',
        lineHeight: theme.typography.lineHeight.sm,
    },
    actions: {
        width: '100%',
        gap: theme.spacing.md,
    },
    button: {
        width: '100%',
    },
});
