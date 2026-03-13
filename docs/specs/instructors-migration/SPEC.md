# Instructors Migration Spec

## Contexto

O domínio `instructors` foi escolhido como feature piloto da migração arquitetural do Drivoo para o modelo feature-based.

Hoje o domínio está espalhado entre:

- `src/screens/client/AlunoSearchScreen.tsx`
- `src/screens/client/InstructorDetailsScreen.tsx`
- `src/screens/instructor/InstrutorProfileScreen.tsx`
- `src/screens/instructor/InstrutorScheduleScreen.tsx`
- `src/services/instructorSearchService.ts`
- `src/services/instructorService.ts`
- `src/services/queries/useInstructorSearchQuery.ts`
- `src/mock/instructors.ts`
- `src/types/search/index.ts`

Mesmo com parte da integração já iniciada, o domínio ainda não está organizado como módulo único de negócio.

Esta migração só deve começar após a fundação da aplicação ter sido migrada conforme `docs/specs/foundation-migration/`.

## Problema

O domínio de instrutores ainda sofre com:

- serviços e hooks fora de um módulo de feature
- screens acopladas à estrutura legada de pastas
- tipagens de busca focadas na tela, não no domínio
- resquícios de mocks próximos do fluxo real
- ausência de padrão unificado para `api`, `mappers`, `hooks`, `screens` e `components`

Isso impede que `instructors` sirva como referência arquitetural para os próximos domínios.

## Objetivo

Migrar o domínio `instructors` para a arquitetura feature-based, tornando-o a primeira feature de referência do Drivoo.

## Escopo

### Em escopo

- busca de instrutores para o aluno
- detalhe do instrutor
- consulta de horários disponíveis
- estrutura base do módulo `features/instructors`
- consolidação de serviços, hooks, mappers, tipos e componentes do domínio
- preparar o terreno para disponibilidade, perfil profissional e veículo do instrutor

### Fora de escopo nesta etapa

- fluxo completo de booking
- avaliação do instrutor após aula
- financeiro do instrutor
- chat
- reestruturação completa do dashboard do instrutor

## Resultado esperado

Ao fim desta migração:

- o domínio `instructors` terá uma estrutura própria em `src/features/instructors`
- busca e detalhe do instrutor deixarão de depender de arquivos espalhados em `services/` e `screens/`
- os mapeamentos da API estarão centralizados no domínio
- a feature servirá como template real para `bookings` e `profile`

## Rotas envolvidas

- `GET /instrutores/buscar`
- `GET /instrutores/{instrutor_id}`
- `GET /instrutores/{instrutor_id}/horarios-disponiveis`
- `GET /instrutores/{instrutor_id}/disponibilidades` (preparação)
- `POST /instrutores/{instrutor_id}/disponibilidades` (preparação)
- `PUT /instrutores/{instrutor_id}/disponibilidades/{disponibilidade_id}` (preparação)
- `DELETE /instrutores/{instrutor_id}/disponibilidades/{disponibilidade_id}` (preparação)
- `GET /instrutores/{instrutor_id}/veiculos` (preparação)
- `POST /instrutores/{instrutor_id}/veiculos` (preparação)
- `PUT /instrutores/{instrutor_id}/veiculos/{veiculo_id}` (preparação)

## Estratégia

### Dependência

Esta spec depende da conclusão da migração da fundação:

- `app/navigation`
- `app/providers`
- `core/auth`
- `core/api`
- `core/storage`
- `shared/ui/base`

### Fase 1

Criar o módulo `features/instructors` com estrutura canônica:

- `api`
- `hooks`
- `screens`
- `components`
- `types`
- `mappers`
- `store`

### Fase 2

Mover busca e detalhe para dentro do módulo novo, preservando o comportamento atual da UI.

### Fase 3

Preparar a extensão do domínio para o lado do instrutor:

- perfil profissional
- disponibilidade
- veículo

Sem precisar implementar tudo nesta primeira entrega.

## Decisões

### Organização por domínio

O domínio `instructors` será único, atendendo tanto a perspectiva do aluno quanto a do instrutor.

### Estado

- dados remotos: `react-query`
- estado local compartilhado opcional: `zustand`, se necessário
- não usar context específico do domínio

### Mocks

Mocks podem existir apenas como fixture de desenvolvimento ou teste, nunca como fonte principal das screens integradas.

## Critérios de aceite

- existe um módulo `features/instructors` funcional
- busca de instrutores é servida pelo módulo novo
- detalhe do instrutor é servido pelo módulo novo
- horários disponíveis são servidos pelo módulo novo
- telas não chamam `apiClient` diretamente
- payloads da API não são mapeados inline nas screens
- a feature fica apta a servir de referência para o próximo domínio migrado
