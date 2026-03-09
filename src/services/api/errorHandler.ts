import { AxiosError } from 'axios';

export interface ApiError {
    code: string;
    message: string;
    statusCode: number;
    type: 'network' | 'server' | 'validation' | 'auth' | 'unknown';
    details?: Record<string, any>;
    originalError?: Error;
}

/**
 * Mapeia erros HTTP para mensagens amigáveis ao usuário
 * Diferencia entre erros de rede, servidor e validação
 * Retorna estrutura consistente de erro
 */
export function handleApiError(error: unknown): ApiError {
    // Erro de rede (sem resposta do servidor)
    if (error instanceof AxiosError && !error.response) {
        return {
            code: 'NETWORK_ERROR',
            message: 'Erro de conexão. Verifique sua internet e tente novamente.',
            statusCode: 0,
            type: 'network',
            originalError: error,
        };
    }

    // Erro Axios com resposta
    if (error instanceof AxiosError && error.response) {
        const statusCode = error.response.status;
        const data = error.response.data as any;

        // Erro de validação (422 ou 400)
        if (statusCode === 422 || statusCode === 400) {
            return {
                code: data?.error || 'VALIDATION_ERROR',
                message: data?.message || 'Dados de entrada inválidos. Verifique os campos.',
                statusCode,
                type: 'validation',
                details: data?.details || data?.errors,
                originalError: error,
            };
        }

        // Erro de autenticação (401)
        if (statusCode === 401) {
            return {
                code: 'UNAUTHORIZED',
                message: 'Sessão expirada. Faça login novamente.',
                statusCode,
                type: 'auth',
                originalError: error,
            };
        }

        // Erro de autorização (403)
        if (statusCode === 403) {
            return {
                code: 'FORBIDDEN',
                message: 'Você não tem permissão para acessar este recurso.',
                statusCode,
                type: 'auth',
                originalError: error,
            };
        }

        // Erro de recurso não encontrado (404)
        if (statusCode === 404) {
            return {
                code: 'NOT_FOUND',
                message: 'Recurso não encontrado.',
                statusCode,
                type: 'server',
                originalError: error,
            };
        }

        // Erro de servidor (5xx)
        if (statusCode >= 500) {
            return {
                code: data?.error || 'SERVER_ERROR',
                message: data?.message || 'Erro no servidor. Tente novamente mais tarde.',
                statusCode,
                type: 'server',
                details: data?.details,
                originalError: error,
            };
        }

        // Outros erros HTTP
        return {
            code: data?.error || `HTTP_${statusCode}`,
            message: data?.message || getDefaultErrorMessage(statusCode),
            statusCode,
            type: 'server',
            details: data?.details,
            originalError: error,
        };
    }

    // Erro genérico (não é AxiosError)
    if (error instanceof Error) {
        return {
            code: 'UNKNOWN_ERROR',
            message: error.message || 'Ocorreu um erro desconhecido.',
            statusCode: 0,
            type: 'unknown',
            originalError: error,
        };
    }

    // Erro completamente desconhecido
    return {
        code: 'UNKNOWN_ERROR',
        message: 'Ocorreu um erro desconhecido.',
        statusCode: 0,
        type: 'unknown',
    };
}

/**
 * Retorna mensagem padrão para um status code HTTP
 */
function getDefaultErrorMessage(statusCode: number): string {
    const messages: Record<number, string> = {
        400: 'Requisição inválida.',
        401: 'Não autorizado.',
        403: 'Acesso negado.',
        404: 'Recurso não encontrado.',
        409: 'Conflito. O recurso já existe.',
        422: 'Dados de entrada inválidos.',
        429: 'Muitas requisições. Tente novamente mais tarde.',
        500: 'Erro no servidor.',
        502: 'Gateway indisponível.',
        503: 'Serviço indisponível.',
        504: 'Timeout do servidor.',
    };

    return messages[statusCode] || 'Erro desconhecido. Tente novamente.';
}

/**
 * Verifica se um erro é de rede
 */
export function isNetworkError(error: ApiError): boolean {
    return error.type === 'network';
}

/**
 * Verifica se um erro é de validação
 */
export function isValidationError(error: ApiError): boolean {
    return error.type === 'validation';
}

/**
 * Verifica se um erro é de autenticação
 */
export function isAuthError(error: ApiError): boolean {
    return error.type === 'auth';
}

/**
 * Verifica se um erro é de servidor
 */
export function isServerError(error: ApiError): boolean {
    return error.type === 'server';
}

/**
 * Verifica se o erro é recuperável (pode fazer retry)
 */
export function isRetryableError(error: ApiError): boolean {
    // Erros de rede são sempre recuperáveis
    if (error.type === 'network') {
        return true;
    }

    // Erros de servidor 5xx são recuperáveis
    if (error.type === 'server' && error.statusCode >= 500) {
        return true;
    }

    // Erro 429 (rate limit) é recuperável
    if (error.statusCode === 429) {
        return true;
    }

    // Erro 408 (request timeout) é recuperável
    if (error.statusCode === 408) {
        return true;
    }

    return false;
}

/**
 * Extrai mensagens de validação de um erro
 */
export function getValidationMessages(error: ApiError): Record<string, string> {
    if (!isValidationError(error) || !error.details) {
        return {};
    }

    // Se details é um objeto com campos como chaves
    if (typeof error.details === 'object' && !Array.isArray(error.details)) {
        return error.details as Record<string, string>;
    }

    // Se details é um array de erros
    if (Array.isArray(error.details)) {
        const messages: Record<string, string> = {};
        error.details.forEach((err: any) => {
            if (err.field && err.message) {
                messages[err.field] = err.message;
            }
        });
        return messages;
    }

    return {};
}
