# Drivoo Target Architecture

## Objetivo

Estabelecer a arquitetura-alvo do Drivoo para evoluir o aplicativo mobile com estrutura profissional, modular e previsível, reduzindo duplicações, caminhos paralelos e ambiguidade sobre onde cada novo código deve ser criado.

Esta arquitetura deve suportar:

- app único para `aluno` e `instrutor`
- `admin` opcional e secundário no mobile
- integração progressiva com API real
- fluxo de desenvolvimento guiado por `spec -> design -> tasks -> implement`
- separação clara entre domínio, UI, estado remoto e estado cliente

## Princípios

### 1. Organização por domínio

As features devem ser organizadas por domínio de negócio, não por tipo de arquivo e não por papel do usuário.

Exemplos de domínios:

- `auth`
- `instructors`
- `bookings`
- `profile`
- `reviews`
- `notifications`
- `support`
- `payments` (futuro)

### 2. Um único contrato por camada

O app deve distinguir explicitamente:

- DTOs da API
- modelos de domínio do app
- modelos de UI, quando necessário

Nenhum componente de tela deve depender diretamente do formato cru da API.

### 3. Estado remoto com React Query

Todos os dados vindos da API devem ser tratados com `react-query`.

Uso esperado:

- cache
- loading/error state
- invalidação
- refetch
- sincronização de mutations

### 4. Estado global mínimo

Uso recomendado:

- `AuthContext` para sessão/autenticação
- `zustand` apenas para estado cliente compartilhado que não pertence ao cache remoto

Não usar store global para listas e entidades remotas da API.

### 5. Screens orquestram, services integram

Uma `screen` pode:

- compor hooks
- coordenar navegação
- tratar loading/error/empty state
- controlar interações de UI

Uma `screen` não deve:

- chamar `apiClient` diretamente
- mapear payload cru da API inline
- concentrar regra de domínio não trivial

## Estrutura-alvo

```text
src/
  app/
    navigation/
    providers/
    bootstrap/
    config/

  core/
    api/
      client/
      config/
      error/
    auth/
    storage/
    permissions/

  shared/
    ui/
      base/
      feedback/
      layout/
    hooks/
    lib/
    utils/
    types/
    constants/

  features/
    auth/
      api/
      hooks/
      screens/
      components/
      types/
      mappers/
      store/

    instructors/
      api/
      hooks/
      screens/
      components/
      types/
      mappers/
      store/

    bookings/
      api/
      hooks/
      screens/
      components/
      types/
      mappers/
      store/

    profile/
      api/
      hooks/
      screens/
      components/
      types/
      mappers/

    reviews/
      api/
      hooks/
      components/
      types/

    notifications/
      api/
      hooks/
      screens/
      types/

    support/
      api/
      hooks/
      screens/
      types/

    payments/
      api/
      hooks/
      screens/
      components/
      types/
      mappers/

  assets/
  theme/
```

## Responsabilidades por pasta

### `app/`

Contém composição global da aplicação:

- `providers`
- setup inicial
- navegação principal
- configuração transversal do app

### `core/`

Infraestrutura técnica compartilhada:

- cliente HTTP
- autenticação
- storage
- permissões nativas

Não deve conter regras de domínio específicas de feature.

### `shared/`

Elementos genéricos e reutilizáveis:

- componentes de base
- utilidades
- hooks genéricos
- constantes e tipos comuns

Se algo conhece “instrutor”, “agendamento” ou “avaliação”, ele provavelmente não pertence a `shared`.

### `features/`

Cada domínio de negócio fica isolado em seu módulo.

Exemplo em `bookings`:

- `api/`: chamadas e contratos remotos do domínio
- `hooks/`: queries e mutations
- `screens/`: telas do domínio
- `components/`: componentes visuais específicos do domínio
- `types/`: tipos de domínio da feature
- `mappers/`: transformação API -> domínio
- `store/`: estado cliente local compartilhado, se necessário

## Papéis do sistema

### Aluno

Responsável por:

- descobrir instrutores
- solicitar aulas
- acompanhar agendamentos
- confirmar realização
- avaliar instrutor

### Instrutor

Responsável por:

- manter perfil profissional
- expor disponibilidade
- aceitar ou recusar solicitações
- confirmar realização da aula
- acompanhar ganhos

### Admin

No mobile deve ser tratado como papel secundário. Não deve influenciar a organização principal da arquitetura enquanto seu escopo estiver indefinido.

## Domínios centrais

### `instructors`

Responsável por:

- busca
- detalhe
- disponibilidade
- veículo
- perfil público/profissional

### `bookings`

Domínio central compartilhado por aluno e instrutor.

Não pertence a uma role específica.

Responsável por:

- solicitação de reserva
- validação de disponibilidade
- aceitação/recusa
- status da aula
- confirmação pós-aula

### `profile`

Responsável por:

- dados do usuário logado
- edição de dados básicos
- configurações da conta

### `payments`

Deve existir como domínio futuro preparado, mas desacoplado do modelo de `booking` até a regra comercial ser definida.

## Fluxo inicial de agendamento

Fluxo-base acordado:

1. aluno encontra instrutor
2. aluno solicita reserva
3. instrutor aceita ou recusa
4. aula acontece
5. aluno confirma realização
6. instrutor confirma realização
7. avaliação e liquidação financeira entram conforme fase do produto

Este fluxo deve orientar nomes de status, telas e mutations futuras.

## Regras de implementação

### Obrigatórias

- tela não chama `apiClient` direto
- toda integração deve passar por service da feature
- toda resposta remota relevante deve ter mapper
- mocks não podem ser fonte primária de dado em telas de produção
- query keys devem ser padronizadas por domínio

### Recomendadas

- componentes de domínio ficam dentro da feature
- componentes genéricos ficam em `shared/ui/base`
- stores locais de feature devem ser pequenos e explícitos
- documentação de features complexas deve viver em `docs/specs/<feature>/`

## Processo de evolução

### Exige spec completa

- nova feature de domínio
- mudança de fluxo de negócio
- mudança estrutural de arquitetura
- integração complexa com API

### Não exige spec completa

- ajuste visual pequeno
- refatoração localizada sem impacto de fluxo
- correção simples de bug de UI

Nesses casos, ainda é esperado registrar decisões importantes no código e manter coerência com a arquitetura.
