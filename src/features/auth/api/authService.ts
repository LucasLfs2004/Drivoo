import { apiClient } from '../../../core/api';
import { setToken, setRefreshToken, removeToken } from '../../../core/storage';
import {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
} from '../../../services/api/types';

function handleAuthError(error: any): Error {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 400) {
      const message = data?.message || data?.error || 'Requisição inválida';
      return new Error(message);
    }

    if (status === 401) {
      return new Error('Email ou senha inválidos');
    }

    if (status === 409) {
      return new Error('Este email já está cadastrado');
    }

    if (status === 422) {
      const message = data?.message || 'Dados de entrada inválidos';
      return new Error(message);
    }

    if (status >= 500) {
      return new Error('Erro no servidor. Tente novamente mais tarde');
    }

    return new Error(data?.message || `Erro: ${status}`);
  }

  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
    return new Error('Erro de conexão. Verifique sua internet');
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Erro desconhecido. Tente novamente');
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      if (!credentials.email || !credentials.senha) {
        throw new Error('Email e senha são obrigatórios');
      }

      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      const { access_token, refresh_token } = response.data;

      await setToken(access_token);
      await setRefreshToken(refresh_token);

      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

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
      if (
        !data.email ||
        !data.senha ||
        !data.nome ||
        !data.sobrenome ||
        !data.cpf ||
        !data.telefone ||
        !data.data_nascimento
      ) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Email inválido');
      }

      if (data.senha.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }

      if (!/^\d{11}$/.test(data.cpf)) {
        throw new Error('CPF deve conter 11 dígitos');
      }

      if (data.telefone.length < 10 || data.telefone.length > 20) {
        throw new Error('Telefone inválido');
      }

      const response = await apiClient.post<RegisterResponse>(
        '/auth/registro/aluno',
        data
      );
      const { refresh_token, access_token } = response.data;

      await setToken(access_token);
      if (refresh_token) {
        await setRefreshToken(refresh_token);
      }

      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

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
      if (
        !data.email ||
        !data.senha ||
        !data.nome ||
        !data.sobrenome ||
        !data.cpf ||
        !data.telefone ||
        !data.data_nascimento
      ) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      if (!data.cnh_numero || !data.cnh_categorias || !data.cnh_vencimento || !data.valor_hora) {
        throw new Error('Dados da CNH e valor/hora são obrigatórios');
      }

      if (!data.endereco || !data.veiculo) {
        throw new Error('Endereço e dados do veículo são obrigatórios');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Email inválido');
      }

      if (data.senha.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }

      if (!/^\d{11}$/.test(data.cpf)) {
        throw new Error('CPF deve conter 11 dígitos');
      }

      if (data.telefone.length < 10 || data.telefone.length > 20) {
        throw new Error('Telefone inválido');
      }

      if (data.cnh_numero.length < 5 || data.cnh_numero.length > 20) {
        throw new Error('Número da CNH inválido');
      }

      if (!Array.isArray(data.cnh_categorias) || data.cnh_categorias.length === 0) {
        throw new Error('Selecione pelo menos uma categoria de CNH');
      }

      if (data.valor_hora <= 0) {
        throw new Error('Valor/hora deve ser maior que zero');
      }

      const response = await apiClient.post<RegisterResponse>(
        '/auth/registro/instrutor',
        data
      );

      const { access_token, refresh_token } = response.data;

      await setToken(access_token);
      if (refresh_token) {
        await setRefreshToken(refresh_token);
      }

      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      if (!credentials.email || !credentials.password || !credentials.userType) {
        throw new Error('Email, senha e tipo de usuário são obrigatórios');
      }

      if (credentials.userType === 'aluno') {
        return await this.registerAluno(credentials as any);
      }

      if (credentials.userType === 'instrutor') {
        return await this.registerInstrutor(credentials as any);
      }

      throw new Error('Tipo de usuário inválido');
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      try {
        await apiClient.post<LogoutResponse>('/auth/logout');
      } catch (serverError) {
        console.warn('Server logout failed, continuing with local logout:', serverError);
      }

      await removeToken();
    } catch (error) {
      throw handleAuthError(error);
    }
  },
};
