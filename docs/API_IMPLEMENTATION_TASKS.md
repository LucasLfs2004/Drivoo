# Drivoo API Implementation Tasks

## Fase 1: Busca de Instrutores

- criar `src/services/instructorSearchService.ts`
- testar manualmente o payload real de `GET /instrutores/buscar`
- mapear resposta para `InstrutorDisponivel`
- criar `src/services/queries/useInstructorSearchQuery.ts`
- substituir `searchInstructors` mock em [AlunoSearchScreen.tsx](/Users/lucas/Documents/IA/Drivoo/src/screens/client/AlunoSearchScreen.tsx)
- conectar filtros do modal aos parâmetros da API
- suportar refresh e paginação
- validar lista e mapa com dados reais

## Fase 2: Detalhe do Instrutor

- criar `src/services/instructorService.ts`
- integrar `GET /instrutores/{instrutor_id}`
- integrar `GET /instrutores/{instrutor_id}/horarios-disponiveis`
- mapear horários para o formato consumido pela tela
- remover dependência de `mockInstructors` em [InstructorDetailsScreen.tsx](/Users/lucas/Documents/IA/Drivoo/src/screens/client/InstructorDetailsScreen.tsx)
- tratar erro, vazio e mudança de data

## Fase 3: Agendamentos do Aluno

- criar `src/services/bookingService.ts`
- implementar `validateBooking`
- implementar `createBooking`
- implementar `getMyBookings`
- criar `useMyBookingsQuery`
- criar `useCreateBookingMutation`
- ligar [BookingConfirmationScreen.tsx](/Users/lucas/Documents/IA/Drivoo/src/screens/client/BookingConfirmationScreen.tsx) ao agendamento real
- ligar [AlunoBookingsScreen.tsx](/Users/lucas/Documents/IA/Drivoo/src/screens/client/AlunoBookingsScreen.tsx) à lista real
- implementar atualização de status quando aplicável

## Fase 4: Home do Aluno

- criar query derivada para resumo de agendamentos
- substituir card de próxima aula em [AlunoHomeScreen.tsx](/Users/lucas/Documents/IA/Drivoo/src/screens/client/AlunoHomeScreen.tsx)
- substituir indicadores principais por métricas reais
- manter dica e conquistas em modo local
- revisar CTA para navegar com contexto correto

## Fase 5: Perfil e Configurações

- finalizar integração de `PUT /usuarios/{usuario_id}`
- criar `src/services/userSettingsService.ts`
- criar `useUserSettingsQuery`
- criar `useUpdateUserSettingsMutation`
- integrar [SettingsScreen.tsx](/Users/lucas/Documents/IA/Drivoo/src/screens/client/SettingsScreen.tsx)
- validar persistência de configuração do usuário

## Fase 6: Área do Instrutor

- integrar disponibilidades semanais
- integrar gestão de veículo
- integrar ganhos históricos
- integrar tendência de ganhos
- integrar pagamentos recentes
- revisar [InstrutorDashboardScreen.tsx](/Users/lucas/Documents/IA/Drivoo/src/screens/instructor/InstrutorDashboardScreen.tsx)
- revisar [InstrutorScheduleScreen.tsx](/Users/lucas/Documents/IA/Drivoo/src/screens/instructor/InstrutorScheduleScreen.tsx)
- revisar [InstrutorEarningsScreen.tsx](/Users/lucas/Documents/IA/Drivoo/src/screens/instructor/InstrutorEarningsScreen.tsx)

## Tasks Técnicas Transversais

- consolidar tipos de resposta reais da API por módulo
- remover uso residual de contratos antigos (`user`, `userType`, etc.)
- padronizar query keys do `react-query`
- adicionar testes de mapeamento para respostas da API
- adicionar testes de integração para services críticos
- documentar payloads reais que diferirem do OpenAPI

## Ordem Recomendada

1. busca
2. detalhe do instrutor
3. agendamento
4. home do aluno
5. perfil e configurações
6. área do instrutor
