# Architecture Migration Design

## Visão geral

A migração será incremental, orientada por domínio e sem rewrite total. A estrutura antiga será reduzida conforme as features forem sendo substituídas pelo padrão novo.

## Padrão técnico alvo

Cada feature migrada deve obedecer ao modelo:

```text
features/<domain>/
  api/
  hooks/
  screens/
  components/
  types/
  mappers/
  store/
```

## Sequência de migração

### Etapa 1: Base documental e operacional

- arquitetura-alvo documentada
- skill do projeto criado
- spec de migração publicada

### Etapa 2: Fundação

Migrar:

- `app/navigation`
- `app/providers`
- `core/auth`
- `core/api`
- `core/storage`
- `shared/ui/base`

### Etapa 3: Feature piloto

Migrar `instructors`:

- `search`
- `details`
- disponibilidade

### Etapa 4: Consolidação de estados e integrações

- garantir `react-query` como padrão
- impedir uso de `apiClient` nas screens
- remover caminhos antigos de auth ainda ativos

### Etapa 5: Domínios centrais

- `bookings`
- `profile`

### Etapa 6: Shared/UI

- organizar `shared/ui/base`
- reduzir crescimento de `components/common`

## Estratégia de convivência

Durante a migração:

- a estrutura antiga continua existindo
- toda feature nova relevante entra no padrão novo
- retrabalhos relevantes priorizam mover para o padrão novo

## Política de corte

Uma pasta ou fluxo legado só deve ser removido quando:

- não houver import residual
- a feature equivalente nova estiver estável
- os tipos e hooks antigos não forem mais fonte de verdade

## Feature piloto como referência

A primeira feature migrada deve servir como exemplo de:

- query key naming
- mapeamento API -> domínio
- separação screen/component
- uso opcional de store local

## Observações

- `admin` não deve dirigir as decisões estruturais agora
- `payments` entra como domínio preparado, não implementado em profundidade
- `bookings` deve refletir um domínio compartilhado por aluno e instrutor
