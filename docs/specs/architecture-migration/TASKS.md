# Architecture Migration Tasks

## Fase 0: Base

- publicar arquitetura-alvo
- publicar spec da migração
- criar skill do projeto

## Fase 1: Fundação técnica

- definir árvore inicial de `src/app`, `src/core`, `src/shared`, `src/features`
- estabelecer convenção de query keys
- consolidar auth principal
- definir política de stores locais com `zustand`
- executar a spec `foundation-migration`

## Fase 2: Feature piloto `instructors`

- criar módulo `features/instructors`
- migrar busca para o módulo novo
- migrar detalhe do instrutor
- migrar horários disponíveis
- remover dependência residual de mocks das telas migradas

## Fase 3: Domínio `bookings`

- criar módulo `features/bookings`
- modelar fluxo de solicitação, aceite/recusa e confirmação
- integrar queries e mutations principais
- separar telas por perspectiva sem separar domínio

## Fase 4: Domínio `profile`

- criar módulo `features/profile`
- mover perfil e configurações para o padrão novo
- consolidar atualização do usuário logado

## Fase 5: Shared e legado

- criar `shared/ui/base`
- mover componentes realmente genéricos
- reduzir expansão de `components/common`
- remover contextos e serviços legados sem uso

## Fase 6: Governança

- exigir spec para mudanças estruturais e features complexas
- usar o skill do projeto como padrão operacional
- revisar PRs e tarefas sob a arquitetura-alvo
