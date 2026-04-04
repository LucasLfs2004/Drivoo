# Instructor Screens API Integration Spec

## Contexto

O domínio de instrutores já foi usado como feature piloto da arquitetura nova, mas o foco desta etapa não é mais o catálogo do aluno.

Hoje coexistem três estados no app:

- telas do instrutor ainda baseadas em mock ou em dados incompletos do `AuthContext`
- contratos de UI do instrutor maiores do que o backend disponível em `/instrutores`
- partes do app do aluno que dependem indiretamente desses dados de instrutor

O arquivo `docs/openapi/openapi.json` concentra todas as rotas disponíveis hoje. Para esta etapa, o recorte do domínio será tudo que começa com `/instrutores`.

## Problema

Ainda não existe uma definição única de:

- quais telas do lado do instrutor conseguem ser integradas agora só com as rotas `/instrutores`
- quais áreas do painel do instrutor ainda dependem também de outros domínios, como `agendamentos`
- quais campos da UI atual não têm contrato correspondente na API
- quais mocks podem sair agora sem gerar retrabalho estrutural

Sem essa definição, o time corre o risco de:

- integrar o lado do aluno antes de consolidar a origem dos dados do instrutor
- manter mocks espalhados nas telas do instrutor
- forçar contratos de tela que o backend ainda não expõe
- misturar backlog de `instructors`, `bookings` e `profile`

## Objetivo

Definir uma SPEC enxuta para integrar primeiro as telas atuais do instrutor com a API, garantindo que as rotas `/instrutores` relevantes para o painel e perfil do instrutor tenham consumo real ao final da implementação e que o restante fique explícito como ajuste de UI ou dependência de outro domínio.

## Não objetivos

- integrar telas do aluno nesta etapa
- fechar o fluxo de agendamentos do instrutor com rotas de `/agendamentos`
- resolver upload de documentos, já que não há rota correspondente em `/instrutores`
- redesenhar a navegação do app
- refatorar o domínio `profile` inteiro nesta etapa

## Fonte de verdade desta SPEC

- `docs/openapi/openapi.json`
- `docs/ARCHITECTURE_TARGET.md`
- `docs/specs/architecture-migration/SPEC.md`
- `docs/specs/instructors-migration/SPEC.md`

## Rotas cobertas

### Perfil profissional do instrutor

- `GET /instrutores/me`
- `PUT /instrutores/me`

### Disponibilidade do instrutor

- `GET /instrutores/me/disponibilidades`
- `POST /instrutores/me/disponibilidades`
- `PUT /instrutores/me/disponibilidades/{disponibilidade_id}`
- `DELETE /instrutores/me/disponibilidades/{disponibilidade_id}`

### Financeiro do instrutor

- `GET /instrutores/me/ganhos/historico`
- `GET /instrutores/me/ganhos/tendencia`
- `GET /instrutores/me/pagamentos/recentes`

### Veículos do instrutor

- `GET /instrutores/me/veiculos`
- `POST /instrutores/me/veiculos`
- `PUT /instrutores/me/veiculos/{veiculo_id}`
- `DELETE /instrutores/me/veiculos/{veiculo_id}`

## Mapeamento de telas do domínio

### Telas que podem ficar totalmente integradas com `/instrutores`

#### `InstrutorScheduleScreen`

- consome `GET /instrutores/me/disponibilidades`
- consome `POST /instrutores/me/disponibilidades`
- consome `PUT /instrutores/me/disponibilidades/{disponibilidade_id}`
- consome `DELETE /instrutores/me/disponibilidades/{disponibilidade_id}`
- remove mock da disponibilidade semanal

#### `InstrutorEarningsScreen`

- consome `GET /instrutores/me/ganhos/historico`
- consome `GET /instrutores/me/ganhos/tendencia`
- consome `GET /instrutores/me/pagamentos/recentes`
- remove mock de pagamentos e mock do gráfico mensal

#### `InstrutorProfileScreen`

- consome `GET /instrutores/me`
- consome `GET /instrutores/me/veiculos`
- deixa de depender apenas do `AuthContext` para dados profissionais

### Telas que podem ficar integradas de forma majoritária, com sobra apenas de ajuste de UI

#### `EditInstructorProfileScreen`

- consome `PUT /instrutores/me`
- consome `GET /instrutores/me/veiculos`
- consome `POST /instrutores/me/veiculos`
- consome `PUT /instrutores/me/veiculos/{veiculo_id}`
- consome `DELETE /instrutores/me/veiculos/{veiculo_id}`

O que sobra aqui não é débito de integração, e sim de alinhamento da UI ao backend:

- `detranId` não existe em `InstrutorUpdate`
- `licencaNumero` e `licencaVencimento` não existem em `InstrutorUpdate`
- upload de `licencaDocument` e `veiculoDocument` não possui rota
- `veiculoMarca` existe na UI, mas não aparece no contrato de veículo da OpenAPI

Resultado esperado:

- a tela passa a editar apenas os campos realmente persistíveis
- os campos sem contrato ficam removidos, desabilitados ou explicitamente marcados como pendentes de backend

### Tela com integração apenas parcial nesta SPEC

#### `InstrutorDashboardScreen`

Pode consumir dados de `/instrutores` para:

- resumo de ganhos do mês
- tendência de ganhos
- disponibilidade configurada

Mas não fecha por completo só com `/instrutores`, porque ainda mostra áreas que dependem de `agendamentos`:

- `Agenda de Hoje`
- `Solicitações Recentes`

Decisão desta SPEC:

- integrar os cards que dependem de `/instrutores`
- remover mocks do dashboard
- trocar cards sem backend deste recorte por estados vazios reais, placeholders de UI ou CTA para telas já integradas

## Lacunas de contrato já identificadas

### Lacunas da OpenAPI

Mesmo com as novas rotas autenticadas `/instrutores/me`, as respostas relevantes ainda aparecem sem schema detalhado suficiente no `openapi.json`.

Decisão desta SPEC:

- durante a implementação, quando uma task depender de schema de resposta ainda não definido, a execução deve parar nesse ponto
- nesse momento, o contrato real da resposta deve ser buscado no backend e validado com você
- só depois disso o DTO, mapper e hook daquela task devem ser concluídos

Ou seja, esta SPEC não vai inventar respostas ausentes da OpenAPI para “tampar buraco” documental.

### Lacunas entre UI e backend

- a UI atual de perfil do instrutor pede mais campos do que `PUT /instrutores/me` suporta
- a UI atual trata veículo com `marca`, mas a OpenAPI expõe só `modelo`, `ano`, `placa`, `tipo_cambio` e `aceita_veiculo_aluno`
- dashboard e agenda misturam disponibilidade do instrutor com dados de aulas, que pertencem a `bookings`

## Decisão de rota

Para telas em que o instrutor autenticado está alterando ou consultando os próprios dados, a implementação deve preferir as rotas `/instrutores/me`.

As rotas com `{instrutor_id}` permanecem úteis para:

- catálogos públicos ou visão do aluno
- consultas administrativas
- compatibilidade futura fora do escopo desta SPEC

## Estratégia

### Fase 1. Consolidar o domínio `features/instructors`

- ampliar `types/api.ts` para cobrir perfil, disponibilidade, ganhos, pagamentos e veículos
- ampliar `types/domain.ts` com modelos de agenda semanal, veículo do instrutor e financeiro
- criar mappers dedicados para cada família de rota
- manter telas sem `apiClient` direto

### Fase 2. Fechar o lado operacional do instrutor

- integrar disponibilidade semanal em `InstrutorScheduleScreen`
- integrar listagem e edição de veículo a partir do domínio `instructors`
- integrar leitura e edição do perfil profissional nos campos suportados pela API

### Fase 3. Fechar o lado financeiro do instrutor

- integrar histórico de ganhos
- integrar pagamentos recentes
- integrar tendência para gráficos
- reutilizar os mesmos hooks no dashboard e na tela de ganhos

### Fase 4. Limpeza de mocks e alinhamento final de UI

- remover mocks como fonte principal das telas do domínio
- substituir trechos sem rota por empty states honestos
- deixar explícito no código o que depende de `bookings` ou de backend futuro

## Organização proposta

O domínio continua centralizado em `src/features/instructors`, mas passa a cobrir também as telas do instrutor.

Estrutura alvo:

```text
src/features/instructors/
  api/
    instructorDetailsApi.ts
    instructorScheduleApi.ts
    instructorVehiclesApi.ts
    instructorEarningsApi.ts
    instructorProfileApi.ts
  hooks/
    queries/
    mutations/
  screens/
    InstrutorScheduleScreen.tsx
    InstrutorEarningsScreen.tsx
    InstrutorProfileScreen.tsx
    EditInstructorProfileScreen.tsx
  mappers/
    mapInstructorDetails.ts
    mapInstructorSchedule.ts
    mapInstructorVehicle.ts
    mapInstructorEarnings.ts
  types/
    api.ts
    domain.ts
    filters.ts
```

`InstrutorDashboardScreen` pode continuar em `src/features/instructor-panel` nesta etapa, desde que consuma hooks de `features/instructors` e pare de ter mock local.

## Estratégia de estado

- `react-query` para toda leitura e mutation remota
- `AuthContext` apenas para descobrir sessão e `instrutor_id`
- sem novo contexto de domínio
- `zustand` só se surgir necessidade real de rascunho local do editor de disponibilidade

## Critérios de aceite

- todas as rotas `/instrutores` listadas nesta SPEC possuem `api`, `hook` e mapper próprios
- nenhuma tela do domínio de instrutores usa mock como fonte principal de dados
- `InstrutorScheduleScreen` salva e reflete disponibilidade real do backend
- `InstrutorEarningsScreen` renderiza dados reais para lista e gráficos
- `InstrutorProfileScreen` e `EditInstructorProfileScreen` usam dados reais do instrutor e de veículos
- `InstrutorDashboardScreen` não usa mock e deixa explícito o que ainda depende de `agendamentos`
- os únicos itens restantes fora desta SPEC são ajustes de UI e campos sem contrato backend

## Resultado esperado

Ao final desta SPEC, as telas do instrutor deixam de ser uma mistura de integração parcial com mock residual e passam a ter um contrato claro:

- tudo que esta etapa precisa de `/instrutores` está consumido nas telas de instrutor
- tudo que depende de outro domínio fica explicitamente separado
- o backlog remanescente deixa de ser “integração do instrutor” e passa a ser principalmente ajuste de interface, refinamento de UX e integração posterior dos fluxos do aluno
