# Frontend Integration: Booking Payments

## Objetivo

Este guia descreve como o frontend deve consumir o fluxo pago de agendamento.

## Documentos Complementares

- backlog recomendado de implementacao: `docs/specs/booking-payments-stripe/FRONTEND_BACKLOG.md`
- gaps e riscos da implementacao atual: `docs/specs/booking-payments-stripe/IMPLEMENTATION_GAPS.md`

Regra principal:

- o redirect do Stripe Checkout nao confirma pagamento
- a confirmacao financeira vem do webhook Stripe processado pelo backend
- o frontend deve consultar o backend para descobrir o estado real

## Fluxo do Aluno

### 1. Iniciar checkout

Endpoint:

```http
POST /agendamentos/checkout-session
```

Request:

```json
{
  "instrutor_id": "uuid",
  "data": "2026-05-01",
  "hora_inicio": "09:00:00",
  "duracao_minutos": 60,
  "veiculo_instrutor": true,
  "veiculo_id": null
}
```

Response:

```json
{
  "agendamento_id": "uuid",
  "agendamento_status": "PENDENTE_PAGAMENTO",
  "transacao_id": "uuid",
  "transacao_status": "PENDING",
  "checkout_session_id": "cs_test_123",
  "checkout_url": "https://checkout.stripe.com/...",
  "expires_at": "2026-05-01T09:10:00-03:00"
}
```

Frontend deve:

- redirecionar o aluno para `checkout_url`
- guardar `agendamento_id` para polling posterior
- mostrar estado de reserva temporaria ate confirmacao do backend

Frontend nao deve:

- enviar `success_url` ou `cancel_url`
- assumir pagamento confirmado ao voltar da Stripe
- criar booking final via `POST /agendamentos` para fluxo pago

### 2. Consultar status do checkout

Endpoint:

```http
GET /agendamentos/{agendamento_id}/checkout-status
```

Usar para polling apos redirect, tela de sucesso ou tela de pendencia.

Estados principais:

- `PENDENTE_PAGAMENTO`: checkout ainda nao confirmado ou expirado
- `AGENDADO`: pagamento confirmado por webhook
- `EXPIRADO`: checkout expirou ou tentativa encerrou sem pagamento
- `CANCELADO`: booking cancelado/refund conforme politica

### 3. Listagem e detalhe

Endpoints:

```http
GET /agendamentos/meus
GET /agendamentos/{agendamento_id}
```

Esses endpoints podem retornar `payment_summary`.

Campos importantes:

- `transacao_id`
- `transacao_status`
- `payment_confirmed`
- `checkout_expires_at`
- `paid_at`
- `failure_code`
- `failure_message`
- `stripe_checkout_session_id`
- `stripe_payment_intent_id`

## Cancelamento e Refund

Endpoint:

```http
POST /agendamentos/{agendamento_id}/cancelar
```

Regras principais:

- aluno cancela antes do pagamento: cancela sem refund
- aluno cancela com mais de 24h antes da aula: refund total automatico
- aluno cancela com menos de 24h: sem refund automatico
- instrutor cancela antes da aula: refund total automatico
- aula iniciada/concluida: sem cancelamento automatico

Frontend deve mostrar a mensagem retornada pelo backend.

## Pos-Aula

### Confirmar sem problemas

Endpoint:

```http
POST /agendamentos/{agendamento_id}/confirmar-sem-problemas
```

Uso:

- acao opcional do aluno
- antecipa elegibilidade do repasse ao instrutor
- nao e obrigatoria para o fluxo funcionar

### Reportar problema

Endpoint:

```http
POST /agendamentos/{agendamento_id}/reportar-problema
```

Request:

```json
{
  "tipo": "AULA_NAO_REALIZADA",
  "descricao": "O instrutor nao compareceu ao local combinado.",
  "aconteceu_em": "2026-05-01T09:00:00-03:00",
  "evidencias": [
    {
      "tipo": "imagem",
      "url": "https://..."
    }
  ],
  "quer_reembolso": true
}
```

Efeito:

- cria ocorrencia operacional
- bloqueia repasse dentro da janela de contestacao
- nao gera refund automatico por si so

## Fluxo do Instrutor

### Onboarding Stripe

Endpoint:

```http
POST /instrutores/me/stripe/onboarding-link
```

Uso:

- backend cria conta Connect Express quando necessario
- backend retorna URL hospedada pela Stripe
- frontend redireciona instrutor para a URL

O cadastro financeiro deve coletar/salvar antes:

- tipo fiscal `PF` ou `MEI`
- CPF
- telefone
- data de nascimento
- aceite contratual
- aceite de responsabilidade fiscal
- para `MEI`: CNPJ, razao social e endereco fiscal

## Fluxo Legado

`POST /agendamentos` continua existindo como compatibilidade temporaria.

Regra de rollout:

- fluxo pago novo deve usar `POST /agendamentos/checkout-session`
- frontend nao deve misturar `POST /agendamentos` com checkout pago
- remocao ou restricao do legado fica para fase posterior
