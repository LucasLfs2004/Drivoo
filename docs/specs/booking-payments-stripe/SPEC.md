# Booking Payments Stripe Spec

## Contexto

O backend passou a expor um fluxo pago de agendamento baseado em Stripe Checkout. O app mobile ainda possui um fluxo legado com PaymentIntent/mock local, que pode induzir o aluno a acreditar que o pagamento confirmou o agendamento sem validação do backend.

## Objetivo

Integrar o fluxo do aluno ao Checkout hospedado pela Stripe, usando o backend como fonte de verdade para criação, estado financeiro e confirmação do agendamento.

## Regras

- O app deve criar checkout em `POST /agendamentos/checkout-session`.
- O app deve abrir a `checkout_url` retornada pelo backend.
- O app deve persistir o `agendamento_id` retornado para continuar o acompanhamento após retorno ao app.
- O app deve consultar `GET /agendamentos/{agendamento_id}/checkout-status` para saber o estado real.
- O app não deve enviar `success_url` ou `cancel_url`.
- O app não deve considerar redirect da Stripe como confirmação de pagamento.
- O app não deve usar `POST /agendamentos` no novo fluxo pago.

## Escopo Inicial

- Salvar o guia de integração vindo do backend no projeto mobile.
- Criar contratos, API, mapper e hooks do fluxo de checkout em `features/bookings`.
- Substituir a tela de pagamento mockado por uma experiência de Checkout hospedado e polling.
- Preparar deep link para retorno de status de checkout quando o backend apontar para o app.

## Fora do Escopo Inicial

- Listagem real completa de agendamentos.
- Cancelamento/refund.
- Pós-aula, confirmação sem problemas e reporte de problema.
- Onboarding financeiro do instrutor.
