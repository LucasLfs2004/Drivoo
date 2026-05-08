# Instructor Bookings Area Design

## Estrutura

Arquivos do dominio:

- `src/features/bookings/api/bookingsApi.ts`
- `src/features/bookings/hooks/mutationOptions.ts`
- `src/features/bookings/hooks/useUpdateBookingStatusMutation.ts`
- `src/features/bookings/mappers/mapScheduledBookings.ts`
- `src/features/bookings/screens/BookingDetailsScreen.tsx`

Arquivo de perspectiva do instrutor:

- `src/features/instructor-panel/screens/InstrutorBookingsScreen.tsx`

## Fluxo

1. Instrutor abre `BookingsScreen`.
2. A tela consulta `useMyBookingsQuery` com filtro opcional.
3. Cada aula abre `BookingDetails` com `viewerRole: instrutor`.
4. A tela de detalhes ajusta textos e acoes para o papel informado.
5. Mutations de status invalidam `bookings` apos sucesso.

## UI

A listagem tem filtros compactos por status e cards tocaveis com aluno, data, horario, local, veiculo e status. O detalhe mostra resumo, dados principais e acoes. O relato de problema do instrutor aparece como acao bloqueada ate existir uma rota propria, pois as rotas atuais de ocorrencia pertencem ao aluno.
