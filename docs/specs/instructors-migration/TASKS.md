# Instructors Migration Tasks

## Estrutura

- criar `src/features/instructors`
- criar subpastas `api`, `hooks`, `screens`, `components`, `types`, `mappers`, `store`
- criar `index.ts` do domínio

## API e mapeamento

- mover busca de instrutores para `features/instructors/api`
- mover detalhe do instrutor para `features/instructors/api`
- mover horários disponíveis para `features/instructors/api`
- criar DTOs específicos de `instructors`
- criar mappers de busca, detalhe e horários

## Hooks

- criar `useInstructorSearchQuery`
- criar `useInstructorDetailsQuery`
- criar `useInstructorAvailableSlotsQuery`
- padronizar query keys do domínio

## Screens do aluno

- migrar a tela de busca para `features/instructors/screens`
- migrar a tela de detalhe para `features/instructors/screens`
- remover import direto dos services legados nas screens
- manter comportamento visual atual

## Componentes do domínio

- identificar componentes específicos de `instructors`
- mover ou criar componentes dentro da feature
- evitar crescer `shared` com itens ainda muito específicos do domínio

## Limpeza de legado

- remover dependência de `src/mock/instructors.ts` das telas integradas
- remover `src/services/instructorSearchService.ts` após migração
- remover `src/services/instructorService.ts` após migração
- remover `src/services/queries/useInstructorSearchQuery.ts` após migração
- revisar `src/types/search/index.ts`

## Preparação para a próxima etapa

- preparar base para disponibilidade semanal do instrutor
- preparar base para perfil profissional do instrutor
- documentar a feature como referência do padrão
