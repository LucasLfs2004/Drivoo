# Architecture Migration Spec

## Contexto

O Drivoo possui uma base funcional, porém com acúmulo de organização por tipo de arquivo, fluxos paralelos de autenticação, duplicação de contratos e uso misto de mocks e dados reais.

Isso gera ambiguidade sobre:

- onde criar novas features
- onde colocar lógica de API
- onde mapear contratos
- quando usar contexts, stores e queries
- como reutilizar componentes sem inflar `common`

## Problema

A arquitetura atual permite evolução, mas não oferece previsibilidade suficiente para um produto que deve crescer em múltiplos domínios compartilhados entre aluno e instrutor.

Sem uma migração controlada, o app tende a:

- ampliar caminhos paralelos
- duplicar tipos e serviços
- reforçar telas “god components”
- dificultar manutenção e onboarding

## Objetivo

Migrar o Drivoo de forma incremental para uma arquitetura feature-based, sem reescrever o app do zero e sem interromper a evolução funcional do produto.

## Não objetivos

- reescrever todas as telas antes de voltar a entregar features
- eliminar toda a estrutura antiga em uma única etapa
- definir agora a arquitetura final do domínio de pagamentos
- tornar o app mobile dependente do escopo futuro de `admin`

## Resultado esperado

Ao final da migração principal:

- novas features serão criadas no modelo feature-based
- integrações remotas estarão isoladas por domínio
- `AuthContext` será o único fluxo de sessão ativo
- `react-query` será a fonte padrão de estado remoto
- `shared/ui/base` substituirá gradualmente a expansão difusa de `common`
- o fluxo de `spec -> design -> tasks -> implement` estará institucionalizado via skill do projeto

## Estratégia

### Princípio

Adotar uma migração por estrangulamento:

- arquitetura nova convive com a antiga por um período
- features novas ou em retrabalho passam já no padrão novo
- módulos antigos são removidos conforme deixam de ser usados

### Ordem sugerida

1. definir arquitetura-alvo
2. definir skill e workflow do projeto
3. migrar a fundação (`app`, `core`, `shared`)
4. migrar feature piloto de domínio
5. consolidar padrões
6. migrar domínios centrais restantes
7. remover estruturas legadas

## Fundação antes do domínio

Antes da primeira feature piloto de domínio, a aplicação deve migrar sua fundação:

- `app/navigation`
- `app/providers`
- `core/auth`
- `core/api`
- `core/storage`
- `shared/ui/base`

Isso reduz retrabalho e impede que o primeiro domínio novo nasça preso à infraestrutura antiga.

## Feature piloto

A feature piloto recomendada é `instructors`, começando por:

- busca de instrutores
- detalhe do instrutor

Motivos:

- alta visibilidade no produto
- já está em evolução
- possui integração clara com a API
- permite validar `api + hooks + mappers + screens + components`

## Decisões arquiteturais

### Estado remoto

- usar `react-query`

### Estado cliente global

- manter `AuthContext`
- introduzir `zustand` somente onde houver benefício claro

### Organização por domínio

- `bookings` é domínio compartilhado
- não separar `bookings-aluno` e `bookings-instrutor`

### Pagamentos

- estruturar como domínio futuro independente
- não acoplar ao núcleo de `bookings` nesta fase

## Escopo da migração

### Em escopo inicial

- arquitetura-alvo documentada
- skill do projeto criado
- convenções de pastas e responsabilidades
- fundação migrada para o padrão novo
- feature piloto no padrão novo
- unificação de auth principal

### Em escopo posterior

- migração de `bookings`
- migração de `profile`
- reorganização gradual de componentes compartilhados

### Fora do escopo imediato

- chat
- notificações avançadas
- refatoração completa do admin
- rewrite total da navegação

## Critérios de sucesso

- uma nova feature pode ser criada sem dúvida estrutural significativa
- o time sabe onde colocar API, query, mapper, screen e component
- a feature piloto fica como referência concreta do padrão
- o volume de código novo fora da arquitetura-alvo tende a zero

## Riscos

- tentar migrar tudo ao mesmo tempo
- migrar estrutura sem consolidar padrão primeiro
- levar contratos antigos para dentro das novas features
- manter mocks dentro de screens após integração real

## Mitigações

- migrar por domínio
- definir feature piloto
- exigir mapper em integrações remotas
- remover dependência de mock conforme cada tela migra
- registrar decisões no skill do projeto

## Entregáveis desta fase

- `docs/ARCHITECTURE_TARGET.md`
- skill do projeto com workflow e regras
- `docs/specs/architecture-migration/SPEC.md`
- documentos subsequentes de design e tasks da migração
