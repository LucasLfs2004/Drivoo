# Instructor Financial Onboarding Design

## Domínio

A integração fica em `features/instructors`, porque o financeiro de recebimentos é uma capacidade do instrutor. O domínio `payments` segue reservado para fluxos transacionais mais amplos.

## Módulos

- `features/instructors/api/instructorFinancialApi.ts`
- `features/instructors/mappers/mapInstructorFinancial.ts`
- `features/instructors/hooks/useInstructorFinancialQuery.ts`
- `features/instructors/hooks/useInstructorFinancialMutations.ts`
- `features/instructors/screens/InstructorFinancialSettingsScreen.tsx`

## Estado

- React Query para consulta e mutations.
- Nenhum estado global novo.
- Estado local apenas para campos do formulário.

## Navegação

Entrada manual:

- Perfil do instrutor -> Configurações -> Recebimentos.

Retornos Stripe:

- `https://drivoo.app/instructor/stripe/return`
- `https://drivoo.app/instructor/stripe/refresh`
- `drivoo://instructor/stripe/return`
- `drivoo://instructor/stripe/refresh`

Esses links abrem a mesma tela de Recebimentos e forçam refetch do status financeiro.
