import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorAlert } from '../ErrorAlert';

describe('ErrorAlert', () => {
    it('should render error message', () => {
        const message = 'Erro de conexão';
        render(<ErrorAlert message={message} />);

        expect(screen.getByText(message)).toBeTruthy();
    });

    it('should render title when provided', () => {
        const title = 'Erro';
        const message = 'Algo deu errado';
        render(<ErrorAlert title={title} message={message} />);

        expect(screen.getByText(title)).toBeTruthy();
        expect(screen.getByText(message)).toBeTruthy();
    });

    it('should call onDismiss when dismiss button is pressed', () => {
        const onDismiss = jest.fn();
        const { getByText } = render(
            <ErrorAlert
                message="Erro"
                onDismiss={onDismiss}
                dismissLabel="Descartar"
            />
        );

        fireEvent.press(getByText('Descartar'));
        expect(onDismiss).toHaveBeenCalled();
    });

    it('should call onRetry when retry button is pressed', () => {
        const onRetry = jest.fn();
        const { getByText } = render(
            <ErrorAlert
                message="Erro"
                onRetry={onRetry}
                retryLabel="Tentar Novamente"
            />
        );

        fireEvent.press(getByText('Tentar Novamente'));
        expect(onRetry).toHaveBeenCalled();
    });

    it('should render both retry and dismiss buttons when both callbacks provided', () => {
        const onRetry = jest.fn();
        const onDismiss = jest.fn();
        const { getByText } = render(
            <ErrorAlert
                message="Erro"
                onRetry={onRetry}
                onDismiss={onDismiss}
                retryLabel="Tentar"
                dismissLabel="Descartar"
            />
        );

        expect(screen.getByText('Tentar')).toBeTruthy();
        expect(screen.getByText('Descartar')).toBeTruthy();
    });

    it('should not render icon when showIcon is false', () => {
        const { queryByTestId } = render(
            <ErrorAlert message="Erro" showIcon={false} testID="error-alert"
            />
        );

        // Icon should not be rendered
        expect(queryByTestId('error-icon')).toBeFalsy();
    });

    it('should render custom labels for buttons', () => {
        const { getByText } = render(
            <ErrorAlert
                message="Erro"
                onRetry={() => { }}
                onDismiss={() => { }}
                retryLabel="Repetir"
                dismissLabel="Fechar"
            />
        );

        expect(screen.getByText('Repetir')).toBeTruthy();
        expect(screen.getByText('Fechar')).toBeTruthy();
    });

    it('should not render action buttons when no callbacks provided', () => {
        const { queryByText } = render(
            <ErrorAlert message="Erro" />
        );

        expect(queryByText('Tentar Novamente')).toBeFalsy();
        expect(queryByText('Descartar')).toBeFalsy();
    });
});
