# Foundation Migration Design

## Visão geral

A migração da fundação deve preparar a aplicação para o modelo feature-based sem tentar migrar todos os domínios ao mesmo tempo.

## Estrutura alvo inicial

```text
src/
  app/
    navigation/
    providers/
    bootstrap/
    config/

  core/
    auth/
    api/
    storage/
    permissions/

  shared/
    ui/
      base/
      feedback/
      layout/
    hooks/
    utils/
    types/
    constants/
```

## Blocos de migração

### 1. `app/navigation`

Migrar gradualmente:

- `RootNavigator`
- stacks e tabs principais
- linking
- helpers de navegação

Objetivo:

- a composição da navegação deixa de morar numa pasta genérica de topo
- features futuras são encaixadas a partir de `app/navigation`

### 2. `app/providers`

Concentrar providers globais:

- `SafeAreaProvider`
- `StripeProvider`
- `QueryClientProvider`
- `AuthProvider`
- futuros providers realmente globais

Objetivo:

- reduzir peso de composição em `App.tsx`
- deixar explícita a ordem dos providers

### 3. `core/auth`

Mover e consolidar:

- contexto principal de auth
- contratos de sessão
- persistência de token relacionada à sessão
- helpers de restauração e logout

Objetivo:

- eliminar caminhos paralelos de autenticação
- estabilizar a base para features autenticadas

### 4. `core/api`

Concentrar:

- `apiClient`
- configuração base
- interceptors
- tratamento de erro
- contratos HTTP compartilhados

Objetivo:

- tornar a infraestrutura remota reutilizável por todos os domínios

### 5. `core/storage`

Concentrar:

- secure storage
- token storage
- outros mecanismos de persistência técnica compartilhada

### 6. `shared/ui/base`

Migrar gradualmente componentes genéricos de:

- `components/common`
- parte de `components/forms`
- parte de `components/navigation`, quando forem genéricos

Não mover componentes de domínio prematuramente.

## Estratégia de migração

### Etapa 1

Criar a nova árvore base.

### Etapa 2

Mover infraestrutura mantendo reexports temporários onde necessário.

### Etapa 3

Atualizar imports da aplicação principal.

### Etapa 4

Só depois começar a migrar domínios como `instructors`.

## Compatibilidade

Durante a migração:

- podem existir arquivos legado e novos coexistindo
- preferir reexport temporário a quebrar todos os imports de uma vez
- remover legado apenas quando não houver mais dependências

## Riscos

- mover tudo de uma vez e quebrar a inicialização do app
- misturar `core` com lógica de domínio
- mover componente específico para `shared` cedo demais

## Mitigações

- migrar em blocos pequenos
- validar bootstrap do app a cada etapa
- manter reexports temporários controlados
