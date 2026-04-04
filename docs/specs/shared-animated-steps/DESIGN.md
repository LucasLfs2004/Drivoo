# Shared Animated Steps Design

## Visão geral

A solução será dividida em duas responsabilidades:

1. `StepFlow`
2. `StepIndicator` opcional

### `StepFlow`

Componente compartilhado responsável por:

- receber steps
- controlar a etapa atual em modo controlado
- animar a troca de conteúdo
- expor utilidades de navegação
- integrar callbacks de guarda antes da navegação

### `StepIndicator`

Componente visual opcional responsável por:

- mostrar progresso
- destacar step ativo
- indicar concluídos

O onboarding poderá continuar usando `OnboardingStepper` em uma primeira fase, desde que o conteúdo passe a usar `StepFlow`.

## Decisão principal

Não embutir o indicador visual obrigatoriamente dentro do motor de steps.

### Motivo

O componente mais reutilizável não é o desenho do stepper, e sim:

- o ciclo de vida do step
- a transição animada
- o contrato de navegação

Se o indicador for obrigatório:

- a API fica mais rígida
- outros fluxos ficam presos ao layout de onboarding
- aumentam os overrides visuais

Por isso, a proposta é:

- `StepFlow` como base compartilhada
- `header` ou `renderIndicator` opcional

## Localização dos arquivos

Como é uma capacidade genérica e reutilizável entre domínios, o componente deve ficar em `shared`.

Estrutura sugerida:

```text
src/shared/ui/flows/StepFlow.tsx
src/shared/ui/flows/types.ts
src/shared/ui/flows/index.ts
```

Se o time preferir evitar uma nova pasta, a segunda opção aceitável é:

```text
src/shared/ui/base/StepFlow.tsx
```

Recomendação:

- usar `src/shared/ui/flows`

Motivo:

- o componente não é um átomo visual simples
- ele é um orquestrador de UI e navegação local
- isso evita inflar `shared/ui/base` com componentes mais “workflow-like”

## Contrato sugerido

```ts
export interface StepFlowItem {
  id: string;
  render: () => React.ReactNode;
  isEnabled?: boolean;
}

export interface StepFlowProps {
  steps: StepFlowItem[];
  currentStep: number;
  onStepChange: (nextStep: number) => void;
  onBeforeNext?: (currentStep: number) => boolean | Promise<boolean>;
  onBeforeBack?: (currentStep: number) => boolean | Promise<boolean>;
  animationDurationMs?: number;
  renderHeader?: (params: {
    currentStep: number;
    totalSteps: number;
    goNext: () => Promise<void>;
    goBack: () => Promise<void>;
    isFirstStep: boolean;
    isLastStep: boolean;
  }) => React.ReactNode;
}
```

## Estratégia de renderização

`StepFlow` deve manter apenas o step atual montado durante a fase inicial.

### Motivo

- reduz complexidade
- evita custo de manter múltiplos formulários visíveis
- encaixa melhor com o onboarding atual

Para a animação:

- ao trocar de etapa, o conteúdo atual sai com leve fade + deslocamento
- o novo conteúdo entra com fade + deslocamento inverso
- a direção depende de `nextStep > currentStep`

## Estratégia de animação

Prioridade:

1. `react-native-reanimated`
2. `@legendapp/motion` se oferecer integração mais simples ao padrão atual

Recomendação:

- usar `react-native-reanimated`

Motivo:

- já está instalado
- tem melhor previsibilidade para transições direcionais
- reduz dependência de abstração adicional para uma interação central

### Comportamento esperado

- avanço:
  - conteúdo atual desloca levemente para a esquerda e perde opacidade
  - próximo conteúdo entra da direita para o centro
- volta:
  - conteúdo atual desloca levemente para a direita e perde opacidade
  - conteúdo anterior entra da esquerda para o centro

Parâmetros iniciais sugeridos:

- deslocamento horizontal: `16` a `24`
- duração: `180` a `240ms`
- easing suave

## Integração com onboarding

`OnboardingScreen` continuará responsável por:

- `currentStep`
- steps efetivos de aluno/instrutor
- validação antes de avançar
- submit final

Mudança estrutural:

- o card central deixa de chamar `renderStepContent()` diretamente
- o card passa a renderizar `StepFlow`
- cada etapa vira um item do array `steps`

Exemplo conceitual:

```ts
const stepItems = [
  { id: 'personal', render: renderPersonalStep },
  { id: 'account-type', render: renderAccountTypeStep },
  { id: 'vehicle', render: renderVehicleStep },
  ...(isInstrutor ? [{ id: 'instructor', render: renderInstructorStep }] : []),
];
```

## Estado e responsabilidades

### `OnboardingScreen`

- fonte de verdade do formulário
- validação
- transição de índice
- submit final

### `StepFlow`

- animação
- helpers de navegação
- renderização controlada do conteúdo atual

### `OnboardingStepper`

- indicador visual
- não guarda estado próprio além do recebido por props

## Acessibilidade e robustez

- não depender apenas de animação para indicar estado
- suportar conteúdos com altura variável
- evitar salto brusco de layout sempre que possível
- permitir desativar animação no futuro por prop, se necessário

## Riscos

- animação conflitar com `ScrollView` da tela
- layout “piscar” ao trocar steps com alturas muito diferentes
- aumento de acoplamento se o componente tentar resolver validação e submit internamente

## Mitigações

- manter animação no container de conteúdo, não na tela inteira
- manter validação fora do componente compartilhado
- começar pelo onboarding como implementação de referência
- deixar o indicador visual desacoplado
