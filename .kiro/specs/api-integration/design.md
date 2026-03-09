# Design Document: API Integration

## Overview

Este documento descreve a arquitetura de integração entre o frontend React Native e a API backend do Drivoo. A solução utiliza uma abordagem híbrida combinando Axios para autenticação e React Query (TanStack Query) para gerenciamento de dados, proporcionando uma experiência robusta, performática e com tratamento de erros consistente.

## Architecture

### Component Hierarchy

```
App.tsx
├── QueryClientProvider (React Query)
├── AuthProvider (Context API)
└── RootNavigator
    ├── AuthStack (Login, Register)
    └── AppStack (Home, Profile, etc)
```

### Data Flow

```
User Action (Login)
    ↓
AuthService.login()
    ↓
Axios POST /auth/login
    ↓
Store JWT + Refresh Token (AsyncStorage)
    ↓
Update AuthContext
    ↓
Redirect to AppStack
    ↓
useUserQuery() fetches user data
    ↓
React Query caches + displays data
```

### Service Layer Architecture

```
src/services/
├── api/
│   ├── client.ts              # Axios instance com interceptadores
│   ├── config.ts              # Configuração de ambiente
│   └── types.ts               # Tipos de resposta da API
├── auth/
│   ├── authService.ts         # Login, logout, refresh token
│   ├── authContext.tsx        # Context para estado de auth
│   ├── tokenStorage.ts        # Armazenamento seguro de tokens
│   └── types.ts               # Tipos de autenticação
└── queries/
    ├── useUserQuery.ts        # React Query para dados do usuário
    ├── useAuthMutation.ts     # React Query para login/register
    └── queryClient.ts         # Configuração do QueryClient
```

## Components and Interfaces

### 1. API Client (Axios)

```typescript
// src/services/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './config';
import { getToken, setToken, removeToken } from '../auth/tokenStorage';

interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Adiciona token JWT
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Trata erros e renova tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Se erro 401 e não é tentativa de refresh
    if (error.response?.status === 401 && !originalRequest?.headers['X-Retry']) {
      try {
        // Tenta renovar token
        const refreshToken = await getRefreshToken();
        const response = await axios.post<TokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token } = response.data;
        await setToken(access_token);

        // Retry original request
        originalRequest.headers['X-Retry'] = 'true';
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh falhou - redireciona para login
        removeToken();
        // Dispatch logout action
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Authentication Service

```typescript
// src/services/auth/authService.ts
import apiClient from '../api/client';
import { setToken, setRefreshToken, removeToken } from './tokenStorage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
  userType: 'student' | 'instructor' | 'admin';
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials
      );

      const { access_token, refresh_token } = response.data;
      await setToken(access_token);
      await setRefreshToken(refresh_token);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        credentials
      );

      const { access_token, refresh_token } = response.data;
      await setToken(access_token);
      await setRefreshToken(refresh_token);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await removeToken();
    }
  },

  private handleError(error: any): Error {
    if (error.response?.status === 401) {
      return new Error('Email ou senha inválidos');
    }
    if (error.response?.status === 422) {
      return new Error('Dados de entrada inválidos');
    }
    if (error.response?.status >= 500) {
      return new Error('Erro no servidor. Tente novamente mais tarde');
    }
    if (error.message === 'Network Error') {
      return new Error('Erro de conexão. Verifique sua internet');
    }
    return error;
  },
};
```

### 3. Authentication Context

```typescript
// src/services/auth/authContext.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, removeToken } from './tokenStorage';
import { authService } from './authService';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'instructor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, userType: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura sessão ao iniciar app
  useEffect(() => {
    restoreToken();
  }, []);

  const restoreToken = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        // Aqui você faria uma requisição para validar o token
        // e carregar dados do usuário
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to restore token:', error);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, userType: string) => {
      try {
        setIsLoading(true);
        const response = await authService.register({
          name,
          email,
          password,
          userType: userType as 'student' | 'instructor' | 'admin',
        });
        setUser(response.user);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn: !!user,
    login,
    register,
    logout,
    restoreToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 4. React Query Setup

```typescript
// src/services/queries/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (antes: cacheTime)
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### 5. User Query Hook

```typescript
// src/services/queries/useUserQuery.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import apiClient from '../api/client';

interface UserData {
  id: string;
  email: string;
  name: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
}

export const useUserQuery = (): UseQueryResult<UserData, Error> => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: UserData }>('/users/me');
      return response.data.data;
    },
    enabled: true, // Será habilitado quando houver token
  });
};
```

### 6. Auth Mutation Hook

```typescript
// src/services/queries/useAuthMutation.ts
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { authService } from '../auth/authService';

interface LoginVariables {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const useLoginMutation = (): UseMutationResult<AuthResponse, Error, LoginVariables> => {
  return useMutation({
    mutationFn: (credentials: LoginVariables) =>
      authService.login(credentials),
  });
};
```

## Token Storage

```typescript
// src/services/auth/tokenStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@drivoo:auth:token';
const REFRESH_TOKEN_KEY = '@drivoo:auth:refresh_token';

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to set token:', error);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to set refresh token:', error);
  }
}

export async function removeToken(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    ]);
  } catch (error) {
    console.error('Failed to remove tokens:', error);
  }
}
```

## Configuration

```typescript
// src/services/api/config.ts
import { Platform } from 'react-native';

const ENV = {
  dev: {
    API_BASE_URL: 'http://127.0.0.1:8000',
    API_TIMEOUT: 30000,
  },
  staging: {
    API_BASE_URL: 'https://api-staging.drivoo.com',
    API_TIMEOUT: 30000,
  },
  prod: {
    API_BASE_URL: 'https://api.drivoo.com',
    API_TIMEOUT: 30000,
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export const { API_BASE_URL, API_TIMEOUT } = getEnvVars();
```

## Error Handling Strategy

```typescript
// src/services/api/errorHandler.ts
import { AxiosError } from 'axios';

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status || 0;
    const data = error.response?.data as any;

    return {
      code: data?.error || 'UNKNOWN_ERROR',
      message: data?.message || getDefaultErrorMessage(statusCode),
      statusCode,
      details: data?.details,
    };
  }

  return {
    code: 'NETWORK_ERROR',
    message: 'Erro de conexão. Verifique sua internet.',
    statusCode: 0,
  };
}

function getDefaultErrorMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: 'Requisição inválida',
    401: 'Não autorizado. Faça login novamente.',
    403: 'Acesso negado',
    404: 'Recurso não encontrado',
    422: 'Dados de entrada inválidos',
    500: 'Erro no servidor',
    503: 'Serviço indisponível',
  };

  return messages[statusCode] || 'Erro desconhecido';
}
```

## App.tsx Integration

```typescript
// App.tsx
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/services/auth/authContext';
import { queryClient } from '@/services/queries/queryClient';
import RootNavigator from '@/routes/RootNavigator';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

## Correctness Properties

### Property 1: Token Persistence and Restoration
For any valid JWT token stored in AsyncStorage, when the app is restarted, the token should be automatically restored and the user should remain authenticated without requiring a new login.

### Property 2: Automatic Token Renewal
For any expired access token with a valid refresh token, when a request is made, the system should automatically renew the access token and retry the original request without user intervention.

### Property 3: Consistent Error Handling
For any API error response, the system should consistently map the error to a user-friendly message and handle it appropriately (retry, redirect to login, display error, etc).

### Property 4: Request Deduplication
For multiple simultaneous requests to the same endpoint with identical parameters, React Query should deduplicate and return the same cached result without making multiple API calls.

### Property 5: Cache Invalidation
For any mutation that modifies data (login, update profile), the related query cache should be automatically invalidated and refetched to ensure data consistency.

