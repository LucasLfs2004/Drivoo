import apiClient from '../api/client';
import { setToken, setRefreshToken, removeToken } from './tokenStorage';
import {
    LoginCredentials,
    RegisterCredentials,
    LoginResponse,
    RegisterResponse,
    LogoutResponse,
} from '../api/types';

/**
 * Handle API errors and convert to user-friendly messages
 * Differentiates between network, server, and validation errors
 */
function handleAuthError(error: any): Error {
    // Handle Axios errors
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // 400 - Bad Request / Validation Error
        if (status === 400) {
            const message = data?.message || data?.error || 'Requisição inválida';
            return new Error(message);
        }

        // 401 - Unauthorized / Invalid Credentials
        if (status === 401) {
            return new Error('Email ou senha inválidos');
        }

        // 409 - Conflict / Email Already Exists
        if (status === 409) {
            return new Error('Este email já está cadastrado');
        }

        // 422 - Unprocessable Entity / Validation Error
        if (status === 422) {
            const message = data?.message || 'Dados de entrada inválidos';
            return new Error(message);
        }

        // 500+ - Server Error
        if (status >= 500) {
            return new Error('Erro no servidor. Tente novamente mais tarde');
        }

        // Generic HTTP error
        return new Error(data?.message || `Erro: ${status}`);
    }

    // Handle network errors
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
        return new Error('Erro de conexão. Verifique sua internet');
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
        return new Error('Requisição expirou. Tente novamente');
    }

    // Handle custom errors
    if (error instanceof Error) {
        return error;
    }

    // Fallback
    return new Error('Erro desconhecido. Tente novamente');
}

/**
 * Authentication Service
 * Handles login, registration, logout, and token management
 * Integrates with Axios client for API communication
 */
export const authService = {
    /**
     * Login user with email and password
     * Stores tokens securely after successful login
     * @param credentials - Email and password
     * @returns AuthResponse with user data and tokens
     * @throws Error with user-friendly message on failure
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            console.log("Credentials in login: ", credentials)
            // Validate input
            if (!credentials.email || !credentials.senha) {
                throw new Error('Email e senha são obrigatórios');
            }

            // Make API request
            const response = await apiClient.post<LoginResponse>(
                '/auth/login',
                credentials
            );

            const { access_token, refresh_token } = response.data;
            console.log("RESPONSE_DATA", response.data)
            // Store tokens securely
            console.log(access_token);
            await setToken(access_token);
            await setRefreshToken(refresh_token);

            return response.data;
        } catch (error) {
            throw handleAuthError(error);
        }
    },

    /**
     * Register new student (aluno)
     * Stores tokens securely after successful registration
     * @param data - Student registration data
     * @returns RegisterResponse with user data and tokens
     * @throws Error with user-friendly message on failure
     */
    async registerAluno(data: {
        email: string;
        senha: string;
        nome: string;
        sobrenome: string;
        cpf: string;
        telefone: string;
        data_nascimento: string;
        cep?: string;
        cidade?: string;
        estado?: string;
        veiculo?: {
            modelo: string;
            ano: number;
            placa: string;
            tipo_cambio: 'MANUAL' | 'AUTOMATICO';
        };
    }): Promise<RegisterResponse> {
        try {
            // Validate required fields
            if (!data.email || !data.senha || !data.nome || !data.sobrenome || !data.cpf || !data.telefone || !data.data_nascimento) {
                throw new Error('Todos os campos obrigatórios devem ser preenchidos');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new Error('Email inválido');
            }

            // Validate password length
            if (data.senha.length < 6) {
                throw new Error('Senha deve ter no mínimo 6 caracteres');
            }

            // Validate CPF format (11 digits)
            if (!/^\d{11}$/.test(data.cpf)) {
                throw new Error('CPF deve conter 11 dígitos');
            }

            // Validate phone format (10-20 characters)
            if (data.telefone.length < 10 || data.telefone.length > 20) {
                throw new Error('Telefone inválido');
            }
            console.log("Registrando novo aluno: ", data)

            const response = await apiClient.post<RegisterResponse>(
                '/auth/registro/aluno',
                data
            );
            console.log("Registro de aluno: ", response.data);
            const { refresh_token, access_token } = response.data;

            // Store tokens securely
            await setToken(access_token);
            if (refresh_token) {
                await setRefreshToken(refresh_token);
            }

            return response.data;
        } catch (error) {
            throw handleAuthError(error);
        }
    },

    /**
     * Register new instructor (instrutor)
     * Stores tokens securely after successful registration
     * @param data - Instructor registration data
     * @returns RegisterResponse with user data and tokens
     * @throws Error with user-friendly message on failure
     */
    async registerInstrutor(data: {
        email: string;
        senha: string;
        nome: string;
        sobrenome: string;
        cpf: string;
        telefone: string;
        data_nascimento: string;
        genero?: 'M' | 'F' | 'Outro';
        cnh_numero: string;
        cnh_categorias: string[];
        cnh_vencimento: string;
        experiencia_anos?: number;
        valor_hora: number;
        bio?: string;
        tags?: string[];
        endereco: {
            rua: string;
            numero: string;
            bairro: string;
            cidade: string;
            estado: string;
            cep: string;
            pais?: string;
        };
        veiculo: {
            marca: string;
            modelo: string;
            ano: number;
            placa: string;
            tipo_cambio: 'MANUAL' | 'AUTOMATICO';
        };
    }): Promise<RegisterResponse> {
        try {
            // Validate required fields
            if (!data.email || !data.senha || !data.nome || !data.sobrenome || !data.cpf || !data.telefone || !data.data_nascimento) {
                throw new Error('Todos os campos obrigatórios devem ser preenchidos');
            }

            if (!data.cnh_numero || !data.cnh_categorias || !data.cnh_vencimento || !data.valor_hora) {
                throw new Error('Dados da CNH e valor/hora são obrigatórios');
            }

            if (!data.endereco || !data.veiculo) {
                throw new Error('Endereço e dados do veículo são obrigatórios');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new Error('Email inválido');
            }

            // Validate password length
            if (data.senha.length < 6) {
                throw new Error('Senha deve ter no mínimo 6 caracteres');
            }

            // Validate CPF format (11 digits)
            if (!/^\d{11}$/.test(data.cpf)) {
                throw new Error('CPF deve conter 11 dígitos');
            }

            // Validate phone format (10-20 characters)
            if (data.telefone.length < 10 || data.telefone.length > 20) {
                throw new Error('Telefone inválido');
            }

            // Validate CNH number format
            if (data.cnh_numero.length < 5 || data.cnh_numero.length > 20) {
                throw new Error('Número da CNH inválido');
            }

            // Validate CNH categories
            if (!Array.isArray(data.cnh_categorias) || data.cnh_categorias.length === 0) {
                throw new Error('Selecione pelo menos uma categoria de CNH');
            }

            // Validate hourly rate
            if (data.valor_hora <= 0) {
                throw new Error('Valor/hora deve ser maior que zero');
            }

            // Make API request to instructor registration endpoint
            const response = await apiClient.post<RegisterResponse>(
                '/auth/registro/instrutor',
                data
            );

            const { access_token, refresh_token } = response.data;

            // Store tokens securely
            await setToken(access_token);
            if (refresh_token) {
                await setRefreshToken(refresh_token);
            }

            return response.data;
        } catch (error) {
            throw handleAuthError(error);
        }
    },

    /**
     * Register new user (generic - delegates to specific register functions)
     * @param credentials - Registration credentials with user type
     * @returns RegisterResponse with user data and tokens
     * @throws Error with user-friendly message on failure
     */
    async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
        try {
            // Validate input
            if (!credentials.email || !credentials.password || !credentials.userType) {
                throw new Error('Email, senha e tipo de usuário são obrigatórios');
            }

            // Delegate to specific register function based on user type
            // Note: credentials.userType uses 'student'/'instructor' but we map to 'aluno'/'instrutor'
            if (credentials.userType === 'student') {
                return await this.registerAluno(credentials as any);
            } else if (credentials.userType === 'instructor') {
                return await this.registerInstrutor(credentials as any);
            } else {
                throw new Error('Tipo de usuário inválido');
            }
        } catch (error) {
            throw handleAuthError(error);
        }
    },

    /**
     * Logout user
     * Removes tokens from secure storage
     * Attempts to notify server but doesn't fail if server call fails
     * @throws Error if token removal fails
     */
    async logout(): Promise<void> {
        try {
            // Attempt to notify server (best effort)
            try {
                await apiClient.post<LogoutResponse>('/auth/logout');
            } catch (serverError) {
                // Log but don't throw - we still want to clear local tokens
                console.warn('Server logout failed:', serverError);
            }

            // Always remove tokens locally
            await removeToken();
        } catch (error) {
            console.error('Logout error:', error);
            throw new Error('Falha ao fazer logout');
        }
    },
};
