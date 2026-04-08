# Instructor Availability Bulk Tasks

## Fase 0: Alinhamento de contrato

- confirmar a rota oficial de escrita bulk do backend
- confirmar se a rota final será `POST /instrutores/me/disponibilidades/lote` ou outro path equivalente
- confirmar se `GET /instrutores/me/disponibilidades` já retorna o formato agregado `semanal + excecoes`
- confirmar a convenção exata para remoção de um dia:
- enviar `intervalos: []`
- ou omitir o dia do payload
- confirmar o índice de `dia_semana` usado pelo backend para evitar desalinhamento entre frontend e API
- confirmar com o domínio `bookings` como obter aulas confirmadas ou pendentes para bloqueio de conflito
- confirmar com o backend que bookings existentes permanecem válidos após redução de disponibilidade

## Fase 1: Base de tipos e contratos

- ampliar `src/features/instructors/types/api.ts` com DTOs do novo modelo agregado
- ampliar `src/features/instructors/types/domain.ts` com `AvailabilityInterval`, `WeeklyAvailability`, `AvailabilityException` e `InstructorAvailabilityState`
- remover dependência conceitual de `AgendaSemanal` como contrato principal do domínio
- ampliar `src/features/instructors/hooks/queryKeys.ts` com `availability`

## Fase 2: API e mappers

- criar `src/features/instructors/api/instructorAvailabilityApi.ts`
- implementar `getMyAvailability`
- implementar `saveMyAvailabilityBulk`
- criar `src/features/instructors/mappers/mapInstructorAvailabilityFromApi.ts`
- criar `src/features/instructors/mappers/mapInstructorAvailabilityToBulkPayload.ts`
- garantir normalização de horários para `HH:mm`
- garantir preenchimento dos 7 dias no estado semanal

## Fase 3: Validação e regras locais

- criar utilitário de ordenação de intervalos da feature
- criar utilitário de detecção de sobreposição
- criar utilitário de validação `start < end`
- criar utilitário para detectar mudanças entre snapshot inicial e draft atual
- criar utilitário para bloquear exceções em datas passadas
- criar utilitário para impedir conflito entre exceção bloqueada e disponível na mesma data
- criar utilitário para identificar bookings preservados fora da disponibilidade nova

## Fase 4: Hooks do domínio

- criar `useInstructorAvailabilityQuery`
- criar `useSaveInstructorAvailabilityMutation`
- invalidar a query `availability` após escrita bem-sucedida
- encapsular erros de contrato e validação no hook ou utilitário compartilhado da feature

## Fase 5: UI da tela principal

- revisar `src/features/instructor-panel/screens/InstrutorScheduleScreen.tsx`
- transformá-la em tela principal do módulo de disponibilidade
- trocar a dependência de `useInstructorScheduleQuery` por `useInstructorAvailabilityQuery`
- remover o uso principal de `WeeklyScheduleEditor`
- renderizar lista dos dias com resumo de intervalos
- adicionar CTA para acessar exceções
- adicionar preview mensal da agenda resultante
- adicionar CTA global `Salvar alterações`
- exibir estado de mudanças pendentes
- exibir aviso de aulas preservadas quando existirem
- bloquear salvar quando não houver mudanças

## Fase 6: UI de edição por dia

- criar `src/features/instructors/screens/EditInstructorAvailabilityDayScreen.tsx`
- criar `AvailabilityDayEditor`
- criar `AvailabilityIntervalRow`
- permitir ativar ou desativar o dia
- permitir adicionar múltiplos intervalos
- permitir editar horários de início e fim
- permitir remover intervalos
- destacar erros de validação inline
- salvar alterações localmente no draft

## Fase 7: UI de exceções

- criar `src/features/instructors/screens/InstructorAvailabilityExceptionsScreen.tsx`
- criar componentes de lista e card de exceção
- permitir adicionar exceção disponível
- permitir adicionar exceção bloqueada
- permitir editar e remover exceções
- impedir datas passadas
- garantir que exceções façam parte do mesmo draft da tela principal

## Fase 8: Preview mensal e bloqueios por booking

- criar `AvailabilityMonthPreview`
- derivar estado mensal a partir de weekly + exceptions
- destacar visualmente exceções disponíveis e bloqueadas
- integrar bookings existentes quando a fonte estiver disponível
- destacar dias e intervalos ocupados
- destacar booking preservado fora da nova janela
- exibir mensagem orientando o instrutor quando a alteração afetar apenas novas reservas

## Fase 9: Remoção controlada do legado

- revisar `src/shared/ui/forms/WeeklyScheduleEditor.tsx`
- remover seu uso da trilha de disponibilidade do instrutor
- revisar `src/features/instructors/mappers/mapInstructorSchedule.ts`
- decidir se será mantido apenas para compatibilidade temporária ou removido
- revisar `src/features/instructors/hooks/useInstructorScheduleQuery.ts`
- revisar `src/features/instructors/hooks/useInstructorScheduleMutations.ts`
- marcar como legado ou substituir conforme a publicação do backend bulk
- revisar exports em `src/features/instructors/index.ts`

## Fase 10: Estados de UX e qualidade

- tratar loading inicial da disponibilidade
- tratar erro de leitura com retry
- tratar sucesso e erro no submit bulk
- impedir navegação silenciosa com mudanças não salvas se isso já fizer sentido no fluxo
- garantir acessibilidade mínima dos controles de horário
- validar comportamento mobile para listas longas de intervalos e exceções

## Critérios de pronto

- existe uma query única para carregar `weekly + exceptions`
- existe uma mutation única para salvar em bulk
- a tela principal não usa mais slots fixos como modelo de edição
- o domínio possui mappers dedicados de leitura e escrita
- a edição por dia suporta múltiplos intervalos livres
- o módulo já comporta exceções por data no mesmo draft
- o módulo oferece preview mensal
- o módulo sinaliza bookings preservados após redução de disponibilidade
- o frontend bloqueia submit inválido e submit sem mudanças

## Ordem recomendada

1. alinhar contrato final com backend
2. criar tipos, DTOs e query key
3. criar API e mappers
4. criar validações
5. integrar query e mutation
6. refatorar tela principal
7. implementar edição por dia
8. implementar exceções
9. implementar preview mensal e conflito com bookings
10. limpar legado
