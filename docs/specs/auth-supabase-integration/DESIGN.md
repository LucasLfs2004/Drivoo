# Auth Supabase Integration Design

## Estratégia

Manter o `AuthContext` como orquestrador e substituir apenas a camada de autenticação subjacente.

## Estado

O estado de auth precisa carregar:

- `token`
- `refreshToken`
- `sessionEmail`
- `usuario`
- `needsOnboarding`

Isso permite representar:

1. deslogado
2. autenticado com perfil completo
3. autenticado com onboarding pendente

## Fluxos

### Login

1. app autentica no Supabase
2. usa o `access_token` para chamar `GET /auth/me`
3. se `needs_onboarding = true`, mantém sessão mas envia para `Register`
4. se `usuario` existir, mapeia para `Usuario` e libera navegação principal

### Cadastro novo

1. app cria a sessão no Supabase com email e senha
2. com o JWT retornado, chama o endpoint de onboarding correto
3. resposta da API vira o `usuario` do contexto

### Sessão persistida

1. app recupera token e refresh token do storage
2. chama `GET /auth/me`
3. restaura `usuario` ou estado de onboarding pendente

### Refresh token

1. interceptor detecta `401`
2. `AuthApiService.refreshToken` chama o endpoint do Supabase
3. storage e contexto recebem o novo par de tokens

## Navegação

- `RootNavigator` envia para `AuthStack` quando:
  - não há sessão
  - `needsOnboarding = true`
- `AuthStackNavigator` abre `Register` automaticamente se houver sessão pendente de onboarding

## Reuso da tela de cadastro

`RegisterScreen` terá dois modos:

- criação de conta: mostra email e senha
- conclusão de onboarding: mantém email da sessão e oculta senha

## Configuração

Novas variáveis esperadas:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `API_BASE_URL`
