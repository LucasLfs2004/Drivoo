import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import {
  AuthState,
  Usuario,
  AuthAction,
  LoginCredentials,
  RegisterUser
} from '../types/auth';
import { authService } from '../services/auth/authService';
import { queryClient } from '../services/queries/queryClient';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterUser) => Promise<void>;
  loginWithTokens: (usuario: Usuario, token: string, refreshToken: string, expiresIn: number) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (usuario: Usuario) => Promise<void>;
  updateProfile: (data: Partial<Usuario>) => Promise<void>;
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

      // For development: Skip API checks and go directly to unauthenticated state
      // This allows us to test the login flows without API integration

      // Simulate a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));

      // No valid stored auth data - go to login screen
      dispatch({ type: 'AUTH_LOADING', payload: false });
    } catch (error) {
      console.error('Error initializing auth:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Failed to initialize authentication' });
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

      // Map API response to Usuario type
      const usuario: Usuario = {
        id: response.user?.id || `user-${Date.now()}`,
        email: response.user?.email || credentials.email,
        telefone: response.user?.phone || '',
        papel: (response.user?.userType || 'student') as 'aluno' | 'instrutor' | 'admin',
        perfil: {
          primeiroNome: response.user?.name?.split(' ')[0] || '',
          ultimoNome: response.user?.name?.split(' ').slice(1).join(' ') || '',
          dataNascimento: new Date(),
          endereco: {
            rua: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
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
        criadoEm: response.user?.createdAt ? new Date(response.user.createdAt) : new Date(),
        atualizadoEm: response.user?.updatedAt ? new Date(response.user.updatedAt) : new Date(),
      };

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          usuario,
          token: response.access_token
        }
      });
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

      // Call the register function for aluno using authService
      const response = await authService.registerAluno({
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

      // Create a user from the response
      const user: Usuario = {
        id: `user-aluno-${Date.now()}`,
        email: data.email,
        telefone: data.telefone,
        papel: 'aluno',
        perfil: {
          primeiroNome: data.nome,
          ultimoNome: data.sobrenome,
          dataNascimento: new Date(data.data_nascimento.split('/').reverse().join('-')),
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
      };

      const token = response.access_token;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          usuario: user,
          token: token
        }
      });
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const loginWithTokens = async (usuario: Usuario, token: string, _refreshToken?: string, _expiresIn?: number) => {
    try {
      // For mock mode, just update the state
      // const expiresAt = Date.now() + (expiresIn * 1000);

      // await SecureStorageService.storeAuthData({
      //   token,
      //   refreshToken,
      //   user: usuario,
      //   expiresAt,
      // });

      dispatch({ type: 'AUTH_SUCCESS', payload: { usuario, token } });
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

      // For development: Skip API call and just clear local state
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
      // For mock mode, just update the state
      // Update user in secure storage
      // const storedData = await SecureStorageService.getAuthData();
      // if (storedData) {
      //   await SecureStorageService.storeAuthData({
      //     ...storedData,
      //     user: usuario,
      //   });
      // }

      dispatch({ type: 'AUTH_UPDATE_PROFILE', payload: usuario });
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

      // Merge the updated data with existing user data
      const updatedUser: Usuario = {
        ...state.usuario,
        ...data,
        perfil: {
          ...state.usuario.perfil,
          ...data.perfil,
        },
        atualizadoEm: new Date(),
      };

      // For mock mode, just update the state
      // TODO: Call API to update profile on backend
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch({ type: 'AUTH_UPDATE_PROFILE', payload: updatedUser });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
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