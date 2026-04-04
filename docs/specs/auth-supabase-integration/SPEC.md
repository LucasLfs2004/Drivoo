# Auth Supabase Integration Spec

## Contexto

O backend do Drivoo migrou o fluxo de autenticação para o Supabase Auth. O app mobile ainda depende do contrato legado com:

- `POST /auth/login`
- `POST /auth/registro/aluno`
- `POST /auth/registro/instrutor`
- refresh próprio da API

Agora o contrato válido é:

- autenticação no Supabase
- `GET /auth/me` para descobrir se a conta já concluiu onboarding
- `POST /auth/onboarding/aluno`
- `POST /auth/onboarding/instrutor`

## Problema

O app assume que autenticação e criação de perfil acontecem na mesma API. Isso quebra o novo backend e não representa o estado intermediário "sessão autenticada, mas onboarding pendente".

## Objetivo

Adaptar o mobile para o novo fluxo sem abrir um segundo caminho de auth:

1. login via Supabase
2. bootstrap da sessão persistida
3. leitura de `GET /auth/me`
4. roteamento para app ou onboarding
5. reaproveitamento da tela de cadastro atual para concluir onboarding

## Não objetivos

- reescrever toda a UX de onboarding
- introduzir mais uma store global para auth
- migrar agora fluxos não ligados à sessão

## Resultado esperado

- `AuthContext` passa a ser a única fonte de verdade da sessão
- o app entende `needs_onboarding` como estado legítimo
- login usa Supabase
- cadastro usa Supabase + endpoint de onboarding da API
- telas autenticadas só abrem após `profile_completed = true`

## Módulos afetados

- `src/core/auth`
- `src/core/storage`
- `src/features/auth`
- `src/features/profile/api`
- `src/navigation`

## Rotas envolvidas

- `GET /auth/me`
- `POST /auth/onboarding/aluno`
- `POST /auth/onboarding/instrutor`
- endpoints Supabase Auth (`signup`, `token`, `recover`, `logout`)
