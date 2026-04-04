# Auth Onboarding Steps Design

## Visão geral

O domínio `auth` passa a ter dois fluxos visuais distintos:

- `LoginScreen`
- `CreateAccountScreen`
- `OnboardingScreen`

## Estratégia

### Conta

A criação da conta fica restrita a:

- email
- senha
- confirmação de senha

Após `signUp`, o app tenta resolver o estado com `GET /auth/me`.

### Estado de onboarding

O `AuthContext` continua armazenando:

- sessão atual
- usuário mapeado, quando existir
- `needsOnboarding`
- `sessionEmail`

Além disso, a leitura de `auth/me` deve ser defensiva:

- se o backend marcar `needs_onboarding = true`, onboarding
- se retornar apenas identificadores mínimos sem perfil útil, onboarding

### Navegação

`AuthStack` passa a conter:

- `Login`
- `CreateAccount`
- `Onboarding`
- `ForgotPassword`

Se `isAuthenticated && needsOnboarding`, a rota inicial deve ser `Onboarding`.

## UI

### CreateAccountScreen

Layout simples:

- título
- email
- senha
- confirmar senha
- CTA principal
- link para login

### OnboardingScreen

Tela única com:

- cabeçalho com marca
- stepper visual
- card central com conteúdo do step
- botões voltar/próximo/finalizar

Componentes de apoio:

- `OnboardingStepper`
- `AccountTypeCard`
- `OnboardingSectionCard`

## Payloads

O estado local do onboarding deve ser agregado em um único draft de tela e convertido para `RegisterUser` só no submit final.

### Aluno

Submete `registerAluno` no último step.

### Instrutor

Submete `registerInstrutor` no último step.

## Estado

Não é necessário `zustand`.

O draft do onboarding pode ficar local na screen, pois o fluxo é isolado e linear.
