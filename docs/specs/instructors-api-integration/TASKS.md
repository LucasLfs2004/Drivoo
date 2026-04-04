# Instructor Screens API Integration Tasks

## Fase 0: Preparação

- confirmar que a SPEC e o DESIGN desta trilha serão a referência única para integração das telas do instrutor
- manter o escopo restrito a `InstrutorProfileScreen`, `EditInstructorProfileScreen`, `InstrutorScheduleScreen`, `InstrutorEarningsScreen` e `InstrutorDashboardScreen`
- não iniciar integração de telas do aluno nesta trilha

## Fase 1: Base do domínio

- ampliar `src/features/instructors/types/api.ts` com DTOs de perfil, disponibilidade, veículos e financeiro
- ampliar `src/features/instructors/types/domain.ts` com modelos de domínio do lado do instrutor
- ampliar `src/features/instructors/hooks/queryKeys.ts` para `me`, `schedule`, `vehicles`, `earningsHistory`, `earningsTrend` e `recentPayments`
- criar `src/features/instructors/api/instructorProfileApi.ts`
- criar `src/features/instructors/api/instructorScheduleApi.ts`
- criar `src/features/instructors/api/instructorVehiclesApi.ts`
- criar `src/features/instructors/api/instructorEarningsApi.ts`
- criar `src/features/instructors/mappers/mapInstructorSchedule.ts`
- criar `src/features/instructors/mappers/mapInstructorVehicle.ts`
- criar `src/features/instructors/mappers/mapInstructorEarnings.ts`

## Fase 2: Checkpoints obrigatórios de contrato

- antes de implementar cada rota com response schema vazio na OpenAPI, validar o payload real do backend
- pausar a task correspondente sempre que o response real não estiver confirmado
- só concluir DTO, mapper e hook depois da validação do payload real

Checkpoints esperados:

- `GET /instrutores/me`
- `GET /instrutores/me/disponibilidades`
- `GET /instrutores/me/ganhos/historico`
- `GET /instrutores/me/ganhos/tendencia`
- `GET /instrutores/me/pagamentos/recentes`
- `GET /instrutores/me/veiculos`

## Fase 3: Perfil do instrutor

- revisar `src/features/profile/screens/InstrutorProfileScreen.tsx` e separar o que continua vindo de `AuthContext` do que deve vir de `features/instructors`
- adaptar `src/features/instructors/api/instructorDetailsApi.ts` se necessário para o contrato validado do backend
- adaptar `src/features/instructors/mappers/mapInstructorDetails.ts` para o contrato validado do backend
- criar `src/features/instructors/hooks/useInstructorDetailsQuery.ts` orientado ao uso de telas do instrutor
- criar `src/features/instructors/hooks/useInstructorVehiclesQuery.ts`
- integrar `InstrutorProfileScreen` com `useInstructorDetailsQuery`
- integrar `InstrutorProfileScreen` com `useInstructorVehiclesQuery`
- remover dependência de dados mock ou dependência indevida de `usuario.perfil` para preço, avaliação, veículo e dados profissionais
- manter `AuthContext` apenas para nome base, e-mail e logout

## Fase 4: Edição de perfil e veículos

- revisar `src/features/profile/screens/EditInstructorProfileScreen.tsx` e mapear quais campos realmente têm suporte backend
- remover, desabilitar ou marcar como pendentes os campos sem contrato backend:
- `detranId`
- `licencaNumero`
- `licencaVencimento`
- upload de documentos
- `veiculoMarca`
- criar mutation `useInstructorProfileUpdateMutation`
- criar mutation `useCreateInstructorVehicleMutation`
- criar mutation `useUpdateInstructorVehicleMutation`
- criar mutation `useDeleteInstructorVehicleMutation`
- integrar `EditInstructorProfileScreen` com leitura de detalhe e veículos reais
- integrar `EditInstructorProfileScreen` com `PUT /instrutores/me`
- integrar `EditInstructorProfileScreen` com create, update e delete de veículos
- invalidar `me` e `vehicles` após mutations bem-sucedidas
- garantir feedback visual de loading, sucesso e erro nas ações de salvar e editar veículo

## Fase 5: Disponibilidade semanal

- validar o payload real de `GET /instrutores/me/disponibilidades`
- implementar DTO de disponibilidade com base no payload real
- implementar `mapInstructorSchedule.ts`
- criar `useInstructorScheduleQuery`
- criar `useCreateInstructorAvailabilityMutation`
- criar `useUpdateInstructorAvailabilityMutation`
- criar `useDeleteInstructorAvailabilityMutation`
- adaptar `InstrutorScheduleScreen` para carregar disponibilidade real
- adaptar `InstrutorScheduleScreen` para transformar o estado do `WeeklyScheduleEditor` em operações create, update e delete
- remover `schedule` local como fonte principal de verdade
- remover `MOCK_BOOKINGS` como fonte principal da tela
- trocar trechos que dependem de `bookings` por estado vazio honesto nesta etapa
- invalidar `schedule` após qualquer mutation de disponibilidade

## Fase 6: Financeiro do instrutor

- validar o payload real de `GET /instrutores/me/ganhos/historico`
- validar o payload real de `GET /instrutores/me/ganhos/tendencia`
- validar o payload real de `GET /instrutores/me/pagamentos/recentes`
- implementar DTOs financeiros com base nos payloads reais
- implementar `mapInstructorEarnings.ts`
- criar `useInstructorEarningsHistoryQuery`
- criar `useInstructorEarningsTrendQuery`
- criar `useInstructorRecentPaymentsQuery`
- integrar `InstrutorEarningsScreen` com histórico real
- integrar `InstrutorEarningsScreen` com tendência real
- integrar `InstrutorEarningsScreen` com pagamentos recentes reais
- remover `MOCK_PAYMENTS`
- remover geração local aleatória de dados mensais
- derivar no app apenas os agregados que não vierem prontos do backend, como total do mês ou total acumulado
- ajustar gráficos e cards se a granularidade do backend for menor que a da UI atual

## Fase 7: Dashboard do instrutor

- revisar `src/features/instructor-panel/screens/InstrutorDashboardScreen.tsx`
- integrar os cards de ganhos com hooks já criados no domínio `instructors`
- integrar o card de disponibilidade com `useInstructorScheduleQuery`
- não criar APIs, mappers ou hooks exclusivos do dashboard
- substituir cards sem backend deste recorte por empty states, placeholders honestos ou CTA para telas já integradas
- remover qualquer mock local do dashboard

## Fase 8: Limpeza e consolidação

- revisar `src/features/instructors/index.ts` e exportar os novos hooks e services relevantes
- revisar imports cruzados entre `profile`, `instructor-panel` e `instructors`
- garantir que nenhuma tela integrada chame `apiClient` diretamente
- garantir que nenhuma tela integrada faça mapping inline de payload cru
- garantir que nenhuma tela integrada use mock como fonte principal de dados
- registrar no código os trechos que seguem pendentes de backend de outro domínio

## Critérios de pronto por task

- existe chamada em `api/` correspondente à rota
- existe DTO validado com o backend quando a OpenAPI não trouxer schema suficiente
- existe mapper convertendo API para domínio
- existe hook de query ou mutation encapsulando `react-query`
- a tela consome o hook e trata loading, empty e error
- mocks anteriores deixam de ser fonte principal de dados

## Ordem recomendada de execução

1. base do domínio e query keys
2. perfil do instrutor
3. edição de perfil e veículos
4. disponibilidade semanal
5. financeiro do instrutor
6. dashboard do instrutor
7. limpeza final
