# Booking Payments Stripe Design

## Domínio

O fluxo pertence inicialmente a `bookings`, porque nasce da criação de agendamento do aluno. O domínio `payments` fica preparado para evoluções futuras, mas esta etapa não cria acoplamento estrutural entre os domínios.

## Módulos Afetados

- `src/features/bookings/api`: chamadas HTTP para checkout e status.
- `src/features/bookings/mappers`: normalização de DTOs da API para modelos do app.
- `src/features/bookings/hooks`: mutations e queries React Query.
- `src/features/bookings/store`: persistência local do último checkout pendente.
- `src/features/bookings/screens`: tela de pagamento usando Checkout hospedado.
- `src/navigation` e `src/types/navigation`: deep link e parâmetros de rota.

## Estado

- React Query para criação de checkout e consulta de status.
- AsyncStorage apenas para o `agendamento_id` pendente, porque ele precisa sobreviver ao redirect externo da Stripe.
- Nenhum estado global novo.

## Fluxo

1. `BookingConfirmationScreen` recebe os dados do agendamento e navega para `PaymentConfirmation`.
2. `PaymentConfirmationScreen` cria a sessão em `/agendamentos/checkout-session`.
3. O app salva `agendamento_id` localmente.
4. O aluno abre `checkout_url`.
5. Ao retornar, a tela consulta `/agendamentos/{id}/checkout-status`.
6. Estados finais exibidos:
   - `AGENDADO`: pagamento confirmado pelo backend.
   - `EXPIRADO`: reserva temporária expirada.
   - `CANCELADO`: booking cancelado.
   - `PENDENTE_PAGAMENTO`: manter polling e permitir reabrir Checkout.

## Decisão de UI

A tela não coleta cartão nem confirma pagamento localmente. Ela mostra resumo, estado da reserva temporária e ação para abrir o Checkout seguro da Stripe.
