import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import {
  AuthState,
  Usuario,
  AuthAction,
  LoginCredentials,
  RegisterUser
} from '../../types/auth';
import { authService } from '../../features/auth/api/authService';
import { getRefreshToken, getToken, removeToken } from '../storage';
import { queryClient } from '../../services/queries/queryClient';
import { SecureStorageService } from '../storage';
import {
  mapApiUserToUsuario,
  userProfileApi as userService,
} from '../../features/profile/api/userProfileApi';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterUser) => Promise<void>;
  loginWithTokens: (usuario: Usuario, token: string, refreshToken: string, expiresIn: number) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (usuario: Usuario) => Promise<void>;
  updateProfile: (data: Partial<Usuario>) => Promise<void>;
  refreshCurrentUser: () => Promise<Usuario | null>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  // Mock functions for development
  loginAsAluno: () => Promise<void>;
  loginAsInstrutor: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, carregando: action.payload, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        usuario: action.payload.usuario,
        token: action.payload.token,
        isAuthenticated: true,
        carregando: false,
        error: null,
      };
    case 'AUTH_UPDATE_PROFILE':
      return { ...state, usuario: action.payload, error: null };
    case 'AUTH_ERROR':
      return { ...state, error: action.payload, carregando: false };
    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };
    case 'AUTH_LOGOUT':
      return {
        usuario: null,
        token: null,
        isAuthenticated: false,
        carregando: false,
        error: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  usuario: null,
  token: null,
  isAuthenticated: false,
  carregando: true,
  error: null,
};

const ACCESS_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_FALLBACK_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock users for development
  const mockUsers = {
    aluno: {
      id: 'mock-aluno-1',
      email: 'aluno@drivoo.com',
      telefone: '(11) 99999-1111',
      papel: 'aluno' as const,
      perfil: {
        primeiroNome: 'João',
        ultimoNome: 'Silva',
        dataNascimento: new Date('1995-05-15'),
        endereco: {
          rua: 'Rua das Flores',
          numero: '123',
          bairro: 'Vila Madalena',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '05435-000',
          pais: 'BR' as const,
        },
        cnh: {
          categoria: 'B' as const,
          status: 'teoria_aprovada' as const,
        },
        preferencias: {
          generoInstrutor: 'masculino' as const,
          tipoVeiculo: 'manual' as const,
          localizacao: { latitude: -23.5505, longitude: -46.6333 },
          raio: 15,
        },
      },
      criadoEm: new Date('2024-01-15'),
      atualizadoEm: new Date(),
    },
    instrutor: {
      id: 'mock-instrutor-1',
      email: 'instrutor@drivoo.com',
      telefone: '(11) 99999-2222',
      papel: 'instrutor' as const,
      perfil: {
        primeiroNome: 'Carlos',
        ultimoNome: 'Santos',
        detranId: 'SP123456789',
        licenca: {
          numero: 'CNH987654321',
          dataVencimento: new Date('2026-12-31'),
          categorias: ['A', 'B'] as ('A' | 'B')[],
        },
        veiculo: {
          marca: 'Volkswagen',
          modelo: 'Gol',
          ano: 2020,
          transmissao: 'manual' as const,
          placa: 'ABC-1234',
        },
        disponibilidade: {
          segunda: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '18:00', disponivel: true }] },
          terca: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '18:00', disponivel: true }] },
          quarta: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '18:00', disponivel: true }] },
          quinta: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '18:00', disponivel: true }] },
          sexta: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '18:00', disponivel: true }] },
          sabado: { disponivel: true, horarios: [{ horaInicio: '08:00', horaFim: '14:00', disponivel: true }] },
          domingo: { disponivel: false, horarios: [] },
        },
        precos: {
          valorHora: 80.00,
          moeda: 'BRL' as const,
        },
        localizacao: {
          localizacaoBase: { latitude: -23.5505, longitude: -46.6333 },
          raioAtendimento: 20,
        },
        avaliacoes: {
          media: 4.8,
          quantidade: 127,
        },
      },
      criadoEm: new Date('2023-08-10'),
      atualizadoEm: new Date(),
    },
    admin: {
      id: 'mock-admin-1',
      email: 'admin@drivoo.com',
      telefone: '(11) 99999-3333',
      papel: 'admin' as const,
      perfil: {
        primeiroNome: 'Maria',
        ultimoNome: 'Oliveira',
        departamento: 'Operações',
        permissoes: ['users:read', 'users:write', 'instructors:read', 'instructors:write', 'analytics:read'],
      },
      criadoEm: new Date('2023-01-01'),
      atualizadoEm: new Date(),
    },
  };

  useEffect(() => {
    // Check for stored auth data on app start
    initializeAuth();

    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Set up automatic token refresh when user is authenticated
    if (state.isAuthenticated && state.token) {
      scheduleTokenRefresh();
    } else {
      // Clear any existing refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    }
  }, [state.isAuthenticated, state.token]);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      const storedToken = await SecureStorageService.getAccessToken();
      const storedRefreshToken = await SecureStorageService.getRefreshToken();
      const fallbackToken = storedToken ?? (await getToken());
      const fallbackRefreshToken = storedRefreshToken ?? (await getRefreshToken());

      if (!fallbackToken) {
        dispatch({ type: 'AUTH_LOADING', payload: false });
        return;
      }

      if (!storedToken || !storedRefreshToken) {
        await SecureStorageService.updateTokens(
          fallbackToken,
          fallbackRefreshToken ?? '',
          Date.now() + ACCESS_TOKEN_TTL_MS
        );
      }

      const currentUser = await userService.getCurrentUser();
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          usuario: currentUser,
          token: fallbackToken,
        },
      });
      queryClient.setQueryData(['current-user'], currentUser);
    } catch (error) {
      console.error('Error initializing auth:', error);
      await SecureStorageService.clearAuthData();
      await removeToken();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const scheduleTokenRefresh = async () => {
    // Disabled for mock mode
    // try {
    //   const storedData = await SecureStorageService.getAuthData();
    //   if (!storedData) return;

    //   const now = Date.now();
    //   const timeUntilExpiry = storedData.expiresAt - now;

    //   // Schedule refresh 5 minutes before expiry, but at least 1 minute from now
    //   const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60 * 1000);

    //   if (refreshTime > 0) {
    //     refreshTimeoutRef.current = setTimeout(() => {
    //       performTokenRefresh().catch(error => {
    //         console.error('Scheduled token refresh failed:', error);
    //         // If refresh fails, logout user
    //         logout();
    //       });
    //     }, refreshTime);
    //   }
    // } catch (error) {
    //   console.error('Error scheduling token refresh:', error);
    // }
  };

  const performTokenRefresh = async () => {
    // Disabled for mock mode
    // try {
    //   const refreshResponse = await AuthApiService.refreshToken();
    //   const expiresAt = Date.now() + (refreshResponse.expiresIn * 1000);

    //   // Update stored tokens
    //   await SecureStorageService.updateTokens(
    //     refreshResponse.accessToken,
    //     refreshResponse.refreshToken,
    //     expiresAt
    //   );

    //   // Update context state
    //   dispatch({ 
    //     type: 'AUTH_SUCCESS', 
    //     payload: { 
    //       usuario: state.usuario!, 
    //       token: refreshResponse.accessToken 
    //     } 
    //   });
    // } catch (error) {
    //   console.error('Token refresh failed:', error);
    //   if (error instanceof Error && error.message === 'REFRESH_TOKEN_EXPIRED') {
    //     // Refresh token is expired, user needs to login again
    //     await logout();
    //   }
    //   throw error;
    // }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });

      // Call the real API via authService
      const response = await authService.login({ email: credentials.email, senha: credentials.password });
      const usuario = response.usuario
        ? mapApiUserToUsuario({
            id: response.usuario.id,
            email: response.usuario.email,
            nome: response.usuario.nome,
            sobrenome: response.usuario.sobrenome,
            tipo: response.usuario.tipo,
            telefone: response.usuario.telefone,
          })
        : await userService.getCurrentUser();

      await SecureStorageService.storeAuthData({
        token: response.access_token,
        refreshToken: response.refresh_token,
        user: usuario,
        expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
      });

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          usuario,
          token: response.access_token
        }
      });
      queryClient.setQueryData(['current-user'], usuario);
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Mock login functions for quick development access
  const loginAsAluno = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockToken = `mock-token-aluno-${Date.now()}`;
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          usuario: mockUsers.aluno,
          token: mockToken
        }
      });
    } catch (error) {
      console.error('Mock aluno login failed:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Failed to login as aluno' });
    }
  };

  const loginAsInstrutor = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockToken = `mock-token-instrutor-${Date.now()}`;
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          usuario: mockUsers.instrutor,
          token: mockToken
        }
      });
    } catch (error) {
      console.error('Mock instrutor login failed:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Failed to login as instrutor' });
    }
  };

  const loginAsAdmin = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockToken = `mock-token-admin-${Date.now()}`;
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          usuario: mockUsers.admin,
          token: mockToken
        }
      });
    } catch (error) {
      console.error('Mock admin login failed:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Failed to login as admin' });
    }
  };

  const register = async (data: RegisterUser) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });

      const registrationUserType = data.userType ?? (data.cnh_numero ? 'instrutor' : 'aluno');

      const response = registrationUserType === 'instrutor'
        ? await authService.registerInstrutor({
            email: data.email,
            senha: data.senha,
            nome: data.nome,
            sobrenome: data.sobrenome,
            cpf: data.cpf,
            telefone: data.telefone,
            data_nascimento: data.data_nascimento,
            cnh_numero: data.cnh_numero ?? '',
            cnh_categorias: data.cnh_categorias ?? [],
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
            senha: data.senha,
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
        {
          id: response.usuario.id,
          email: response.usuario.email,
          nome: response.usuario.nome,
          sobrenome: response.usuario.sobrenome,
          tipo: response.usuario.tipo,
          telefone: response.usuario.telefone ?? data.telefone,
        },
        registrationUserType === 'instrutor'
          ? {
              id: response.usuario.id,
              email: data.email,
              telefone: data.telefone,
              papel: 'instrutor',
              perfil: {
                primeiroNome: data.nome,
                ultimoNome: data.sobrenome,
                detranId: '',
                licenca: {
                  numero: data.cnh_numero ?? '',
                  dataVencimento: data.cnh_vencimento ? new Date(`${data.cnh_vencimento}T00:00:00`) : new Date(),
                  categorias: (data.cnh_categorias?.filter(
                    (categoria): categoria is 'A' | 'B' => categoria === 'A' || categoria === 'B'
                  ) ?? ['B']),
                },
                veiculo: {
                  marca: data.veiculo?.marca ?? '',
                  modelo: data.veiculo?.modelo ?? '',
                  ano: data.veiculo?.ano ?? new Date().getFullYear(),
                  transmissao: data.veiculo?.tipo_cambio === 'AUTOMATICO' ? 'automatico' : 'manual',
                  placa: data.veiculo?.placa ?? '',
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
                  valorHora: data.valor_hora ?? 0,
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
            }
          : {
              id: response.usuario.id,
              email: data.email,
              telefone: data.telefone,
              papel: 'aluno',
              perfil: {
                primeiroNome: data.nome,
                ultimoNome: data.sobrenome,
                dataNascimento: new Date(`${data.data_nascimento}T00:00:00`),
                endereco: {
                  rua: '',
                  numero: '',
                  bairro: '',
                  cidade: data.cidade,
                  estado: data.estado,
                  cep: data.cep,
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
            }
      );

      const token = response.access_token;
      await SecureStorageService.storeAuthData({
        token,
        refreshToken: response.refresh_token || '',
        user,
        expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
      });

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          usuario: user,
          token: token
        }
      });
      queryClient.setQueryData(['current-user'], user);
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const loginWithTokens = async (usuario: Usuario, token: string, _refreshToken?: string, _expiresIn?: number) => {
    try {
      await SecureStorageService.storeAuthData({
        token,
        refreshToken: _refreshToken ?? '',
        user: usuario,
        expiresAt: Date.now() + ((_expiresIn ? _expiresIn * 1000 : REFRESH_FALLBACK_TTL_MS)),
      });

      dispatch({ type: 'AUTH_SUCCESS', payload: { usuario, token } });
      queryClient.setQueryData(['current-user'], usuario);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }

      // Clear React Query cache to remove cached user data
      queryClient.clear();
      await SecureStorageService.clearAuthData();
      await removeToken();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state and cache
      queryClient.clear();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const updateUser = async (usuario: Usuario) => {
    try {
      const storedData = await SecureStorageService.getAuthData();
      if (storedData) {
        await SecureStorageService.storeAuthData({
          ...storedData,
          user: usuario,
        });
      }

      dispatch({ type: 'AUTH_UPDATE_PROFILE', payload: usuario });
      queryClient.setQueryData(['current-user'], usuario);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<Usuario>) => {
    try {
      if (!state.usuario) {
        throw new Error('No user logged in');
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
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const refreshCurrentUser = async (): Promise<Usuario | null> => {
    if (!state.token) {
      return null;
    }

    const currentUser = await userService.getCurrentUser();
    await updateUser(currentUser);
    return currentUser;
  };

  const refreshToken = async () => {
    await performTokenRefresh();
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    loginWithTokens,
    logout,
    updateUser,
    updateProfile,
    refreshCurrentUser,
    refreshToken,
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
