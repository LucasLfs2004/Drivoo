import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({
    shouldThrow,
}) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <Text>No error</Text>;
};

describe('ErrorBoundary', () => {
    // Suppress console.error for these tests
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should render children when no error occurs', () => {
        render(
            <ErrorBoundary>
                <Text>Test content</Text>
            </ErrorBoundary>
        );

        expect(screen.getByText('Test content')).toBeTruthy();
    });

    it('should render error UI when error is thrown', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Algo deu errado')).toBeTruthy();
    });

    it('should call onError callback when error occurs', () => {
        const onError = jest.fn();
        render(
            <ErrorBoundary onError={onError}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(onError).toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
                componentStack: expect.any(String),
            })
        );
    });

    it('should render retry button', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Tentar Novamente')).toBeTruthy();
    });

    it('should recover from error when retry is clicked', () => {
        const { rerender } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Algo deu errado')).toBeTruthy();

        // Click retry button
        fireEvent.press(screen.getByText('Tentar Novamente'));

        // Rerender with no error
        rerender(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeTruthy();
    });

    it('should use custom fallback when provided', () => {
        const customFallback = (error: Error, retry: () => void) => (
            <Text>Custom error: {error.message}</Text>
        );

        render(
            <ErrorBoundary fallback={customFallback}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom error: Test error')).toBeTruthy();
    });

    it('should show debug info in development mode', () => {
        const originalDev = __DEV__;
        Object.defineProperty(global, '__DEV__', {
            value: true,
            writable: true,
        });

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Detalhes do Erro (Dev Only)')).toBeTruthy();
        expect(screen.getByText('Test error')).toBeTruthy();

        Object.defineProperty(global, '__DEV__', {
            value: originalDev,
            writable: true,
        });
    });
});
