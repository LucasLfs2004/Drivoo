# Shared Animated Steps Spec

## Contexto

O Drivoo já possui fluxos guiados por etapas, com destaque para o onboarding em [OnboardingScreen](/Users/lucas/Documents/IA/Drivoo/src/features/auth/screens/OnboardingScreen.tsx).

Hoje a tela resolve:

- indicador visual da etapa atual
- renderização condicional do conteúdo por `currentStep`
- validação antes de avançar
- botões de navegação

O fluxo funciona, mas a experiência ainda é muito manual e pouco reutilizável:

- não há transição animada entre etapas
- o gerenciamento das views fica concentrado na screen
- o indicador de steps e o conteúdo não seguem um contrato genérico
- novos fluxos multi-step tenderiam a repetir a mesma estrutura

## Problema

O app não possui hoje uma fundação reutilizável para fluxos em etapas com:

- animação entre telas
- gerenciamento previsível de índice atual
- integração com validação assíncrona antes de avançar
- possibilidade de reuso em outros domínios além de `auth`

Sem isso, cada novo wizard tende a nascer como uma screen ad hoc, com risco de:

- duplicação de lógica
- experiências inconsistentes
- transições frágeis
- acoplamento excessivo entre conteúdo, cabeçalho visual e navegação

## Objetivo

Criar uma especificação para um componente reutilizável de fluxo em etapas, com foco principal em:

1. animação de transição entre conteúdos
2. gerenciamento de múltiplos steps e sua navegação
3. integração simples com validações síncronas ou assíncronas
4. adoção imediata no onboarding de auth

## Não objetivos

- criar uma biblioteca genérica pública
- substituir toda e qualquer variação visual de stepper do app
- introduzir dependência externa apenas para resolver animação de wizard
- mover regras de negócio do onboarding para dentro do componente compartilhado

## Resultado esperado

Ao final da implementação:

- o app terá um componente compartilhado para fluxos multi-step animados
- o onboarding passará a usar esse componente como caso de referência
- a animação refletirá direção da navegação:
  - avançar entra da direita
  - voltar entra da esquerda
- a screen continuará dona do conteúdo e da regra de submit
- o indicador visual de step poderá ser plugado como componente opcional

## Decisão de produto e arquitetura

O componente reutilizável deve priorizar o motor do fluxo e a transição animada.

O indicador visual de steps não precisa ser obrigatório dentro do mesmo componente-base.

Justificativa:

- a parte realmente compartilhável entre domínios é a orquestração do fluxo
- o indicador visual pode variar bastante por contexto
- onboarding, booking e futuros fluxos podem querer cabeçalhos diferentes
- manter o indicador como slot opcional evita inflar a API do componente base

Ainda assim, o componente base pode aceitar um `renderIndicator` ou `header` opcional para conveniência.

## Requisitos funcionais

- renderizar uma etapa atual com base em um índice controlado
- permitir avançar e voltar programaticamente
- suportar steps dinâmicos
- permitir bloqueio de avanço por validação
- suportar callback assíncrono antes de mudar de etapa
- permitir detectar primeira e última etapa
- permitir submit final fora do componente ou por callback opcional

## Requisitos de UX

- transição animada perceptível, mas rápida
- animação consistente entre ida e volta
- sem flicker ao trocar conteúdo
- manter layout estável durante a troca de step
- permitir uso com scroll interno do conteúdo
- preservar boa experiência em telas menores

## Requisitos técnicos

- reutilizar dependências já existentes no projeto
- priorizar `react-native-reanimated` ou `@legendapp/motion`
- não acoplar o componente ao domínio `auth`
- componente compartilhado deve viver em `src/shared`
- a screen consumidora continua responsável por:
  - dados do formulário
  - regras de negócio
  - validação específica
  - submit final

## Escopo inicial

### Em escopo

- componente compartilhado de fluxo animado em steps
- contrato de steps reutilizável
- suporte a direção de animação
- integração com `OnboardingScreen`
- manutenção do `OnboardingStepper` atual como indicador visual, com pequenos ajustes quando necessário

### Fora de escopo nesta fase

- persistência automática de draft entre reinícios
- navegação por gesto entre etapas
- analytics embutido no componente
- sistema completo de temas/skins para stepper

## Módulos afetados

- `src/shared/ui`
- `src/features/auth/screens`
- `src/features/auth/components`

## Critérios de sucesso

- `OnboardingScreen` deixa de renderizar o conteúdo por blocos soltos diretamente no card
- a troca de etapas passa a ser animada e direcional
- o contrato do componente pode ser reutilizado por outro fluxo sem conhecer `auth`
- a lógica de validação do onboarding continua clara e fora do componente compartilhado
