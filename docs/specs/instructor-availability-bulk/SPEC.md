# Instructor Availability Bulk Spec

## Contexto

O Drivoo já possui uma tela de agenda do instrutor, mas a implementação atual ainda está presa a um modelo legado:

- disponibilidade semanal baseada em slots fixos
- edição concentrada em um único editor genérico
- persistência via múltiplas operações `create/update/delete` por slot
- ausência de suporte real para exceções por data
- esforço extra de agrupamento no frontend para hidratar a UI

Ao mesmo tempo, o produto agora tem uma proposta mais madura para o módulo de disponibilidade do instrutor:

- regra base semanal
- exceções por data
- múltiplos intervalos livres por dia
- submissão em uma única requisição bulk
- payload de leitura já alinhado à estrutura visual da interface

Essa mudança altera contrato, estado de frontend, UX de edição e integração com o domínio `instructors`.

## Problema

O modelo atual dificulta a evolução do produto porque:

- força a UI a pensar em slots predefinidos, e não em intervalos livres
- cria complexidade desnecessária ao salvar mudanças pequenas
- não representa bem o caso de exceções por data
- acopla a tela do instrutor a `AgendaSemanal` e `WeeklyScheduleEditor`, que não foram desenhados para esse domínio
- mantém a leitura e a escrita num formato diferente do modelo mental do produto

Sem uma trilha específica para isso, o time corre o risco de:

- adaptar a tela atual com remendos
- manter dois modelos paralelos de disponibilidade
- espalhar lógica de conversão entre screen, component e hook
- atrasar o suporte a exceções mesmo com backend já preparado

## Objetivo

Definir a especificação do novo módulo de disponibilidade do instrutor com contrato bulk, organização de frontend e comportamento de UX alinhados ao modelo:

- semanal como regra base
- exceções como sobrescrita pontual
- edição local antes do submit
- uma única escrita por ação de salvar
- leitura já agregada para hidratação direta do estado

## Não objetivos

- implementar nesta trilha a agenda real de aulas do instrutor como fonte principal de dados do módulo
- construir drag and drop de horários
- fechar automações futuras como copiar dias úteis ou merge automático de intervalos
- migrar outros domínios fora do recorte de disponibilidade

## Fonte de verdade

- `docs/ARCHITECTURE_TARGET.md`
- `docs/specs/architecture-migration/SPEC.md`
- `docs/specs/instructors-migration/SPEC.md`
- `docs/specs/instructors-api-integration/SPEC.md`
- esta spec passa a substituir especificamente a parte de disponibilidade semanal baseada em operações por slot da trilha `instructors-api-integration`

## Modelo de produto

O módulo é composto por duas camadas:

### 1. Disponibilidade semanal

Define a regra padrão de trabalho do instrutor por dia da semana.

Exemplos:

- terça: `08:00-12:00`, `14:00-18:00`
- sexta: `09:00-17:00`

### 2. Exceções

Sobrescrevem a regra semanal em uma data específica.

Tipos:

- exceção disponível: adiciona uma disponibilidade específica naquela data
- exceção bloqueada: marca a data como indisponível

## Escopo

### Em escopo

- novo contrato de leitura de disponibilidade do instrutor autenticado
- novo contrato de escrita bulk do instrutor autenticado
- novos tipos de domínio para disponibilidade semanal e exceções
- novos mappers `API -> domínio` e `domínio -> payload bulk`
- proteção contra configuração de disponibilidade em horários já ocupados por bookings existentes, quando esse dado estiver disponível
- nova UI de disponibilidade com:
- tela principal listando os dias
- tela de edição de um dia com múltiplos intervalos
- base arquitetural para tela de exceções
- preview mensal da agenda resultante
- validações locais antes do submit
- estratégia de cache e invalidação com `react-query`
- remoção da dependência estrutural de `AgendaSemanal` e `WeeklyScheduleEditor` nesse fluxo

### Fora de escopo imediato

- tela final de exceções 100% concluída se o time optar por MVP incremental
- sugestões automáticas de horários
- remarcação automática de bookings impactados por mudança de disponibilidade

## API alvo

### Escrita

Endpoint alvo:

- `POST /instrutores/me/disponibilidades/lote`

Observação:

- o backend documentado pelo produto foi descrito como `POST /instructors/me/availability/bulk`
- nesta spec, o nome final da rota deve seguir o padrão real do backend em português para manter consistência com `/instrutores`
- antes da implementação, confirmar a rota oficial publicada na OpenAPI ou no backend

Payload alvo:

```json
{
  "modo": "SUBSTITUIR",
  "itens": [
    {
      "tipo_disponibilidade": "SEMANAL",
      "dias_semana": [2],
      "intervalos": [
        { "hora_inicio": "08:00", "hora_fim": "12:00" },
        { "hora_inicio": "14:00", "hora_fim": "18:00" }
      ]
    },
    {
      "tipo_disponibilidade": "EXCECAO_DISPONIVEL",
      "datas_especificas": ["2026-04-15"],
      "intervalos": [
        { "hora_inicio": "09:00", "hora_fim": "12:00" }
      ]
    },
    {
      "tipo_disponibilidade": "EXCECAO_BLOQUEIO",
      "datas_especificas": ["2026-04-21"]
    }
  ]
}
```

### Leitura

Endpoint alvo:

- `GET /instrutores/me/disponibilidades`

Response alvo:

```json
{
  "timezone": "America/Sao_Paulo",
  "semanal": [
    {
      "dia_semana": 1,
      "intervalos": []
    },
    {
      "dia_semana": 2,
      "intervalos": [
        { "hora_inicio": "08:00", "hora_fim": "12:00" },
        { "hora_inicio": "14:00", "hora_fim": "18:00" }
      ]
    }
  ],
  "excecoes": [
    {
      "tipo_disponibilidade": "EXCECAO_DISPONIVEL",
      "data_especifica": "2026-04-15",
      "intervalos": [
        { "hora_inicio": "09:00", "hora_fim": "12:00" }
      ]
    },
    {
      "tipo_disponibilidade": "EXCECAO_BLOQUEIO",
      "data_especifica": "2026-04-21"
    }
  ]
}
```

## Regras de negócio obrigatórias no frontend

- `hora_inicio` deve ser menor que `hora_fim`
- intervalos do mesmo dia não podem se sobrepor
- `intervalos: []` em item semanal representa remoção da disponibilidade daquele dia
- uma mesma data não pode ter simultaneamente bloqueio e disponibilidade
- não permitir criação ou edição de exceções em datas passadas
- mudanças que afetem horários com bookings existentes devem avisar o instrutor, mas não cancelar nem invalidar essas aulas automaticamente
- a nova disponibilidade deve afetar apenas novos agendamentos
- o frontend deve bloquear submit enquanto houver erro de validação
- o frontend não deve enviar request se não houver mudanças

## Estado alvo no frontend

```ts
type TimeInterval = {
  start: string;
  end: string;
};

type WeeklyAvailability = Record<number, TimeInterval[]>;

type DateException =
  | {
      type: 'available';
      date: string;
      intervals: TimeInterval[];
    }
  | {
      type: 'blocked';
      date: string;
    };
```

## Fluxo de edição

### Semanal

1. usuário entra na tela principal
2. visualiza cada dia da semana e seu resumo
3. toca em um dia para editar
4. altera intervalos localmente
5. salva o dia localmente
6. volta para a tela principal sem request imediato
7. pode repetir esse processo em quantos dias quiser, inclusive alternando entre semanal e exceções
8. visualiza o preview mensal da agenda resultante
9. toca em `Salvar alterações` para enviar tudo em lote

### Exceções

1. usuário acessa a área de exceções
2. escolhe uma data futura
3. define o tipo da exceção
4. se for disponibilidade, define um ou mais intervalos
5. salva localmente
6. volta para a tela principal
7. envia junto no próximo submit bulk

## Conflito com bookings existentes

Esse ponto precisa ser tratado explicitamente para evitar inconsistência entre disponibilidade configurada e aulas já marcadas.

Recomendação de produto para esta trilha:

- bookings confirmados ou pendentes dentro da janela afetada devem continuar válidos
- o preview mensal deve destacar esses horários como ocupados
- o instrutor pode ampliar disponibilidade livremente
- o instrutor pode reduzir a disponibilidade futura mesmo que existam aulas já marcadas naquele intervalo
- novos agendamentos não devem mais ser oferecidos nesse intervalo reduzido

Estratégia sugerida por fase:

### Fase MVP recomendada

- consumir bookings existentes como camada de aviso e contexto visual
- permitir submit mesmo quando houver aulas já marcadas em intervalos removidos
- exibir mensagem clara informando que essas aulas serão preservadas, mas o horário ficará fechado para novas reservas

### Fase posterior

- oferecer fluxo orientado para remarcação ou cancelamento das aulas impactadas
- integrar a decisão com o domínio `bookings`

Enquanto esse fluxo posterior não existir, a regra operacional deve ser:

- booking existente nunca é invalidado por mudança de disponibilidade
- disponibilidade nova vale para descoberta e novos agendamentos

## Preview mensal

O preview mensal passa a fazer parte do módulo para ajudar o instrutor a entender o efeito real da configuração.

Objetivos do preview:

- mostrar a combinação entre regra semanal e exceções
- destacar dias bloqueados
- destacar disponibilidades extras
- destacar bookings existentes quando esse dado estiver disponível
- destacar bookings preservados que ficaram fora da nova disponibilidade
- dar confiança antes do submit final

Escopo recomendado do preview nesta trilha:

- visão mensal simples
- foco em leitura, não edição direta no calendário
- seleção de dia para abrir detalhe dos intervalos
- distinção visual entre:
- disponibilidade padrão
- exceção disponível
- exceção bloqueada
- horário ocupado por booking
- aula preservada fora da nova janela padrão

## Estratégia de migração

### Decisão principal

O novo modelo substitui a trilha antiga de disponibilidade baseada em:

- `AgendaSemanal`
- `SlotTempo`
- `WeeklyScheduleEditor`
- mutations unitárias de `create/update/delete` por slot como contrato principal de edição

Esses elementos podem continuar existindo apenas enquanto houver código legado que ainda não migrou, mas deixam de ser a referência do domínio.

### Impacto esperado

- `InstrutorScheduleScreen` deixa de ser apenas uma tela de agenda e passa a ser a entrada do módulo de disponibilidade
- a lógica de edição por dia deve sair do componente genérico compartilhado e ir para componentes específicos do domínio `instructors`
- a leitura do backend deixa de exigir agrupamento procedural no screen
- a escrita passa a acontecer por um único mapper para payload bulk

## Resultado esperado

Ao final da implementação guiada por esta spec:

- o instrutor consegue editar disponibilidade semanal com intervalos livres
- o instrutor consegue editar vários dias e exceções antes de persistir qualquer mudança
- o app suporta exceções por data no mesmo modelo de estado
- o app oferece preview mensal da agenda resultante
- o submit acontece em uma única operação bulk
- aulas já marcadas continuam válidas mesmo quando a disponibilidade futura for reduzida
- o domínio `instructors` passa a ter contrato explícito e sustentável para disponibilidade
- a UI fica alinhada ao modelo mental do produto e à nova arquitetura do app

## Critérios de aceite

- existe uma spec própria para disponibilidade bulk do instrutor
- o domínio `features/instructors` passa a ter tipos e mappers dedicados para weekly + exceptions
- a tela principal não depende mais de `WeeklyScheduleEditor`
- a leitura do backend hidrata diretamente o estado semanal e as exceções
- a escrita do backend é feita por payload bulk via mapper dedicado
- a spec deixa explícito que o usuário pode editar vários dias antes do submit final
- o frontend valida sobreposição, horários inválidos, datas passadas e ausência de mudanças antes do submit
- fica explícito no código e na documentação o que é MVP e o que é evolução futura
