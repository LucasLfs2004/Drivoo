# Implementation Plan: API Integration

## Overview

Este plano implementa a integração entre o frontend React Native e a API backend do Drivoo. A implementação será incremental, começando pela configuração do cliente HTTP, depois autenticação, e finalmente integração com React Query para gerenciamento de dados.

## Tasks

- [x] 1. Instalar dependências necessárias
  - Instalar axios para requisições HTTP
  - Instalar @tanstack/react-query para gerenciamento de cache
  - Verificar que todas as dependências foram instaladas corretamente
  - _Requirements: 1.1_

- [x] 2. Configurar cliente HTTP com Axios
  - [x] 2.1 Criar arquivo `src/services/api/config.ts`
    - Definir URL base da API (http://127.0.0.1:8000)
    - Definir timeout padrão (30 segundos)
    - Suportar diferentes ambientes (dev, staging, prod)
    - _Requirements: 1.1, 1.4_

  - [x] 2.2 Criar arquivo `src/services/api/client.ts`
    - Criar instância Axios com configuração base
    - Implementar request interceptor para adicionar token JWT
    - Implementar response interceptor para tratar erros
    - Implementar renovação automática de tokens expirados
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.3 Criar arquivo `src/services/api/errorHandler.ts`
    - Implementar função para mapear erros HTTP para mensagens amigáveis
    - Diferenciar entre erros de rede, servidor e validação
    - Retornar estrutura consistente de erro
    - _Requirements: 1.5_

  - [x] 2.4 Criar arquivo `src/services/api/types.ts`
    - Definir interfaces para respostas da API
    - Definir tipos para tokens e autenticação
    - Definir tipos para dados de usuário
    - _Requirements: 1.1_

- [-] 3. Implementar armazenamento seguro de tokens
  - [x] 3.1 Criar arquivo `src/services/auth/tokenStorage.ts`
    - Implementar `getToken()` - recupera token do AsyncStorage
    - Implementar `setToken()` - armazena token no AsyncStorage
    - Implementar `getRefreshToken()` - recupera refresh token
    - Implementar `setRefreshToken()` - armazena refresh token
    - Implementar `removeToken()` - remove ambos os tokens
    - Adicionar tratamento de erros para falhas do AsyncStorage
    - _Requirements: 3.1, 6.1, 6.2_

  - [ ]* 3.2 Escrever testes de propriedade para persistência de tokens
    - **Property 1: Token Persistence and Restoration**
    - **Validates: Requirements 3.1, 6.1**
    - Testar que token salvo e restaurado é idêntico

- [x] 4. Implementar serviço de autenticação
  - [x] 4.1 Criar arquivo `src/services/auth/authService.ts`
    - Implementar função `login(email, password)`
    - Implementar função `register(name, email, password, userType)`
    - Implementar função `logout()`
    - Armazenar tokens automaticamente após login bem-sucedido
    - Remover tokens ao fazer logout
    - Tratar erros de autenticação com mensagens claras
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.2 Escrever testes de propriedade para autenticação
    - **Property 3: Consistent Error Handling**
    - **Validates: Requirements 2.4, 5.1_

- [x] 5. Implementar Context API para autenticação
  - [x] 5.1 Criar arquivo `src/services/auth/authContext.tsx`
    - Criar AuthContext com tipos TypeScript
    - Implementar AuthProvider component
    - Implementar hook `useAuth()` para acessar contexto
    - Gerenciar estado de usuário (user, isLoading, isSignedIn)
    - Implementar funções: login, register, logout, restoreToken
    - Restaurar sessão ao iniciar app (useEffect)
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.2 Escrever testes unitários para AuthContext
    - Testar que AuthProvider fornece contexto corretamente
    - Testar que useAuth() lança erro fora do provider
    - Testar que restoreToken() carrega token do AsyncStorage
    - Testar que login() atualiza estado de usuário
    - Testar que logout() limpa estado de usuário
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Configurar React Query
  - [x] 6.1 Criar arquivo `src/services/queries/queryClient.ts`
    - Criar instância QueryClient com configurações padrão
    - Configurar staleTime (5 minutos)
    - Configurar gcTime (10 minutos)
    - Configurar retry automático com backoff exponencial
    - _Requirements: 1.1_

  - [x] 6.2 Atualizar `App.tsx`
    - Envolver app com QueryClientProvider
    - Envolver app com AuthProvider
    - Garantir ordem correta de providers (QueryClient → Auth → Navigation)
    - _Requirements: 1.1_

- [x] 7. Implementar hooks de autenticação com React Query
  - [x] 7.1 Criar arquivo `src/services/queries/useAuthMutation.ts`
    - Implementar `useLoginMutation()` - mutation para login
    - Implementar `useRegisterMutation()` - mutation para registro
    - Integrar com authService
    - Retornar loading, error, success states
    - _Requirements: 2.1, 2.2_

  - [ ]* 7.2 Escrever testes de propriedade para mutations
    - **Property 4: Request Deduplication**
    - **Validates: Requirements 1.2**
    - Testar que múltiplas requisições simultâneas são deduplicadas

- [x] 8. Implementar hooks de dados com React Query
  - [x] 8.1 Criar arquivo `src/services/queries/useUserQuery.ts`
    - Implementar `useUserQuery()` - query para dados do usuário
    - Fazer requisição GET /users/me
    - Retornar data, isLoading, error, refetch
    - Habilitar query apenas quando autenticado
    - _Requirements: 4.1, 4.2_

  - [ ]* 8.2 Escrever testes de propriedade para cache
    - **Property 5: Cache Invalidation**
    - **Validates: Requirements 4.1**
    - Testar que cache é invalidado após mutations

- [x] 9. Checkpoint - Validar configuração de API
  - Verificar que cliente HTTP está configurado corretamente
  - Testar conexão com API (fazer requisição simples)
  - Verificar que interceptadores estão funcionando
  - Perguntar ao usuário se há dúvidas ou ajustes necessários

- [x] 10. Integrar login na tela de autenticação
  - [x] 10.1 Atualizar `src/screens/auth/LoginScreen.tsx`
    - Integrar `useLoginMutation()` do React Query
    - Chamar mutation ao submeter formulário
    - Exibir loading state durante requisição
    - Exibir erro se login falhar
    - Redirecionar para home se login bem-sucedido
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 10.2 Escrever testes unitários para LoginScreen
    - Testar que formulário valida email e senha
    - Testar que mutation é chamada ao submeter
    - Testar que erro é exibido se login falha
    - Testar que redirecionamento ocorre se login bem-sucede
    - _Requirements: 2.1, 2.2_

- [x] 11. Integrar recuperação de dados do usuário
  - [x] 11.1 Atualizar `src/screens/client/ProfileScreen.tsx`
    - Usar `useUserQuery()` para carregar dados
    - Exibir loading state enquanto carrega
    - Exibir erro se falhar
    - Exibir dados do usuário quando carregado
    - Implementar botão de refresh
    - _Requirements: 4.1, 4.2_

  - [ ]* 11.2 Escrever testes unitários para ProfileScreen
    - Testar que query é executada ao montar
    - Testar que loading state é exibido
    - Testar que dados são exibidos quando carregados
    - Testar que erro é exibido se falhar
    - _Requirements: 4.1, 4.2_

- [x] 12. Implementar logout
  - [x] 12.1 Atualizar navegação para incluir botão de logout
    - Adicionar botão de logout em menu ou header
    - Chamar `authService.logout()` ao clicar
    - Limpar cache do React Query
    - Redirecionar para tela de login
    - _Requirements: 3.3_

  - [ ]* 12.2 Escrever testes unitários para logout
    - Testar que logout remove tokens
    - Testar que cache é limpo
    - Testar que redirecionamento ocorre
    - _Requirements: 3.3_

- [x] 13. Implementar tratamento de erros de API
  - [x] 13.1 Criar componentes de erro
    - Criar componente `ErrorBoundary` para erros de rede
    - Criar componente `ErrorAlert` para exibir erros
    - Implementar retry automático para erros de rede
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 13.2 Escrever testes unitários para tratamento de erros
    - Testar que erro 401 redireciona para login
    - Testar que erro 403 exibe mensagem de acesso negado
    - Testar que erro 500 exibe mensagem genérica
    - Testar que erro de rede permite retry
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 14. Implementar renovação automática de tokens
  - [x] 14.1 Atualizar response interceptor do Axios
    - Detectar erro 401 (token expirado)
    - Chamar endpoint de refresh token
    - Armazenar novo token
    - Retry requisição original com novo token
    - Se refresh falhar, redirecionar para login
    - _Requirements: 3.2, 3.3_

  - [ ]* 14.2 Escrever testes de propriedade para renovação
    - **Property 2: Automatic Token Renewal**
    - **Validates: Requirements 3.2, 3.3**
    - Testar que token expirado é renovado automaticamente

- [x] 15. Checkpoint final - Validar integração completa
  - Executar todos os testes (unitários e de propriedade)
  - Testar fluxo completo: login → carregar dados → logout
  - Testar renovação de token
  - Testar tratamento de erros
  - Testar que dados são cacheados corretamente
  - Perguntar ao usuário se há ajustes finais necessários

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam correção universal
- Testes unitários validam exemplos específicos e casos extremos
- A implementação usa TypeScript para segurança de tipos
- Axios fornece interceptadores para autenticação
- React Query fornece caching e sincronização de dados
- AsyncStorage fornece armazenamento seguro de tokens
- Todos os erros devem ser tratados com mensagens amigáveis ao usuário

