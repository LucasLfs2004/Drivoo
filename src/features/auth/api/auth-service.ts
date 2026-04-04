import { apiClient } from '../../../core/api';
import type { CreateAccountCredentials, LoginCredentials } from '../../../types/auth';
import { AuthApiService, type SupabaseSession } from './auth-api-service';

interface ApiUser {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  tipo: string;
  foto_url?: string | null;
  telefone?: string | null;
}

interface ApiRegisterResponse {
  usuario: ApiUser;
  instrutor?: {
    id: string;
    geocoding_sucesso?: boolean;
  } | null;
}

export interface AuthMeResponse {
  needs_onboarding: boolean;
  profile_completed: boolean;
  usuario?: ApiUser | null;
  instrutor?: {
    id: string;
    geocoding_sucesso?: boolean;
  } | null;
}

export interface LoginFlowResponse {
  session: SupabaseSession;
  me: AuthMeResponse;
}

export interface RegisterFlowResponse {
  session: SupabaseSession;
  onboarding: ApiRegisterResponse;
}

type AuthRequestConfig = {
  headers: {
    Authorization: string;
  };
  _skipAuthRefresh: true;
};

function handleAuthError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Erro desconhecido. Tente novamente.');
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginFlowResponse> {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email e senha são obrigatórios');
      }

      console.log('[authService.login] Executando fluxo de login', {
        email: credentials.email.trim().toLowerCase(),
      });

      const session = await AuthApiService.login(credentials);
      console.log('[authService.login] Sessao recebida, consultando /auth/me', {
        userId: session.user.id,
        email: session.user.email ?? null,
      });

      const authRequestConfig = {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        _skipAuthRefresh: true,
      } as AuthRequestConfig;

      const response = await apiClient.get<AuthMeResponse>('/auth/me', authRequestConfig as any);
      const me = response.data;

      console.log('[authService.login] /auth/me respondeu', {
        needsOnboarding: me.needs_onboarding,
        profileCompleted: me.profile_completed,
        hasUsuario: Boolean(me.usuario),
      });

      return { session, me };
    } catch (error) {
      console.log('[authService.login] Fluxo falhou', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw handleAuthError(error);
    }
  },

  async createAccount(
    credentials: Pick<CreateAccountCredentials, 'email' | 'senha'>
  ): Promise<LoginFlowResponse> {
    try {
      if (!credentials.email || !credentials.senha) {
        throw new Error('Email e senha são obrigatórios');
      }

      console.log('[authService.createAccount] Executando criacao de conta', {
        email: credentials.email.trim().toLowerCase(),
      });

      const session = await AuthApiService.signUp(credentials.email, credentials.senha);
      const authRequestConfig = {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        _skipAuthRefresh: true,
      } as AuthRequestConfig;

      const response = await apiClient.get<AuthMeResponse>('/auth/me', authRequestConfig as any);
      const me = response.data;

      console.log('[authService.createAccount] /auth/me respondeu', {
        needsOnboarding: me.needs_onboarding,
        profileCompleted: me.profile_completed,
        hasUsuario: Boolean(me.usuario),
      });

      return { session, me };
    } catch (error) {
      console.log('[authService.createAccount] Fluxo falhou', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw handleAuthError(error);
    }
  },

  async registerAluno(data: {
    email: string;
    senha?: string;
    accessToken?: string;
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
  }): Promise<RegisterFlowResponse> {
    try {
      if (!data.email || !data.nome || !data.sobrenome || !data.cpf || !data.telefone || !data.data_nascimento) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      if (!data.accessToken && !data.senha) {
        throw new Error('Senha obrigatória para criar a conta');
      }

      const session =
        data.accessToken && data.accessToken.trim().length > 0
          ? {
              access_token: data.accessToken,
              refresh_token: '',
              expires_in: 0,
              token_type: 'bearer',
              user: {
                id: '',
                email: data.email,
              },
            }
          : await AuthApiService.signUp(data.email, data.senha ?? '');

      const authRequestConfig = {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        _skipAuthRefresh: true,
      } as AuthRequestConfig;

      const response = await apiClient.post<ApiRegisterResponse>('/auth/onboarding/aluno', {
          email: data.email,
          nome: data.nome,
          sobrenome: data.sobrenome,
          cpf: data.cpf,
          telefone: data.telefone,
          data_nascimento: data.data_nascimento,
          cep: data.cep,
          cidade: data.cidade,
          estado: data.estado,
          veiculo: data.veiculo,
        }, authRequestConfig as any);

      const onboarding = response.data;

      return { session, onboarding };
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async registerInstrutor(data: {
    email: string;
    senha?: string;
    accessToken?: string;
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
  }): Promise<RegisterFlowResponse> {
    try {
      if (
        !data.email ||
        !data.nome ||
        !data.sobrenome ||
        !data.cpf ||
        !data.telefone ||
        !data.data_nascimento ||
        !data.cnh_numero ||
        !data.cnh_categorias.length ||
        !data.cnh_vencimento
      ) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      if (!data.accessToken && !data.senha) {
        throw new Error('Senha obrigatória para criar a conta');
      }

      const session =
        data.accessToken && data.accessToken.trim().length > 0
          ? {
              access_token: data.accessToken,
              refresh_token: '',
              expires_in: 0,
              token_type: 'bearer',
              user: {
                id: '',
                email: data.email,
              },
            }
          : await AuthApiService.signUp(data.email, data.senha ?? '');

      const authRequestConfig = {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        _skipAuthRefresh: true,
      } as AuthRequestConfig;

      const response = await apiClient.post<ApiRegisterResponse>('/auth/onboarding/instrutor', {
          email: data.email,
          nome: data.nome,
          sobrenome: data.sobrenome,
          cpf: data.cpf,
          telefone: data.telefone,
          data_nascimento: data.data_nascimento,
          genero: data.genero,
          cnh_numero: data.cnh_numero,
          cnh_categorias: data.cnh_categorias,
          cnh_vencimento: data.cnh_vencimento,
          experiencia_anos: data.experiencia_anos,
          valor_hora: data.valor_hora,
          bio: data.bio,
          tags: data.tags,
          endereco: data.endereco,
          veiculo: data.veiculo,
        }, authRequestConfig as any);

      const onboarding = response.data;

      return { session, onboarding };
    } catch (error) {
      throw handleAuthError(error);
    }
  },
};
