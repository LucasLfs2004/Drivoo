# Foundation Migration Spec

## Contexto

Antes de migrar os domínios de negócio do Drivoo para a arquitetura feature-based, é necessário estabilizar a fundação da aplicação.

Hoje a base do projeto ainda está concentrada em estruturas legadas como:

- `src/navigation`
- `src/contexts`
- `src/services`
- `src/components/common`
- `src/components/navigation`
- `src/themes`

Essa base funciona, mas não representa ainda a arquitetura-alvo com separação entre:

- `app`
- `core`
- `shared`
- `features`

## Problema

Migrar domínios de negócio antes da fundação cria dois riscos:

- features novas nascerem acopladas à infraestrutura antiga
- retrabalho estrutural ao mover navegação, auth e API depois

## Objetivo

Migrar primeiro a fundação do app para que todos os próximos domínios sejam implementados sobre a estrutura correta.

## Escopo

### Em escopo

- `src/app/navigation`
- `src/app/providers`
- `src/core/auth`
- `src/core/api`
- `src/core/storage`
- `src/shared/ui/base`
- `src/shared/ui/feedback`
- convenções iniciais de export e organização

### Fora de escopo

- migração completa de domínios como `instructors`, `bookings` e `profile`
- reescrita do design system inteiro
- mudança grande de UX

## Resultado esperado

Ao fim desta etapa:

- a navegação principal estará estruturada em `app/navigation`
- a autenticação principal estará consolidada em `core/auth`
- o cliente HTTP e infraestrutura de integração estarão em `core/api`
- componentes genéricos de base começarão a sair de `components/common` para `shared/ui/base`
- domínios futuros terão uma fundação clara para migrar

## Motivação

Esta etapa existe para garantir que a primeira feature migrada de domínio não precise redefinir:

- como a navegação é organizada
- onde o auth vive
- onde o `apiClient` vive
- o que é componente genérico vs componente de domínio

## Decisões

### Navegação

Navegação é responsabilidade de `app`, não de domínio.

### Auth

Auth é infraestrutura central, não apenas uma feature de tela.

Por isso, seu núcleo deve ficar em `core/auth`, ainda que existam telas de login dentro de `features/auth` no futuro.

### API

Cliente HTTP, interceptors, config e tratamento base de erro são `core/api`.

Integrações de domínio devem consumir essa base a partir de suas próprias camadas `api/`.

### Shared UI

Componentes realmente genéricos devem migrar para `shared/ui/base`.

Componentes ainda muito específicos não devem ser promovidos cedo demais para `shared`.

## Critérios de aceite

- `app/navigation` passa a ser a referência estrutural da navegação
- existe um único núcleo principal de auth em `core/auth`
- cliente HTTP e infraestrutura base da API ficam em `core/api`
- começa a existir separação clara entre UI base genérica e componentes de domínio
- os domínios passam a depender da nova fundação, não da antiga
