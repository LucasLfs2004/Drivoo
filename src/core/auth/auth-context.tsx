import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import type {
  AuthAction,
  AuthState,
  CreateAccountCredentials,
  LoginCredentials,
  RegisterUser,
  Usuario,
} from '../../types/auth';
import { authService } from '../../features/auth/api/auth-service';
import { AuthApiService } from '../../features/auth/api/auth-api-service';
import {
  SecureStorageService,
  getRefreshToken,
  getToken,
  removeToken,
  setRefreshToken as persistRefreshToken,
  setToken as persistToken,
} from '../storage';
import { queryClient } from '../../app/providers/queryClient';
import {
  isApiCurrentUserComplete,
  mapApiUserToUsuario,
  userProfileApi as userService,
} from '../../features/profile/api/userProfileApi';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  createAccount: (credentials: CreateAccountCredentials) => Promise<void>;
  completeOnboarding: (data: RegisterUser) => Promise<void>;
  register: (data: RegisterUser) => Promise<void>;
  loginWithTokens: (
    usuario: Usuario,
    token: string,
    refreshToken: string,
    expiresIn: number
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (usuario: Usuario) => Promise<void>;
  updateProfile: (data: Partial<Usuario>) => Promise<void>;
  refreshCurrentUser: () => Promise<Usuario | null>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  loginAsAluno: () => Promise<void>;
  loginAsInstrutor: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  usuario: null,
  token: null,
  refreshToken: null,
  sessionEmail: null,
  needsOnboarding: false,
  isAuthenticated: false,
  carregando: true,
  error: null,
};

const AUTH_TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, carregando: action.payload, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        usuario: action.payload.usuario,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        sessionEmail: action.payload.sessionEmail,
        needsOnboarding: action.payload.needsOnboarding,
        isAuthenticated: true,
        carregando: false,
        error: null,
      };
    case 'AUTH_UPDATE_PROFILE':
      return {
        ...state,
        usuario: action.payload,
        sessionEmail: action.payload.email,
        needsOnboarding: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return { ...state, error: action.payload, carregando: false };
    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };
    case 'AUTH_LOGOUT':
      return { ...initialState, carregando: false };
    default:
      return state;
  }
};

const createMockUser = (papel: Usuario['papel']): Usuario => {
  if (papel === 'instrutor') {
    return {
      id: 'mock-instrutor',
      email: 'instrutor@drivoo.com',
      telefone: '(11) 99999-2222',
      papel,
      perfil: {
        primeiroNome: 'Carlos',
        ultimoNome: 'Santos',
        detranId: '',
        licenca: {
          numero: '',
          dataVencimento: new Date(),
          categorias: ['B'],
        },
        veiculo: {
          marca: '',
          modelo: '',
          ano: new Date().getFullYear(),
          transmissao: 'manual',
          placa: '',
        },
        disponibilidade: {
          segunda: { disponivel: false, horarios: [] },
          terca: { disponivel: false, horarios: [] },
          quarta: { disponivel: false, horarios: [] },
          quinta: { disponivel: false, horarios: [] },
          sexta: { disponivel: false, horarios: [] },
          sabado: { disponivel: false, horarios: [] },
          domingo: { disponivel: false, horarios: [] },
        },
        precos: {
          valorHora: 0,
          moeda: 'BRL',
        },
        localizacao: {
          localizacaoBase: { latitude: 0, longitude: 0 },
          raioAtendimento: 0,
        },
        avaliacoes: {
          media: 0,
          quantidade: 0,
        },
      },
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };
  }

  if (papel === 'admin') {
    return {
      id: 'mock-admin',
      email: 'admin@drivoo.com',
      telefone: '(11) 99999-3333',
      papel,
      perfil: {
        primeiroNome: 'Maria',
        ultimoNome: 'Oliveira',
        departamento: 'Operacoes',
        permissoes: [],
      },
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };
  }

  return {
    id: 'mock-aluno',
    email: 'aluno@drivoo.com',
    telefone: '(11) 99999-1111',
    papel: 'aluno',
    perfil: {
      primeiroNome: 'Joao',
      ultimoNome: 'Silva',
      dataNascimento: new Date(),
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: 'Sao Paulo',
        estado: 'SP',
        cep: '',
        pais: 'BR',
      },
      cnh: {
        categoria: 'B',
        status: 'nenhuma',
      },
      preferencias: {
        localizacao: { latitude: -23.5505, longitude: -46.6333 },
        raio: 10,
      },
    },
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeAuth();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated || !state.token || !state.refreshToken) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      return;
    }

    scheduleTokenRefresh();
  }, [state.isAuthenticated, state.token, state.refreshToken]);

  const persistAuthData = async ({
    token,
    refreshToken,
    user,
    sessionEmail,
    expiresInSeconds,
  }: {
    token: string;
    refreshToken: string;
    user: Usuario | null;
    sessionEmail: string | null;
    expiresInSeconds: number;
  }) => {
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    await Promise.all([
      SecureStorageService.storeAuthData({
        token,
        refreshToken,
        user,
        sessionEmail,
        expiresAt,
      }),
      persistToken(token),
      refreshToken ? persistRefreshToken(refreshToken) : Promise.resolve(),
    ]);
  };

  const applyAuthenticatedState = async ({
    user,
    token,
    refreshToken,
    sessionEmail,
    needsOnboarding,
    expiresInSeconds,
  }: {
    user: Usuario | null;
    token: string;
    refreshToken: string;
    sessionEmail: string | null;
    needsOnboarding: boolean;
    expiresInSeconds: number;
  }) => {
    await persistAuthData({
      token,
      refreshToken,
      user,
      sessionEmail,
      expiresInSeconds,
    });

    dispatch({
      type: 'AUTH_SUCCESS',
      payload: {
        usuario: user,
        token,
        refreshToken,
        sessionEmail,
        needsOnboarding,
      },
    });

    if (user) {
      queryClient.setQueryData(['current-user'], user);
    } else {
      queryClient.removeQueries({ queryKey: ['current-user'] });
    }
  };

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });

      const storedData = await SecureStorageService.getAuthData();
      const fallbackToken = storedData?.token ?? (await getToken());
      const fallbackRefreshToken = storedData?.refreshToken ?? (await getRefreshToken());

      if (!fallbackToken || !fallbackRefreshToken) {
        dispatch({ type: 'AUTH_LOADING', payload: false });
        return;
      }

      const currentUserState = await userService.getCurrentUserState(storedData?.user ?? null);

      await applyAuthenticatedState({
        user: currentUserState.user,
        token: fallbackToken,
        refreshToken: fallbackRefreshToken,
        sessionEmail:
          currentUserState.user?.email ??
          storedData?.sessionEmail ??
          storedData?.user?.email ??
          null,
        needsOnboarding: currentUserState.needsOnboarding,
        expiresInSeconds: Math.max(
          Math.floor(((storedData?.expiresAt ?? Date.now()) - Date.now()) / 1000),
          60
        ),
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      await SecureStorageService.clearAuthData();
      await removeToken();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const scheduleTokenRefresh = async () => {
    const storedData = await SecureStorageService.getAuthData();
    if (!storedData?.expiresAt) {
      return;
    }

    const refreshInMs = Math.max(
      storedData.expiresAt - Date.now() - AUTH_TOKEN_REFRESH_BUFFER_MS,
      60 * 1000
    );

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      performTokenRefresh().catch(error => {
        console.error('Scheduled token refresh failed:', error);
        logout().catch(logoutError => {
          console.error('Logout after refresh failure failed:', logoutError);
        });
      });
    }, refreshInMs);
  };

  const performTokenRefresh = async () => {
    const refreshResponse = await AuthApiService.refreshToken();

    await applyAuthenticatedState({
      user: state.usuario,
      token: refreshResponse.accessToken,
      refreshToken: refreshResponse.refreshToken,
      sessionEmail: state.sessionEmail,
      needsOnboarding: state.needsOnboarding,
      expiresInSeconds: refreshResponse.expiresIn,
    });
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });

      console.log('[AuthContext.login] Tentando autenticar usuario', {
        email: credentials.email.trim().toLowerCase(),
      });

      const response = await authService.login(credentials);
      const user = response.me.usuario && isApiCurrentUserComplete(response.me.usuario)
        ? mapApiUserToUsuario(response.me.usuario, state.usuario)
        : null;
      const needsOnboarding =
        Boolean(response.me.needs_onboarding) ||
        !Boolean(response.me.profile_completed) ||
        !user;

      await applyAuthenticatedState({
        user,
        token: response.session.access_token,
        refreshToken: response.session.refresh_token,
        sessionEmail: response.session.user.email ?? credentials.email,
        needsOnboarding,
        expiresInSeconds: response.session.expires_in,
      });

      console.log('[AuthContext.login] Estado autenticado aplicado', {
        userId: response.session.user.id,
        email: response.session.user.email ?? credentials.email.trim().toLowerCase(),
        needsOnboarding,
        hasUser: Boolean(user),
      });
    } catch (error) {
      console.log('[AuthContext.login] Erro final do login', {
        error: error instanceof Error ? error.message : String(error),
      });
      const errorMessage = error instanceof Error ? error.message : 'Falha no login';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const createAccount = async (credentials: CreateAccountCredentials) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      clearError();

      if (!credentials.email.trim()) {
        throw new Error('Email é obrigatório');
      }

      if (!credentials.senha) {
        throw new Error('Senha é obrigatória');
      }

      if (credentials.senha !== credentials.confirmarSenha) {
        throw new Error('As senhas não coincidem');
      }

      const response = await authService.createAccount({
        email: credentials.email,
        senha: credentials.senha,
      });
      const user = response.me.usuario && isApiCurrentUserComplete(response.me.usuario)
        ? mapApiUserToUsuario(response.me.usuario, state.usuario)
        : null;
      const needsOnboarding =
        Boolean(response.me.needs_onboarding) ||
        !Boolean(response.me.profile_completed) ||
        !user;

      await applyAuthenticatedState({
        user,
        token: response.session.access_token,
        refreshToken: response.session.refresh_token,
        sessionEmail: response.session.user.email ?? credentials.email.trim().toLowerCase(),
        needsOnboarding,
        expiresInSeconds: response.session.expires_in,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha ao criar conta';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const completeOnboarding = async (data: RegisterUser) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });

      const registrationUserType = data.userType ?? (data.cnh_numero ? 'instrutor' : 'aluno');
      const isCompletingOnboarding = Boolean(state.isAuthenticated && state.needsOnboarding && state.token);

      const response =
        registrationUserType === 'instrutor'
          ? await authService.registerInstrutor({
              email: data.email,
              senha: isCompletingOnboarding ? undefined : data.senha,
              accessToken: isCompletingOnboarding ? state.token ?? undefined : undefined,
              nome: data.nome,
              sobrenome: data.sobrenome,
              cpf: data.cpf,
              telefone: data.telefone,
              data_nascimento: data.data_nascimento,
              cnh_numero: data.cnh_numero ?? '',
              cnh_categorias: data.cnh_categorias ?? ['B'],
              cnh_vencimento: data.cnh_vencimento ?? '',
              valor_hora: data.valor_hora ?? 0,
              bio: data.bio,
              endereco: {
                rua: data.rua ?? '',
                numero: data.numero ?? '',
                bairro: data.bairro ?? '',
                cidade: data.cidade,
                estado: data.estado,
                cep: data.cep,
                pais: 'BR',
              },
              veiculo: {
                marca: data.veiculo?.marca ?? '',
                modelo: data.veiculo?.modelo ?? '',
                ano: data.veiculo?.ano ?? new Date().getFullYear(),
                placa: data.veiculo?.placa ?? '',
                tipo_cambio: data.veiculo?.tipo_cambio ?? 'MANUAL',
              },
            })
          : await authService.registerAluno({
              email: data.email,
              senha: isCompletingOnboarding ? undefined : data.senha,
              accessToken: isCompletingOnboarding ? state.token ?? undefined : undefined,
              nome: data.nome,
              sobrenome: data.sobrenome,
              cpf: data.cpf,
              telefone: data.telefone,
              data_nascimento: data.data_nascimento,
              cep: data.cep,
              cidade: data.cidade,
              estado: data.estado,
              veiculo: data.veiculo,
            });

      const user = mapApiUserToUsuario(
        response.onboarding.usuario,
        state.usuario ?? null
      );

      await applyAuthenticatedState({
        user,
        token: isCompletingOnboarding ? state.token ?? '' : response.session.access_token,
        refreshToken: isCompletingOnboarding
          ? state.refreshToken ?? ''
          : response.session.refresh_token,
        sessionEmail: data.email,
        needsOnboarding: false,
        expiresInSeconds: isCompletingOnboarding ? 7 * 24 * 60 * 60 : response.session.expires_in,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha ao concluir cadastro';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (data: RegisterUser) => completeOnboarding(data);

  const loginWithTokens = async (
    usuario: Usuario,
    token: string,
    refreshToken: string,
    expiresIn: number
  ) => {
    await applyAuthenticatedState({
      user: usuario,
      token,
      refreshToken,
      sessionEmail: usuario.email,
      needsOnboarding: false,
      expiresInSeconds: expiresIn,
    });
  };

  const logout = async () => {
    try {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }

      await AuthApiService.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      queryClient.clear();
      await SecureStorageService.clearAuthData();
      await removeToken();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const updateUser = async (usuario: Usuario) => {
    const storedData = await SecureStorageService.getAuthData();

    if (storedData && state.token && state.refreshToken) {
      await persistAuthData({
        token: state.token,
        refreshToken: state.refreshToken,
        user: usuario,
        sessionEmail: usuario.email,
        expiresInSeconds: Math.max(
          Math.floor((storedData.expiresAt - Date.now()) / 1000),
          60
        ),
      });
    }

    dispatch({ type: 'AUTH_UPDATE_PROFILE', payload: usuario });
    queryClient.setQueryData(['current-user'], usuario);
  };

  const updateProfile = async (data: Partial<Usuario>) => {
    if (!state.usuario) {
      throw new Error('Nenhum usuário autenticado');
    }

    const updatedFromApi = await userService.updateCurrentUser(state.usuario.id, {
      nome: data.perfil?.primeiroNome,
      sobrenome: data.perfil?.ultimoNome,
      telefone: data.telefone,
      email: data.email,
    });

    const updatedUser: Usuario = {
      ...state.usuario,
      ...updatedFromApi,
      telefone: updatedFromApi.telefone || data.telefone || state.usuario.telefone,
      perfil: {
        ...state.usuario.perfil,
        ...updatedFromApi.perfil,
        ...data.perfil,
      },
      email: updatedFromApi.email || data.email || state.usuario.email,
      atualizadoEm: new Date(),
    };

    await updateUser(updatedUser);
  };

  const refreshCurrentUser = async (): Promise<Usuario | null> => {
    if (!state.token || !state.refreshToken) {
      return null;
    }

    const currentUserState = await userService.getCurrentUserState(state.usuario);

    await applyAuthenticatedState({
      user: currentUserState.user,
      token: state.token,
      refreshToken: state.refreshToken,
      sessionEmail: currentUserState.user?.email ?? state.sessionEmail,
      needsOnboarding: currentUserState.needsOnboarding,
      expiresInSeconds: 7 * 24 * 60 * 60,
    });

    return currentUserState.user;
  };

  const refreshSession = async () => {
    await performTokenRefresh();
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const loginAsAluno = async () => {
    await loginWithTokens(createMockUser('aluno'), `mock-aluno-${Date.now()}`, `mock-refresh-${Date.now()}`, 3600);
  };

  const loginAsInstrutor = async () => {
    await loginWithTokens(
      createMockUser('instrutor'),
      `mock-instrutor-${Date.now()}`,
      `mock-refresh-${Date.now()}`,
      3600
    );
  };

  const loginAsAdmin = async () => {
    await loginWithTokens(createMockUser('admin'), `mock-admin-${Date.now()}`, `mock-refresh-${Date.now()}`, 3600);
  };

  const value: AuthContextType = {
    ...state,
    login,
    createAccount,
    completeOnboarding,
    register,
    loginWithTokens,
    logout,
    updateUser,
    updateProfile,
    refreshCurrentUser,
    refreshSession,
    clearError,
    loginAsAluno,
    loginAsInstrutor,
    loginAsAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
