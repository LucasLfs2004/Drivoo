# Foundation Migration Tasks

## App

- criar `src/app/navigation`
- migrar `RootNavigator`
- migrar stacks e tabs principais
- migrar `linking`
- criar `src/app/providers`
- extrair a composição de providers de `App.tsx`

## Core Auth

- criar `src/core/auth`
- mover o `AuthContext` principal
- mapear e remover fluxos paralelos de auth
- consolidar contratos de sessão
- revisar imports do app para apontarem ao novo núcleo

## Core API

- criar `src/core/api`
- mover `apiClient`
- mover config base de API
- mover tratamento base de erro
- mover tipagens compartilhadas de infraestrutura HTTP

## Core Storage

- criar `src/core/storage`
- mover `secureStorage`
- mover `tokenStorage`
- alinhar dependências de auth e API ao storage novo

## Shared UI

- criar `src/shared/ui/base`
- mapear componentes realmente genéricos em `components/common`
- mover gradualmente os componentes de base
- criar `src/shared/ui/feedback` para loading, error e empty states genéricos

## Compatibilidade

- criar reexports temporários para evitar quebra abrupta
- atualizar imports progressivamente
- validar bootstrap e navegação a cada etapa

## Saída da fase

- fundação nova pronta para suportar migração de `instructors`
- spec de `instructors` ajustada para depender da fundação
