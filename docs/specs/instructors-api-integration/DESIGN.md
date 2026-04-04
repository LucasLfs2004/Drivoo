# Instructor Screens API Integration Design

## Objetivo técnico

Transformar as telas do instrutor em consumidoras reais do domínio `instructors`, removendo mocks locais e centralizando leitura, mutation e mapeamento no módulo `src/features/instructors`.

O design desta etapa prioriza:

- perfil profissional do instrutor
- disponibilidade semanal
- veículos
- financeiro
- reaproveitamento desses dados no dashboard

## Princípios

### 1. O domínio continua centralizado em `features/instructors`

Mesmo quando a tela estiver hoje em `profile` ou `instructor-panel`, a integração remota deve nascer em `features/instructors`.

### 2. Screens orquestram, hooks encapsulam

As telas não devem:

- chamar `apiClient` diretamente
- transformar payload cru inline
- decidir sozinhas como invalidar cache

As telas devem apenas:

- consumir hooks
- disparar ações
- renderizar loading, empty, success e error state

### 3. Nenhum schema de resposta será inferido sem validação

Quando a OpenAPI não trouxer schema de resposta suficiente para uma task:

- a implementação pausa naquele ponto
- o payload real do backend é solicitado
- DTO, mapper e hook só são finalizados após essa validação

## Estrutura alvo

```text
src/features/instructors/
  api/
    instructorDetailsApi.ts
    instructorProfileApi.ts
    instructorScheduleApi.ts
    instructorVehiclesApi.ts
    instructorEarningsApi.ts
  hooks/
    queryKeys.ts
    useInstructorDetailsQuery.ts
    useInstructorProfileUpdateMutation.ts
    useInstructorScheduleQuery.ts
    useCreateInstructorAvailabilityMutation.ts
    useUpdateInstructorAvailabilityMutation.ts
    useDeleteInstructorAvailabilityMutation.ts
    useInstructorVehiclesQuery.ts
    useCreateInstructorVehicleMutation.ts
    useUpdateInstructorVehicleMutation.ts
    useDeleteInstructorVehicleMutation.ts
    useInstructorEarningsHistoryQuery.ts
    useInstructorEarningsTrendQuery.ts
    useInstructorRecentPaymentsQuery.ts
  mappers/
    mapInstructorDetails.ts
    mapInstructorSchedule.ts
    mapInstructorVehicle.ts
    mapInstructorEarnings.ts
  types/
    api.ts
    domain.ts
  index.ts
```

## Organização por camada

### `api/`

Responsável por:

- chamadas HTTP
- passagem de params
- tipagem de request e response DTO

Arquivos previstos:

- `instructorDetailsApi.ts`
  - `GET /instrutores/me`
- `instructorProfileApi.ts`
  - `PUT /instrutores/me`
- `instructorScheduleApi.ts`
  - `GET /instrutores/me/disponibilidades`
  - `POST /instrutores/me/disponibilidades`
  - `PUT /instrutores/me/disponibilidades/{disponibilidade_id}`
  - `DELETE /instrutores/me/disponibilidades/{disponibilidade_id}`
- `instructorVehiclesApi.ts`
  - `GET /instrutores/me/veiculos`
  - `POST /instrutores/me/veiculos`
  - `PUT /instrutores/me/veiculos/{veiculo_id}`
  - `DELETE /instrutores/me/veiculos/{veiculo_id}`
- `instructorEarningsApi.ts`
  - `GET /instrutores/me/ganhos/historico`
  - `GET /instrutores/me/ganhos/tendencia`
  - `GET /instrutores/me/pagamentos/recentes`

### `mappers/`

Responsável por:

- transformar DTO em modelo de domínio da feature
- normalizar enums
- preencher defaults seguros
- adaptar campos opcionais para a UI atual

Mapeadores previstos:

- `mapInstructorDetails.ts`
- `mapInstructorSchedule.ts`
- `mapInstructorVehicle.ts`
- `mapInstructorEarnings.ts`

### `hooks/`

Responsável por:

- encapsular `react-query`
- expor interface estável para as telas
- concentrar cache e invalidação

### `types/`

Responsável por:

- DTOs de request e response em `api.ts`
- modelos de domínio usados pelas telas em `domain.ts`

## Modelos de domínio previstos

### Perfil do instrutor

Modelo esperado para abastecer `InstrutorProfileScreen` e `EditInstructorProfileScreen`:

- identidade básica
- avaliação
- preço por hora
- bio
- anos de experiência
- tags ou especialidades
- gênero
- endereço, quando existir

### Disponibilidade semanal

Modelo esperado para abastecer `InstrutorScheduleScreen`:

- lista de disponibilidades persistidas
- agrupamento por dia da semana
- slots editáveis pela UI
- estado derivado para exibir dia ativo ou vazio

### Veículos

Modelo esperado para perfil e edição:

- lista de veículos do instrutor
- indicação de veículo ativo, se o backend trouxer isso
- transmissão normalizada para `manual` e `automatico`
- flag `aceitaVeiculoAluno`

### Financeiro

Modelo esperado para `InstrutorEarningsScreen` e cards do dashboard:

- histórico paginado de ganhos
- série temporal para gráfico
- pagamentos recentes
- valores agregados derivados no app, como total do mês, quando o backend não trouxer resumo pronto

## Query keys

O arquivo `queryKeys.ts` deve ser ampliado para suportar o lado do instrutor autenticado sem criar um segundo namespace paralelo.

Estrutura sugerida:

```ts
export const instructorQueryKeys = {
  all: ['instructors'] as const,
  me: () => [...instructorQueryKeys.all, 'me'] as const,
  schedule: () => [...instructorQueryKeys.all, 'schedule', 'me'] as const,
  vehicles: () => [...instructorQueryKeys.all, 'vehicles', 'me'] as const,
  earningsHistory: (filters: unknown) =>
    [...instructorQueryKeys.all, 'earnings-history', 'me', filters] as const,
  earningsTrend: (filters: unknown) =>
    [...instructorQueryKeys.all, 'earnings-trend', 'me', filters] as const,
  recentPayments: (filters: unknown) =>
    [...instructorQueryKeys.all, 'recent-payments', 'me', filters] as const,
};
```

As rotas com `{instrutor_id}` podem continuar existindo no domínio para outros fluxos, mas não são a preferência desta trilha.

## Matriz tela -> hooks -> rotas

### `InstrutorProfileScreen`

Hooks:

- `useInstructorDetailsQuery`
- `useInstructorVehiclesQuery`

Rotas:

- `GET /instrutores/me`
- `GET /instrutores/me/veiculos`

Comportamento:

- `AuthContext` continua sendo usado só para descobrir o usuário logado
- dados profissionais exibidos na tela vêm do domínio `instructors`
- se `GET /instrutores/me` não trouxer tudo que a UI pede, a tela deve esconder ou degradar os campos ausentes

### `EditInstructorProfileScreen`

Hooks:

- `useInstructorDetailsQuery`
- `useInstructorVehiclesQuery`
- `useInstructorProfileUpdateMutation`
- `useCreateInstructorVehicleMutation`
- `useUpdateInstructorVehicleMutation`
- `useDeleteInstructorVehicleMutation`

Rotas:

- `GET /instrutores/me`
- `PUT /instrutores/me`
- `GET /instrutores/me/veiculos`
- `POST /instrutores/me/veiculos`
- `PUT /instrutores/me/veiculos/{veiculo_id}`
- `DELETE /instrutores/me/veiculos/{veiculo_id}`

Comportamento:

- formulário deve ser rebaixado ao contrato realmente persistível
- campos sem suporte backend não entram em mutation
- após mutation bem-sucedida, invalidar:
  - `me`
  - `vehicles`

### `InstrutorScheduleScreen`

Hooks:

- `useInstructorScheduleQuery`
- `useCreateInstructorAvailabilityMutation`
- `useUpdateInstructorAvailabilityMutation`
- `useDeleteInstructorAvailabilityMutation`

Rotas:

- `GET /instrutores/me/disponibilidades`
- `POST /instrutores/me/disponibilidades`
- `PUT /instrutores/me/disponibilidades/{disponibilidade_id}`
- `DELETE /instrutores/me/disponibilidades/{disponibilidade_id}`

Comportamento:

- `WeeklyScheduleEditor` continua como UI principal
- a camada de integração adapta agenda persistida para o formato exigido pelo editor
- ao salvar, a tela traduz mudanças de UI em operações create, update e delete
- após mutation bem-sucedida, invalidar `schedule`

Decisão importante:

- a tela não deve mais usar mock de aulas para completar a semana
- dias sem agendamento do domínio `bookings` devem aparecer apenas com disponibilidade ou vazio

### `InstrutorEarningsScreen`

Hooks:

- `useInstructorEarningsHistoryQuery`
- `useInstructorEarningsTrendQuery`
- `useInstructorRecentPaymentsQuery`

Rotas:

- `GET /instrutores/me/ganhos/historico`
- `GET /instrutores/me/ganhos/tendencia`
- `GET /instrutores/me/pagamentos/recentes`

Comportamento:

- a lista de pagamentos recentes sai do mock
- os gráficos passam a usar a série vinda do backend
- somatórios como “este mês” e “total” podem ser derivados no app a partir do histórico, se necessário

### `InstrutorDashboardScreen`

Hooks:

- `useInstructorScheduleQuery`
- `useInstructorEarningsTrendQuery`
- `useInstructorRecentPaymentsQuery` ou `useInstructorEarningsHistoryQuery`, conforme o payload real

Rotas:

- mesmas rotas já consumidas por disponibilidade e financeiro

Comportamento:

- o dashboard não cria APIs próprias
- ele reaproveita os hooks existentes
- se faltar backend para “Agenda de Hoje” e “Solicitações Recentes”, os cards devem ficar em estado vazio honesto

## Estratégia de mutations

### Perfil

Mutation:

- `useInstructorProfileUpdateMutation`

Invalidação:

- `me`

### Veículos

Mutations:

- `useCreateInstructorVehicleMutation`
- `useUpdateInstructorVehicleMutation`
- `useDeleteInstructorVehicleMutation`

Invalidação:

- `vehicles`
- `me`, se o perfil refletir veículo principal

### Disponibilidade

Mutations:

- `useCreateInstructorAvailabilityMutation`
- `useUpdateInstructorAvailabilityMutation`
- `useDeleteInstructorAvailabilityMutation`

Invalidação:

- `schedule`

## Adaptação da UI atual

### `InstrutorProfileScreen`

Deve parar de depender exclusivamente de `usuario.perfil` para:

- valor por hora
- avaliações
- veículo
- dados profissionais

Pode manter `AuthContext` para:

- nome base do usuário
- e-mail
- logout

### `EditInstructorProfileScreen`

Deve ser simplificada para não prometer persistência onde ela não existe.

Campos candidatos a permanecer:

- preço por hora
- experiência
- bio
- tags, se a UI fizer sentido
- gênero
- endereço
- veículo

Campos candidatos a sair ou ficar como pendentes:

- `detranId`
- `licencaNumero`
- `licencaVencimento`
- upload de documentos
- `veiculoMarca`

### `InstrutorScheduleScreen`

Deve separar visualmente:

- disponibilidade configurada pelo instrutor
- dados futuros de aulas agendadas

Nesta etapa, só a primeira parte será integrada.

### `InstrutorEarningsScreen`

Deve continuar com os mesmos gráficos e cards sempre que possível, mas a formatação dos dados virá do domínio.

Se o backend trouxer menos granularidade do que a UI atual espera:

- o gráfico é ajustado
- a integração não deve ser maquiada com dado inventado

## Riscos

- tentar encaixar a UI atual de edição em um contrato backend menor
- acoplar telas do instrutor novamente ao `AuthContext`
- criar hooks específicos do dashboard duplicando os do domínio
- inventar schema de response para acelerar a implementação

## Mitigações

- adaptar formulário ao contrato persistível
- usar `features/instructors` como única origem de integração
- reaproveitar hooks entre telas
- parar a implementação sempre que o response real estiver indefinido

## Resultado esperado do design

Ao final da implementação baseada neste design:

- as telas do instrutor consumirão dados reais do backend dentro do domínio `instructors`
- mutations e invalidações estarão padronizadas
- o dashboard reutilizará os mesmos dados sem novo fluxo paralelo
- qualquer lacuna de contrato será tratada de forma explícita com validação do backend antes da conclusão da task
