# Instructors Migration Design

## Objetivo técnico

Transformar `instructors` na feature piloto da nova arquitetura, com um módulo autônomo, coeso e reaproveitável para os dois lados do produto.

## Estrutura alvo

```text
src/features/instructors/
  api/
    instructorSearchApi.ts
    instructorDetailsApi.ts
    instructorAvailabilityApi.ts
  hooks/
    useInstructorSearchQuery.ts
    useInstructorDetailsQuery.ts
    useInstructorAvailableSlotsQuery.ts
  screens/
    AlunoInstructorSearchScreen.tsx
    AlunoInstructorDetailsScreen.tsx
    InstrutorProfileScreen.tsx
    InstrutorScheduleScreen.tsx
  components/
    InstructorCard.tsx
    InstructorSearchMap.tsx
    InstructorAvailabilitySlots.tsx
    InstructorProfileHeader.tsx
  types/
    api.ts
    domain.ts
    filters.ts
  mappers/
    mapInstructorSearchResult.ts
    mapInstructorDetails.ts
    mapInstructorAvailableSlots.ts
  store/
    useInstructorSearchStore.ts
  index.ts
```

## Observações de design

### `api/`

Responsável apenas por:

- chamadas HTTP
- passagem de parâmetros
- tipagem de DTO

Não deve conter transformação de domínio rica.

### `mappers/`

Responsável por:

- adaptar resposta da API para tipos usados pela feature
- normalizar enums, datas e campos opcionais

### `hooks/`

Responsável por:

- encapsular `react-query`
- expor queries e mutations com interface limpa para as screens

### `screens/`

Responsável por:

- composição de hooks
- navegação
- UI states

### `components/`

Responsável por:

- componentes específicos da feature
- não misturar com componentes totalmente genéricos

## Estratégia de migração do código atual

### Etapa 1

Criar o esqueleto do módulo em `src/features/instructors`.

### Etapa 2

Mover ou duplicar temporariamente os services atuais para dentro de `features/instructors/api` e `features/instructors/mappers`.

### Etapa 3

Criar hooks da feature e trocar as screens para consumir esses hooks.

### Etapa 4

Mover ou reexportar as screens atuais a partir de `features/instructors/screens`.

### Etapa 5

Eliminar dependências residuais de:

- `src/services/instructorSearchService.ts`
- `src/services/instructorService.ts`
- `src/services/queries/useInstructorSearchQuery.ts`
- `src/mock/instructors.ts` em telas integradas

## Decisões de estado

### React Query

Usar para:

- busca de instrutores
- detalhe do instrutor
- horários disponíveis
- disponibilidade semanal futura

### Zustand

Opcional nesta feature. Se introduzido, usar apenas para:

- persistência de filtros locais de busca
- estado transitório de UI que atravessa telas

Não usar para cache remoto.

## Design para aluno vs instrutor

O mesmo domínio atenderá duas perspectivas:

- aluno: busca, detalhe e consulta de horários
- instrutor: perfil profissional, agenda, veículo e disponibilidade

Ambos compartilham:

- entidade do instrutor
- mapeadores
- parte dos hooks
- componentes específicos do domínio

## Riscos

- migrar a estrutura sem remover import legado
- duplicar tipos entre feature e `src/types/search`
- manter screens antigas importando services antigos
- superdimensionar o módulo antes de `bookings`

## Mitigações

- migrar em camadas
- usar reexports temporários se necessário
- mover primeiro o caminho crítico `search -> details -> slots`
- só depois expandir para o portal do instrutor
