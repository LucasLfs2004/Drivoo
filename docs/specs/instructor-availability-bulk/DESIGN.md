# Instructor Availability Bulk Design

## Objetivo técnico

Redesenhar o módulo de disponibilidade do instrutor para um fluxo orientado a domínio, com:

- contratos bulk de leitura e escrita
- modelos próprios de disponibilidade semanal e exceções
- componentes específicos da feature `instructors`
- edição local desacoplada do backend até o submit final
- preview mensal para inspeção da agenda resultante
- proteção contra conflitos com bookings existentes

## Princípios

### 1. Disponibilidade é domínio de `instructors`

Toda integração remota, tipagem, mapper e hook desta trilha deve viver em:

- `src/features/instructors/api`
- `src/features/instructors/hooks`
- `src/features/instructors/mappers`
- `src/features/instructors/types`
- `src/features/instructors/components`

Mesmo que a tela continue renderizada em `instructor-panel`, a lógica não deve nascer lá.

### 2. O modelo legado deixa de ser referência

Não adaptar `AgendaSemanal` e `WeeklyScheduleEditor` para suportar exceções e bulk.

Em vez disso:

- criar um modelo de domínio novo
- criar componentes específicos da feature
- manter compatibilidade legada apenas enquanto houver dependências transitórias

### 3. Um único submit por intenção de salvar

A UI pode salvar localmente a edição de um dia ou de uma exceção, mas só deve persistir quando o usuário confirmar `Salvar alterações`.

### 4. Leitura e escrita devem refletir o mesmo modelo mental

O state local deve ser isomórfico ao formato exibido na tela:

- semanal
- exceções

Evitar estado intermediário em forma de slots fixos ou lista plana de registros crus.

## Estrutura proposta

```text
src/features/instructors/
  api/
    instructorAvailabilityApi.ts
  hooks/
    queryKeys.ts
    useInstructorAvailabilityQuery.ts
    useSaveInstructorAvailabilityMutation.ts
  mappers/
    mapInstructorAvailabilityFromApi.ts
    mapInstructorAvailabilityToBulkPayload.ts
  types/
    api.ts
    domain.ts
  components/
    AvailabilityDayList.tsx
    AvailabilityDayCard.tsx
    AvailabilityDayEditor.tsx
    AvailabilityIntervalRow.tsx
    AvailabilityExceptionsList.tsx
    AvailabilityExceptionCard.tsx
    AvailabilityMonthPreview.tsx
    AvailabilityMonthDayCell.tsx
  screens/
    EditInstructorAvailabilityDayScreen.tsx
    InstructorAvailabilityExceptionsScreen.tsx
```

## Contratos de tipo

### Domínio

Adicionar em `src/features/instructors/types/domain.ts` um núcleo novo, sem depender de `AgendaSemanal`:

```ts
export type AvailabilityInterval = {
  start: string;
  end: string;
};

export type WeeklyAvailability = Record<number, AvailabilityInterval[]>;

export type AvailabilityException =
  | {
      type: 'available';
      date: string;
      intervals: AvailabilityInterval[];
    }
  | {
      type: 'blocked';
      date: string;
    };

export type InstructorAvailabilityState = {
  timezone: string;
  weekly: WeeklyAvailability;
  exceptions: AvailabilityException[];
};
```

### API

Adicionar ou revisar em `src/features/instructors/types/api.ts`:

- DTO de leitura agregada
- DTO de escrita bulk
- enum de tipos de disponibilidade
- DTO de intervalo

Sugestão:

```ts
export type InstructorAvailabilityKindApi =
  | 'SEMANAL'
  | 'EXCECAO_DISPONIVEL'
  | 'EXCECAO_BLOQUEIO';
```

## API layer

### `instructorAvailabilityApi.ts`

Responsável por:

- `getMyAvailability()`
- `saveMyAvailabilityBulk(payload)`

Regras:

- não expor operações unitárias como caminho principal da nova UI
- se o backend ainda exigir rota antiga durante transição, o adapter dessa diferença deve ficar em `api/` ou `mappers/`, nunca na screen

## Mappers

### `mapInstructorAvailabilityFromApi.ts`

Transforma resposta agregada em:

- `timezone`
- `weekly`
- `exceptions`

Decisões:

- normalizar horários para `HH:mm`
- garantir que todos os 7 dias existam em `weekly`, mesmo quando vazios
- ordenar intervalos por horário de início
- ordenar exceções por data ascendente

### `mapInstructorAvailabilityToBulkPayload.ts`

Transforma o estado editável local no payload final:

- um item `SEMANAL` por dia
- um item `EXCECAO_DISPONIVEL` por data disponível
- um item `EXCECAO_BLOQUEIO` por data bloqueada
- `modo: 'SUBSTITUIR'`

Decisões:

- dias sem intervalos continuam indo no payload semanal para representar remoção explícita se essa for a convenção acordada com o backend
- a regra final sobre enviar ou omitir dias vazios deve ser confirmada com o backend antes da implementação

## Hooks

### `useInstructorAvailabilityQuery`

Encapsula:

- leitura do endpoint agregado
- mapper `fromApi`
- exposição do estado inicial para edição

### `useSaveInstructorAvailabilityMutation`

Encapsula:

- validação final de submit
- chamada bulk
- invalidação do cache de disponibilidade

Query key sugerida:

```ts
availability: () => [...instructorQueryKeys.all, 'availability', 'me'] as const
```

## Estratégia de estado na UI

### Estado remoto

Fica em `react-query`.

### Estado de edição

Fica local ao fluxo da tela, com cópia editável do snapshot remoto.

Estrutura sugerida na tela principal:

```ts
type AvailabilityDraft = InstructorAvailabilityState;
```

Campos auxiliares locais:

- `initialDraft`
- `draft`
- `hasChanges`
- `validationErrors`
- `bookingConflicts`
- `preservedBookings`
- `isSaving`

Não usar `zustand` nesta trilha, porque o estado é local ao fluxo e derivado de uma única query.

## Fluxo de navegação

### Tela principal

Arquivo atual impactado:

- `src/features/instructor-panel/screens/InstrutorScheduleScreen.tsx`

Papel novo:

- carregar disponibilidade agregada
- exibir resumo semanal
- abrir edição por dia
- abrir exceções
- exibir preview mensal
- controlar `Salvar alterações`

### Tela de edição do dia

Novo screen recomendado:

- `src/features/instructors/screens/EditInstructorAvailabilityDayScreen.tsx`

Responsabilidades:

- ativar ou desativar o dia
- listar intervalos do dia
- adicionar novo intervalo
- editar intervalos existentes
- remover intervalo
- validar conflitos daquele dia
- salvar alterações localmente e voltar

### Tela de exceções

Novo screen recomendado:

- `src/features/instructors/screens/InstructorAvailabilityExceptionsScreen.tsx`

Responsabilidades:

- listar exceções
- criar exceção disponível
- criar exceção bloqueada
- editar exceção
- remover exceção

Se o MVP optar por adiar a implementação completa das exceções, a navegação deve existir com:

- placeholder honesto
- estrutura de tipos pronta
- contract ready para a fase seguinte

## Componentização

### `AvailabilityDayCard`

Exibe:

- nome do dia
- resumo dos intervalos
- estado vazio quando indisponível
- CTA para editar

### `AvailabilityDayEditor`

Componente de composição da tela de edição:

- switch de disponibilidade
- lista de intervalos
- ação de adicionar horário

### `AvailabilityIntervalRow`

Responsável por um intervalo:

- hora início
- hora fim
- ação de remover
- sinalização de erro quando sobreposto ou inválido

### `AvailabilityMonthPreview`

Responsável por:

- renderizar o mês corrente
- permitir navegar entre meses
- mostrar o estado derivado de cada data
- abrir detalhe de um dia quando necessário

Estados visuais sugeridos:

- disponível por regra semanal
- disponível por exceção
- bloqueado por exceção
- ocupado por booking
- booking preservado fora da disponibilidade nova
- sem disponibilidade

## Validações

Criar utilitários da feature para:

- validar formato de horário
- validar `start < end`
- ordenar intervalos
- detectar sobreposição
- verificar mudança entre `initialDraft` e `draft`
- impedir exceção em data passada
- impedir combinação de bloqueio e disponibilidade na mesma data
- detectar bookings preservados fora da disponibilidade nova

Esses utilitários podem viver em:

- `src/features/instructors/utils/availabilityValidation.ts`

Se a pasta `utils` ainda não existir na feature, ela pode ser criada como parte desta trilha.

## Conflito com bookings

Essa trilha precisa conversar com o domínio `bookings`, mesmo sem transformar bookings na fonte principal da tela.

Estratégia recomendada:

- obter bookings confirmados e pendentes em um intervalo mensal visível
- derivar uma coleção de intervalos ocupados por compromisso existente
- comparar o draft editado com essa coleção antes do submit
- sinalizar no dia afetado e no preview mensal quando houver booking preservado fora da disponibilidade nova

Decisão de UX recomendada:

- permitir salvar alterações mesmo com booking preservado
- não tentar remanejar bookings automaticamente
- mostrar quais datas e intervalos têm aulas preservadas, deixando claro que o bloqueio vale só para novas reservas

Se o backend de `bookings` ainda não estiver pronto para esse acoplamento, a implementação deve:

- deixar a integração preparada por interface
- usar placeholder honesto para o preview de ocupação
- não fingir segurança onde ela ainda não existe

## Migração da tela atual

### O que sai como referência

- `WeeklyScheduleEditor`
- `AgendaSemanal`
- `SlotTempo`
- cálculo de diff por slot dentro de `InstrutorScheduleScreen`
- uso principal de `useCreateInstructorAvailabilityMutation`
- uso principal de `useUpdateInstructorAvailabilityMutation`
- uso principal de `useDeleteInstructorAvailabilityMutation`

### O que pode permanecer temporariamente

- rota antiga enquanto o backend bulk não estiver publicado
- tipos legados usados por outras telas que ainda não migraram

## Compatibilidade com a documentação anterior

`docs/specs/instructors-api-integration` continua válida para:

- localização do domínio
- uso de `react-query`
- separação `api/hooks/mappers/types`

Mas deixa de ser a referência da disponibilidade em dois pontos:

- contrato de leitura
- estratégia de escrita

## Nota de UX sobre o protótipo

O protótipo enviado tem uma boa direção para o MVP:

- lista semanal simples
- edição isolada por dia
- resumo textual dos intervalos

Melhorias recomendadas já nesta trilha:

- mover o CTA global `Salvar alterações` para a tela principal, não só `Salvar dia`
- explicitar visualmente quando existem mudanças não salvas
- permitir múltiplos intervalos com remoção clara
- reservar entrada para exceções desde a primeira versão da tela principal
- destacar erro de sobreposição inline no editor do dia
- adicionar preview mensal logo abaixo do resumo semanal
- quando houver aula preservada fora da nova janela, mostrar aviso persistente e fácil de entender
