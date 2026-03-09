# Implementation Plan: Student Progress Tracking

## Overview

Este plano implementa a funcionalidade de acompanhamento de progresso de aulas práticas para alunos no Drivoo. A implementação será incremental, começando pelos serviços de persistência, depois os componentes visuais, e finalmente a integração na Home Screen. Cada etapa inclui testes para validar a correção antes de prosseguir.

## Tasks

- [x] 1. Criar serviço de persistência de progresso
  - Criar arquivo `src/services/progressStorage.ts`
  - Implementar funções `loadProgress`, `saveProgress` e `clearProgress`
  - Adicionar tratamento de erros para falhas do AsyncStorage
  - Adicionar validação de dados carregados
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 1.1 Escrever testes de propriedade para persistência
  - **Property 5: Progress Persistence Round-Trip**
  - **Validates: Requirements 3.1, 3.2**
  - Testar que salvar e carregar retorna o mesmo valor para qualquer entrada válida

- [ ]* 1.2 Escrever testes unitários para casos de erro
  - Testar inicialização com AsyncStorage vazio (retorna 0 para ambas categorias)
  - Testar tratamento de dados corrompidos
  - Testar falha ao salvar (deve lançar erro)
  - _Requirements: 3.4, 3.5_

- [x] 2. Criar componente LessonCounter
  - Criar arquivo `src/components/display/LessonCounter.tsx`
  - Implementar interface de props (count, isEditing, callbacks, maxLessons)
  - Implementar UI com botões de incremento/decremento (ícones Plus/Minus do Lucide)
  - Adicionar validação de limites (0 a MAX_LESSONS)
  - Garantir área de toque mínima de 44x44 pixels para botões
  - Usar design tokens para estilos (cores, espaçamento, tipografia)
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 7.3, 7.4_

- [ ]* 2.1 Escrever testes de propriedade para validação
  - **Property 3: Lesson Count Bounds Validation**
  - **Validates: Requirements 2.4**
  - Testar que valores 0-20 são aceitos e valores fora são rejeitados
  
- [ ]* 2.2 Escrever testes de propriedade para entrada
  - **Property 4: Non-Negative Integer Validation**
  - **Validates: Requirements 2.5**
  - Testar que apenas inteiros não-negativos são aceitos

- [ ]* 2.3 Escrever testes de propriedade para área de toque
  - **Property 7: Touch Target Accessibility**
  - **Validates: Requirements 7.3**
  - Testar que todos os botões têm área mínima de 44x44 pixels

- [ ]* 2.4 Escrever testes unitários para LessonCounter
  - Testar renderização de botões quando isEditing=true
  - Testar que botões não aparecem quando isEditing=false
  - Testar callbacks de incremento/decremento
  - Testar que ícones do Lucide são usados
  - _Requirements: 2.1, 2.2, 7.4_

- [x] 3. Criar componente CategoryProgressSection
  - Criar arquivo `src/components/display/CategoryProgressSection.tsx`
  - Implementar interface de props (category, categoryLabel, completedLessons, etc.)
  - Implementar header com ícone (Bike para A, Car para B) e Typography
  - Implementar barra de progresso visual com animação
  - Integrar componente LessonCounter
  - Adicionar badges de marcos (2 aulas mínimo, 10 recomendado)
  - Calcular e exibir porcentagem de progresso
  - Usar componentes do design system (Card, Typography, Badge)
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.5_

- [ ]* 3.1 Escrever testes de propriedade para cálculo de porcentagem
  - **Property 1: Percentage Calculation Accuracy**
  - **Validates: Requirements 1.4, 4.4, 6.5**
  - Testar que porcentagem = (completedLessons / 10) * 100 para qualquer valor

- [ ]* 3.2 Escrever testes de propriedade para feedback de marcos
  - **Property 6: Milestone Visual Feedback**
  - **Validates: Requirements 6.3, 6.4**
  - Testar que badge de mínimo aparece quando >= 2 aulas
  - Testar que badge de recomendado aparece quando >= 10 aulas

- [ ]* 3.3 Escrever testes de propriedade para exibição de recomendado
  - **Property 9: Display of Recommended Lessons**
  - **Validates: Requirements 1.3**
  - Testar que valor recomendado (10) é sempre exibido

- [ ]* 3.4 Escrever testes unitários para CategoryProgressSection
  - Testar renderização de ícone correto (Bike para A, Car para B)
  - Testar exibição de barra de progresso
  - Testar exibição de porcentagem numérica
  - Testar presença de labels descritivos
  - _Requirements: 1.1, 1.5, 6.1, 6.2, 7.5_

- [x] 4. Checkpoint - Validar componentes individuais
  - Executar todos os testes de LessonCounter e CategoryProgressSection
  - Verificar que todos os testes de propriedade passam (mínimo 100 iterações cada)
  - Verificar que componentes seguem design system
  - Perguntar ao usuário se há dúvidas ou ajustes necessários

- [x] 5. Criar componente EnhancedProgressCard
  - Criar arquivo `src/components/display/EnhancedProgressCard.tsx`
  - Implementar gerenciamento de estado (categoryA, categoryB, isEditing, isLoading, error)
  - Implementar useEffect para carregar dados do AsyncStorage na montagem
  - Implementar funções de incremento/decremento com persistência automática
  - Renderizar duas instâncias de CategoryProgressSection (uma para cada categoria)
  - Adicionar tratamento de erro com Alert para falhas de AsyncStorage
  - Usar Card do design system como container
  - _Requirements: 1.1, 1.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 7.1_

- [ ]* 5.1 Escrever testes de propriedade para independência de categorias
  - **Property 2: Category Independence**
  - **Validates: Requirements 3.3, 4.1, 4.3**
  - Testar que atualizar categoria A não afeta categoria B
  - Testar que atualizar categoria B não afeta categoria A

- [ ]* 5.2 Escrever testes de propriedade para atualização imediata
  - **Property 8: Immediate Progress Update**
  - **Validates: Requirements 2.3**
  - Testar que progresso atualiza imediatamente após incremento/decremento

- [ ]* 5.3 Escrever testes unitários para EnhancedProgressCard
  - Testar renderização de ambas as seções de categoria
  - Testar carregamento inicial do AsyncStorage
  - Testar inicialização com 0 quando AsyncStorage vazio
  - Testar exibição de Alert quando AsyncStorage falha
  - Testar que estado de uma categoria não afeta a outra
  - _Requirements: 1.2, 3.4, 3.5, 4.2_

- [x] 6. Atualizar index de exports do display
  - Atualizar `src/components/display/index.ts`
  - Adicionar exports para EnhancedProgressCard, CategoryProgressSection, LessonCounter
  - Manter export de ProgressCard para compatibilidade

- [x] 7. Reorganizar AlunoHomeScreen
  - Abrir `src/screens/client/AlunoHomeScreen.tsx`
  - Substituir ProgressCard antigo por EnhancedProgressCard
  - Remover componentes obsoletos (Card de progresso antigo com aulas/horas)
  - Manter EnhancedLessonCard na posição atual
  - Mover Card do Design System para o final da ScrollView
  - Organizar ordem: Header → EnhancedProgressCard → EnhancedLessonCard → QuickActions → TipCard → AchievementsCard → NextLesson (antigo) → DevelopmentCard
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ]* 7.1 Escrever testes unitários para reorganização da Home
  - Testar que EnhancedProgressCard está presente
  - Testar que EnhancedLessonCard está presente
  - Testar que Design System card é o último elemento
  - Testar que componentes de progresso aparecem antes de outros
  - _Requirements: 5.2, 5.3, 5.5_

- [x] 8. Checkpoint final - Validação completa
  - Executar todos os testes (unitários e de propriedade)
  - Verificar que todos os testes passam
  - Testar manualmente no simulador/dispositivo:
    - Incrementar/decrementar aulas em ambas categorias
    - Verificar que progresso é salvo ao fechar e reabrir app
    - Verificar badges de marcos (2 e 10 aulas)
    - Verificar que categorias são independentes
    - Verificar área de toque dos botões
  - Perguntar ao usuário se há ajustes finais necessários

- [x] 9. Adicionar melhorias de performance (opcional)
  - Adicionar React.memo para CategoryProgressSection
  - Adicionar debounce para escritas no AsyncStorage (evitar sobrecarga em cliques rápidos)
  - Adicionar feedback háptico ao incrementar/decrementar (Haptics.impactAsync)
  - _Requirements: Performance considerations_

- [ ]* 9.1 Escrever testes de performance
  - Testar que múltiplos cliques rápidos não causam múltiplas escritas simultâneas
  - Testar que componentes não re-renderizam desnecessariamente

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam correção universal (mínimo 100 iterações cada)
- Testes unitários validam exemplos específicos e casos de borda
- A implementação é incremental: serviços → componentes básicos → componentes compostos → integração
- Todos os componentes devem usar o design system (Typography, Button, Card, Badge, ícones Lucide)
- Todos os estilos devem usar design tokens de `src/themes/variables.ts`
