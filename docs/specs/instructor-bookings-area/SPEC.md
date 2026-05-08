# Instructor Bookings Area Spec

## Contexto

Instrutores precisam acompanhar aulas agendadas dentro da area do instrutor, abrir detalhes de cada aula e executar acoes operacionais ligadas ao agendamento.

## Objetivo

Criar uma experiencia inicial para o instrutor:

- listar aulas agendadas por status
- abrir detalhes da aula
- acessar chat da aula
- iniciar aula
- concluir aula
- marcar nao comparecimento
- sinalizar que relato de problema do instrutor depende de nova rota backend

## Nao objetivos

- implementar upload de evidencias
- criar backend de chat em tempo real
- remodelar pagamentos ou repasses
- separar um dominio `instrutor-bookings`

## Dominio

`bookings` continua sendo o dominio fonte. A perspectiva do instrutor aparece em screens e textos, mas API, mappers, hooks e mutations ficam em `src/features/bookings`.

## Rotas API

- `GET /agendamentos/meus`
- `GET /agendamentos/{agendamento_id}`
- `PUT /agendamentos/{agendamento_id}/status`
- `POST /agendamentos/{agendamento_id}/cancelar`

As rotas `reportar-problema` e `confirmar-sem-problemas` existem hoje para aluno, nao para instrutor.

## Estado

Usar `react-query` para lista, detalhe e mutations. Nao ha necessidade de `zustand`.
