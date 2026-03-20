import { SecureStorageService } from '../../../core/storage';
import {
  LoginCredentials,
  RegisterData,
  TokenData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../../../types/auth';
import type {
  LoginResponse,
  RegisterResponse,
  TokenResponse,
} from '../../../services/api/types';

export class AuthApiService {
  private static readonly BASE_URL =
    process.env.API_BASE_URL || 'http://127.0.0.1:8000';
  private static readonly ACCESS_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

  static async refreshToken(): Promise<TokenData> {
    try {
      const refreshToken = await SecureStorageService.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('REFRESH_TOKEN_EXPIRED');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TokenResponse = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: this.ACCESS_TOKEN_TTL_SECONDS,
        tokenType: 'Bearer',
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

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
    const response = await fetch(`${this.BASE_URL}/auth/registro/aluno`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

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
    const response = await fetch(`${this.BASE_URL}/auth/registro/instrutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  static async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await fetch(`${this.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const authResponse: RegisterResponse = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return authResponse;
  }

  static async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
  }

  static async resetPassword(request: ResetPasswordRequest): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
  }

  static async logout(): Promise<void> {
    return Promise.resolve();
  }
}
