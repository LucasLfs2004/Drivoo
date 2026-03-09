import { SecureStorageService } from './secureStorage';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  TokenData,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../types/auth';

/**
 * Authentication API service
 * Handles API calls related to authentication
 */
export class AuthApiService {
  private static readonly BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8000';

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(): Promise<TokenData> {
    try {
      const refreshToken = await SecureStorageService.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('REFRESH_TOKEN_EXPIRED');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TokenData = await response.json();
      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Login user and get tokens
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse['data']> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const authResponse: AuthResponse = await response.json();

      if (!authResponse.success || !authResponse.data) {
        throw new Error(authResponse.message || 'Login failed');
      }

      return authResponse.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new student (aluno)
   */
  static async registerAluno(data: {
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
  }): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/registro/aluno`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Student registration failed:', error);
      throw error;
    }
  }

  /**
   * Register new instructor (instrutor)
   */
  static async registerInstrutor(data: {
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
  }): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/registro/instrutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Instructor registration failed:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const authResponse: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(authResponse.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return authResponse;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(request: ResetPasswordRequest): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  }

  /**
   * Logout user (invalidate tokens on server)
   */
  static async logout(): Promise<void> {
    try {
      const accessToken = await SecureStorageService.getAccessToken();

      if (!accessToken) {
        return; // Already logged out
      }

      await fetch(`${this.BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Don't throw on logout API failure - we still want to clear local data
    } catch {
      console.error('Logout API call failed');
      // Continue with local cleanup
    }
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  static async authenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let accessToken = await SecureStorageService.getAccessToken();

    // Check if token is expired and refresh if needed
    const isExpired = await SecureStorageService.isTokenExpired();
    if (isExpired && accessToken) {
      try {
        const refreshResponse = await this.refreshToken();
        const expiresAt = Date.now() + (refreshResponse.expiresIn * 1000);

        await SecureStorageService.updateTokens(
          refreshResponse.accessToken,
          refreshResponse.refreshToken,
          expiresAt
        );

        accessToken = refreshResponse.accessToken;
      } catch {
        // Refresh failed, token might be invalid
        throw new Error('AUTHENTICATION_REQUIRED');
      }
    }

    if (!accessToken) {
      throw new Error('AUTHENTICATION_REQUIRED');
    }

    // Make the authenticated request
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // If we get 401, try to refresh token once more
    if (response.status === 401) {
      try {
        const refreshResponse = await this.refreshToken();
        const expiresAt = Date.now() + (refreshResponse.expiresIn * 1000);

        await SecureStorageService.updateTokens(
          refreshResponse.accessToken,
          refreshResponse.refreshToken,
          expiresAt
        );

        // Retry the original request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${refreshResponse.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch {
        throw new Error('AUTHENTICATION_REQUIRED');
      }
    }

    return response;
  }
}