# Design Document: Student Progress Tracking

## Overview

Esta funcionalidade adiciona um sistema completo de acompanhamento de progresso de aulas práticas para alunos no aplicativo Drivoo. O design foca em fornecer uma experiência visual clara e intuitiva, permitindo que alunos visualizem e gerenciem seu progresso nas categorias A (moto) e B (carro) de forma independente e simultânea.

A solução utiliza o componente ProgressCard existente como base, expandindo-o para suportar múltiplas categorias com edição inline, persistência de dados e feedback visual motivador.

## Architecture

### Component Hierarchy

```
AlunoHomeScreen
├── Header
├── EnhancedProgressCard (novo componente melhorado)
│   ├── CategoryProgressSection (Categoria A)
│   │   ├── CategoryHeader
│   │   ├── ProgressBar
│   │   ├── LessonCounter (com edição inline)
│   │   └── MilestoneIndicators
│   └── CategoryProgressSection (Categoria B)
│       ├── CategoryHeader
│       ├── ProgressBar
│       ├── LessonCounter (com edição inline)
│       └── MilestoneIndicators
├── EnhancedLessonCard
├── QuickActions Card
├── TipCard
├── AchievementsCard
└── DesignSystem Card (movido para o final)
```

### Data Flow

```
User Interaction → EnhancedProgressCard
                 ↓
            State Update (React State)
                 ↓
            AsyncStorage.setItem()
                 ↓
            Visual Feedback (Progress Bar, Badges)

App Launch → AsyncStorage.getItem()
           ↓
      Initialize State
           ↓
      Render EnhancedProgressCard
```

### Storage Structure

```typescript
// AsyncStorage keys
const STORAGE_KEYS = {
  CATEGORY_A_LESSONS: '@drivoo:progress:categoryA',
  CATEGORY_B_LESSONS: '@drivoo:progress:categoryB',
};

// Stored data format
interface StoredProgress {
  completedLessons: number;
  lastUpdated: string; // ISO timestamp
}
```

## Components and Interfaces

### EnhancedProgressCard Component

```typescript
interface EnhancedProgressCardProps {
  // Não recebe props - gerencia estado internamente
}

interface ProgressState {
  categoryA: {
    completedLessons: number;
    isEditing: boolean;
  };
  categoryB: {
    completedLessons: number;
    isEditing: boolean;
  };
  isLoading: boolean;
  error: string | null;
}

const RECOMMENDED_LESSONS = 10;
const MINIMUM_LESSONS = 2;
const MAX_LESSONS = 20;
```

**Responsabilidades:**
- Gerenciar estado de progresso para ambas as categorias
- Carregar dados do AsyncStorage na montagem
- Persistir alterações automaticamente
- Fornecer interface de edição inline
- Exibir feedback visual de progresso
- Mostrar indicadores de marcos (2 aulas mínimo, 10 recomendado)

### CategoryProgressSection Component

```typescript
interface CategoryProgressSectionProps {
  category: 'A' | 'B';
  categoryLabel: string; // "Categoria A - Moto" ou "Categoria B - Carro"
  completedLessons: number;
  isEditing: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleEdit: () => void;
}
```

**Responsabilidades:**
- Renderizar UI de uma categoria específica
- Exibir barra de progresso visual
- Fornecer controles de incremento/decremento
- Mostrar badges de marcos atingidos
- Calcular e exibir porcentagem de progresso

### LessonCounter Component

```typescript
interface LessonCounterProps {
  count: number;
  isEditing: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleEdit: () => void;
  maxLessons: number;
}
```

**Responsabilidades:**
- Exibir contador de aulas
- Fornecer botões de +/- quando em modo de edição
- Validar limites (0 a MAX_LESSONS)
- Feedback visual de interação

## Data Models

### Progress Data Model

```typescript
interface CategoryProgress {
  completedLessons: number;
  percentage: number; // calculado: (completedLessons / RECOMMENDED_LESSONS) * 100
  hasReachedMinimum: boolean; // completedLessons >= MINIMUM_LESSONS
  hasReachedRecommended: boolean; // completedLessons >= RECOMMENDED_LESSONS
}

interface ProgressData {
  categoryA: CategoryProgress;
  categoryB: CategoryProgress;
  lastUpdated: Date;
}
```

### Storage Service Interface

```typescript
interface ProgressStorageService {
  loadProgress(): Promise<{ categoryA: number; categoryB: number }>;
  saveProgress(category: 'A' | 'B', lessons: number): Promise<void>;
  clearProgress(): Promise<void>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

Após analisar todos os critérios de aceitação testáveis, identifiquei as seguintes redundâncias e oportunidades de consolidação:

**Redundâncias Identificadas:**

1. **Cálculo de Porcentagem (1.4, 4.4, 6.5)**: Os requisitos 1.4, 4.4 e 6.5 todos testam o cálculo de porcentagem de progresso. Podemos consolidar em uma única propriedade que verifica o cálculo correto para qualquer categoria e qualquer número de aulas.

2. **Isolamento de Categorias (3.3, 4.1, 4.3)**: Os requisitos 3.3, 4.1 e 4.3 todos testam que as categorias são independentes. Podemos consolidar em uma propriedade que verifica que operações em uma categoria não afetam a outra.

3. **Feedback Visual de Marcos (6.3, 6.4)**: Ambos testam feedback visual quando marcos são atingidos. Podemos consolidar em uma propriedade que verifica feedback para qualquer marco (2 ou 10 aulas).

4. **Persistência Round-Trip (3.1, 3.2)**: Estes requisitos testam salvar e carregar dados. Podemos consolidar em uma propriedade de round-trip que verifica que salvar e depois carregar retorna o mesmo valor.

**Propriedades Consolidadas:**

Após a reflexão, manteremos as seguintes propriedades únicas:

1. Cálculo correto de porcentagem para qualquer número de aulas
2. Isolamento completo entre categorias A e B
3. Validação de limites (0-20 aulas)
4. Validação de entrada (apenas inteiros não-negativos)
5. Persistência round-trip (salvar → carregar → valor igual)
6. Feedback visual de marcos (2 e 10 aulas)
7. Área de toque adequada para botões (44x44 pixels mínimo)

### Correctness Properties

**Property 1: Percentage Calculation Accuracy**

*For any* category (A or B) and any number of completed lessons between 0 and 20, the displayed percentage should equal (completedLessons / 10) * 100, rounded to the nearest integer.

**Validates: Requirements 1.4, 4.4, 6.5**

**Property 2: Category Independence**

*For any* initial state with progress values for both categories, when updating the progress of one category (either A or B), the progress value of the other category should remain unchanged.

**Validates: Requirements 3.3, 4.1, 4.3**

**Property 3: Lesson Count Bounds Validation**

*For any* category, the system should accept lesson count values from 0 to 20 (inclusive) and reject any values outside this range.

**Validates: Requirements 2.4**

**Property 4: Non-Negative Integer Validation**

*For any* input to the lesson counter, the system should only accept non-negative integer values and reject decimal numbers, negative numbers, or non-numeric inputs.

**Validates: Requirements 2.5**

**Property 5: Progress Persistence Round-Trip**

*For any* valid lesson count value (0-20) saved to AsyncStorage for a specific category, loading that value from AsyncStorage should return the exact same value that was saved.

**Validates: Requirements 3.1, 3.2**

**Property 6: Milestone Visual Feedback**

*For any* category with completed lessons >= 2, the system should display a visual indicator for the minimum milestone, and for completed lessons >= 10, the system should display a visual indicator for the recommended milestone.

**Validates: Requirements 6.3, 6.4**

**Property 7: Touch Target Accessibility**

*For all* interactive buttons (increment, decrement, edit toggle), the touchable area should be at least 44x44 pixels to meet accessibility standards.

**Validates: Requirements 7.3**

**Property 8: Immediate Progress Update**

*For any* increment or decrement operation on a category's lesson count, the displayed progress (percentage and visual bar) should update immediately without requiring navigation or screen refresh.

**Validates: Requirements 2.3**

**Property 9: Display of Recommended Lessons**

*For any* category, the system should always display the recommended lesson count of 10 alongside the current completed lesson count.

**Validates: Requirements 1.3**

## Error Handling

### AsyncStorage Errors

**Error Scenarios:**
1. Storage quota exceeded
2. Storage permission denied
3. Storage corruption
4. Network issues (if using cloud-backed storage)

**Handling Strategy:**
```typescript
async function saveProgress(category: 'A' | 'B', lessons: number): Promise<void> {
  try {
    const key = category === 'A' 
      ? STORAGE_KEYS.CATEGORY_A_LESSONS 
      : STORAGE_KEYS.CATEGORY_B_LESSONS;
    
    const data: StoredProgress = {
      completedLessons: lessons,
      lastUpdated: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // Log error for debugging
    console.error('Failed to save progress:', error);
    
    // Show user-friendly error message
    Alert.alert(
      'Erro ao Salvar',
      'Não foi possível salvar seu progresso. Por favor, tente novamente.',
      [{ text: 'OK' }]
    );
    
    // Optionally: retry logic or fallback to in-memory state
    throw error; // Re-throw to allow component to handle
  }
}
```

### Input Validation Errors

**Error Scenarios:**
1. Non-numeric input
2. Negative numbers
3. Decimal numbers
4. Values exceeding MAX_LESSONS

**Handling Strategy:**
```typescript
function validateLessonCount(value: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(value)) {
    return { valid: false, error: 'O número de aulas deve ser um número inteiro' };
  }
  
  if (value < 0) {
    return { valid: false, error: 'O número de aulas não pode ser negativo' };
  }
  
  if (value > MAX_LESSONS) {
    return { valid: false, error: `O número máximo de aulas é ${MAX_LESSONS}` };
  }
  
  return { valid: true };
}
```

### Component Mount Errors

**Error Scenarios:**
1. AsyncStorage unavailable
2. Corrupted stored data
3. Missing storage permissions

**Handling Strategy:**
```typescript
async function loadProgress(): Promise<{ categoryA: number; categoryB: number }> {
  try {
    const [categoryAData, categoryBData] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_A_LESSONS),
      AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_B_LESSONS),
    ]);
    
    const categoryA = categoryAData 
      ? JSON.parse(categoryAData).completedLessons 
      : 0;
    const categoryB = categoryBData 
      ? JSON.parse(categoryBData).completedLessons 
      : 0;
    
    // Validate loaded data
    if (!Number.isInteger(categoryA) || categoryA < 0 || categoryA > MAX_LESSONS) {
      throw new Error('Invalid categoryA data');
    }
    if (!Number.isInteger(categoryB) || categoryB < 0 || categoryB > MAX_LESSONS) {
      throw new Error('Invalid categoryB data');
    }
    
    return { categoryA, categoryB };
  } catch (error) {
    console.error('Failed to load progress:', error);
    
    // Return default values on error
    return { categoryA: 0, categoryB: 0 };
  }
}
```

## Testing Strategy

### Dual Testing Approach

Esta funcionalidade requer tanto testes unitários quanto testes baseados em propriedades para garantir cobertura completa:

**Unit Tests** - Focar em:
- Exemplos específicos de renderização de componentes
- Casos de borda (0 aulas, 20 aulas, 2 aulas, 10 aulas)
- Condições de erro (AsyncStorage falha, dados corrompidos)
- Integração entre componentes (EnhancedProgressCard → CategoryProgressSection)
- Inicialização com dados vazios (Requirement 3.5)
- Presença de elementos UI específicos (badges, ícones, labels)

**Property-Based Tests** - Focar em:
- Propriedades universais que devem valer para qualquer entrada válida
- Cálculos matemáticos (porcentagem de progresso)
- Isolamento de estado entre categorias
- Validação de limites e entrada
- Persistência round-trip
- Feedback visual baseado em condições

### Property-Based Testing Configuration

**Framework:** fast-check (para TypeScript/React Native)

**Configuração:**
- Mínimo de 100 iterações por teste de propriedade
- Cada teste deve referenciar a propriedade do documento de design
- Formato de tag: `Feature: student-progress-tracking, Property {number}: {property_text}`

**Exemplo de Teste de Propriedade:**

```typescript
import fc from 'fast-check';

// Feature: student-progress-tracking, Property 1: Percentage Calculation Accuracy
describe('Progress Percentage Calculation', () => {
  it('should calculate percentage correctly for any lesson count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }), // Generate random lesson counts
        (completedLessons) => {
          const expectedPercentage = Math.round((completedLessons / 10) * 100);
          const actualPercentage = calculatePercentage(completedLessons);
          
          expect(actualPercentage).toBe(expectedPercentage);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: student-progress-tracking, Property 2: Category Independence
describe('Category Independence', () => {
  it('should not affect other category when updating one', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }), // Initial categoryA value
        fc.integer({ min: 0, max: 20 }), // Initial categoryB value
        fc.integer({ min: 0, max: 20 }), // New categoryA value
        (initialA, initialB, newA) => {
          const state = { categoryA: initialA, categoryB: initialB };
          const newState = updateCategory(state, 'A', newA);
          
          expect(newState.categoryB).toBe(initialB);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Examples

```typescript
// Test specific rendering
describe('EnhancedProgressCard Rendering', () => {
  it('should render both category sections', () => {
    const { getByText } = render(<EnhancedProgressCard />);
    
    expect(getByText(/Categoria A/i)).toBeTruthy();
    expect(getByText(/Categoria B/i)).toBeTruthy();
  });
  
  it('should show minimum milestone badge at 2 lessons', () => {
    const { getByText } = render(
      <CategoryProgressSection 
        category="A"
        completedLessons={2}
        {...otherProps}
      />
    );
    
    expect(getByText(/Mínimo Atingido/i)).toBeTruthy();
  });
  
  it('should initialize with 0 lessons when no data exists', async () => {
    // Mock AsyncStorage to return null
    AsyncStorage.getItem.mockResolvedValue(null);
    
    const { getByText } = render(<EnhancedProgressCard />);
    
    await waitFor(() => {
      expect(getByText(/0\/10/)).toBeTruthy();
    });
  });
});

// Test error handling
describe('AsyncStorage Error Handling', () => {
  it('should show error alert when save fails', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    AsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));
    
    const { getByTestId } = render(<EnhancedProgressCard />);
    const incrementButton = getByTestId('increment-button-A');
    
    fireEvent.press(incrementButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Erro ao Salvar',
        expect.any(String),
        expect.any(Array)
      );
    });
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Property Tests**: 100% coverage of correctness properties
- **Integration Tests**: Key user flows (view → edit → save → reload)
- **Accessibility Tests**: Touch targets, labels, screen reader support

## Implementation Notes

### Performance Considerations

1. **Debounce AsyncStorage Writes**: Se o usuário clicar rapidamente em incrementar/decrementar, debounce as escritas para evitar sobrecarga
2. **Memoization**: Use React.memo para CategoryProgressSection para evitar re-renders desnecessários
3. **Lazy Loading**: Carregar dados do AsyncStorage apenas quando necessário

### Accessibility Considerations

1. **Screen Reader Support**: Adicionar accessibilityLabel para todos os elementos interativos
2. **Touch Targets**: Garantir mínimo de 44x44 pixels para todos os botões
3. **Color Contrast**: Usar cores do design system que atendem WCAG AA
4. **Haptic Feedback**: Adicionar feedback tátil ao incrementar/decrementar

### Visual Design Guidelines

**Progress Bar:**
- Altura: 8px (moderateScale)
- Border radius: full (9999)
- Background: colors.neutral[200]
- Fill: colors.primary[500]
- Animação suave ao atualizar (150ms ease-out)

**Milestone Badges:**
- Mínimo (2 aulas): Badge variant="success", texto "Mínimo Atingido"
- Recomendado (10 aulas): Badge variant="primary", texto "Meta Recomendada"

**Category Headers:**
- Categoria A: Ícone de moto (Bike do Lucide)
- Categoria B: Ícone de carro (Car do Lucide)
- Typography variant="h4" para título

**Edit Controls:**
- Botões circulares com ícones Plus/Minus do Lucide
- Size: 44x44 pixels (touch target)
- Variant: "ghost" quando não editando, "primary" quando editando

### Code Organization

```
src/
├── components/
│   └── display/
│       ├── EnhancedProgressCard.tsx (novo)
│       ├── CategoryProgressSection.tsx (novo)
│       ├── LessonCounter.tsx (novo)
│       └── ProgressCard.tsx (manter para compatibilidade)
├── services/
│   └── progressStorage.ts (novo)
├── hooks/
│   └── useProgressTracking.ts (novo - opcional)
└── screens/
    └── client/
        └── AlunoHomeScreen.tsx (atualizar)
```

### Migration Strategy

1. **Fase 1**: Criar novos componentes sem remover os antigos
2. **Fase 2**: Atualizar AlunoHomeScreen para usar EnhancedProgressCard
3. **Fase 3**: Remover componentes obsoletos após validação
4. **Fase 4**: Limpar imports e código não utilizado

Esta abordagem permite rollback fácil se necessário e validação incremental.
