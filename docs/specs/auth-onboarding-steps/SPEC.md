# Auth Onboarding Steps Spec

## Contexto

Depois da migração para Supabase Auth, o Drivoo passou a separar:

- autenticação da conta
- criação do perfil de negócio no backend

O app ainda concentra criação de conta e onboarding em uma única tela extensa, o que conflita com o novo fluxo esperado do produto.

## Problema

Hoje a experiência de auth não reflete o comportamento da API:

- a tela de criação de conta ainda pede dados de perfil completos
- o onboarding não é guiado por etapas
- o redirecionamento após `GET /auth/me` ainda está acoplado a uma tela única

## Objetivo

Implementar um fluxo com duas fases:

1. criação da conta Supabase com `email`, `senha` e `confirmação de senha`
2. onboarding em steps, liberado sempre que `GET /auth/me` indicar perfil incompleto

## Regras de produto

- login continua com `email` e `senha`
- criação de conta usa `email`, `senha` e `confirmação de senha`
- após criar conta ou abrir o app, sempre consultar `GET /auth/me`
- se o perfil estiver completo, entrar na navegação principal
- se o retorno indicar perfil incompleto, navegar para onboarding
- aluno possui 3 etapas
- instrutor possui 4 etapas
- a etapa 4 existe somente para instrutor

## Etapas do onboarding

### Etapa 1

Informações pessoais:

- nome
- sobrenome
- telefone
- CPF
- data de nascimento
- endereço

### Etapa 2

Tipo de conta:

- aluno
- instrutor

### Etapa 3

Veículo:

- aluno pode informar se possui veículo e, se sim, seus dados
- instrutor informa os dados do veículo

### Etapa 4

Somente instrutor:

- número da CNH
- validade da CNH
- valor por hora

## Resultado esperado

- auth inicial fica simples
- onboarding segue o protótipo em passos
- `AuthContext` continua como fonte única da sessão
- `auth/me` dirige a decisão entre app e onboarding

## Módulos afetados

- `src/core/auth`
- `src/features/auth/api`
- `src/features/auth/screens`
- `src/features/auth/components`
- `src/features/auth/types`
- `src/navigation`

## Rotas envolvidas

- `GET /auth/me`
- `POST /auth/onboarding/aluno`
- `POST /auth/onboarding/instrutor`
- autenticação Supabase
