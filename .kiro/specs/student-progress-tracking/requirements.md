# Requirements Document

## Introduction

Este documento especifica os requisitos para a funcionalidade de acompanhamento de progresso de aulas práticas no aplicativo Drivoo. A funcionalidade permitirá que alunos visualizem e gerenciem seu progresso nas aulas práticas de direção para as categorias A (moto) e B (carro), fornecendo uma experiência intuitiva e motivadora durante o processo de obtenção da CNH.

## Glossary

- **Aluno**: Usuário do aplicativo que está tirando a CNH e agenda aulas práticas com instrutores
- **Aula_Prática**: Sessão de direção prática com um instrutor credenciado pelo DETRAN
- **Categoria_A**: Categoria de habilitação para motocicletas
- **Categoria_B**: Categoria de habilitação para automóveis
- **Progresso**: Quantidade de aulas práticas realizadas pelo aluno em uma categoria específica
- **Sistema**: O aplicativo mobile Drivoo
- **Home_Screen**: Tela principal do aluno após login (AlunoHomeScreen)
- **Progress_Card**: Componente visual que exibe o progresso das aulas práticas
- **AsyncStorage**: Sistema de armazenamento local persistente do React Native

## Requirements

### Requirement 1: Visualização de Progresso por Categoria

**User Story:** Como aluno, quero visualizar meu progresso de aulas práticas separado por categoria (A e B), para que eu possa acompanhar meu avanço em cada tipo de habilitação.

#### Acceptance Criteria

1. THE Sistema SHALL exibir o progresso de aulas práticas para Categoria_A e Categoria_B separadamente
2. WHEN um aluno visualiza a Home_Screen, THE Sistema SHALL mostrar o Progress_Card com informações de ambas as categorias
3. THE Sistema SHALL exibir a quantidade de aulas realizadas e a quantidade recomendada (10 aulas) para cada categoria
4. THE Sistema SHALL calcular e exibir a porcentagem de progresso baseada na quantidade de aulas realizadas dividida por 10
5. THE Sistema SHALL exibir informação de que 2 aulas são o mínimo suficiente para tirar a CNH

### Requirement 2: Edição de Aulas Realizadas

**User Story:** Como aluno, quero editar facilmente quantas aulas já realizei, para que eu possa manter meu progresso atualizado sem complicações.

#### Acceptance Criteria

1. WHEN um aluno interage com o Progress_Card, THE Sistema SHALL permitir a edição da quantidade de aulas realizadas
2. THE Sistema SHALL fornecer uma interface intuitiva para incrementar ou decrementar o número de aulas
3. WHEN um aluno edita a quantidade de aulas, THE Sistema SHALL atualizar o progresso imediatamente sem navegação para outras telas
4. THE Sistema SHALL permitir valores de 0 até no mínimo 20 aulas para cada categoria
5. WHEN um aluno edita o número de aulas, THE Sistema SHALL validar que o valor é um número inteiro não-negativo

### Requirement 3: Persistência de Dados

**User Story:** Como aluno, quero que meu progresso de aulas seja salvo automaticamente, para que eu não perca minhas informações ao fechar o aplicativo.

#### Acceptance Criteria

1. WHEN um aluno atualiza a quantidade de aulas realizadas, THE Sistema SHALL persistir os dados no AsyncStorage imediatamente
2. WHEN o aplicativo é reiniciado, THE Sistema SHALL carregar o progresso salvo do AsyncStorage
3. THE Sistema SHALL armazenar o progresso de Categoria_A e Categoria_B separadamente
4. IF o AsyncStorage falhar ao salvar, THEN THE Sistema SHALL exibir uma mensagem de erro ao aluno
5. WHEN não há dados salvos no AsyncStorage, THE Sistema SHALL inicializar o progresso com 0 aulas para ambas as categorias

### Requirement 4: Suporte a Múltiplas Categorias Simultâneas

**User Story:** Como aluno, quero poder acompanhar meu progresso em ambas as categorias A e B ao mesmo tempo, pois posso estar tirando as duas habilitações simultaneamente.

#### Acceptance Criteria

1. THE Sistema SHALL permitir que o aluno tenha progresso independente em Categoria_A e Categoria_B
2. THE Sistema SHALL exibir ambas as categorias no Progress_Card simultaneamente
3. WHEN um aluno edita o progresso de uma categoria, THE Sistema SHALL manter o progresso da outra categoria inalterado
4. THE Sistema SHALL calcular porcentagens de progresso independentes para cada categoria

### Requirement 5: Reorganização da Home Screen

**User Story:** Como aluno, quero uma tela inicial limpa e organizada, para que eu possa focar nas informações mais relevantes do meu aprendizado.

#### Acceptance Criteria

1. THE Sistema SHALL remover componentes obsoletos da Home_Screen que não estão mais sendo utilizados
2. THE Sistema SHALL manter o EnhancedLessonCard e o Progress_Card na Home_Screen
3. THE Sistema SHALL posicionar o card do Design_System como último elemento da Home_Screen
4. THE Sistema SHALL organizar os componentes em ordem de relevância para o aluno
5. WHEN a Home_Screen é renderizada, THE Sistema SHALL exibir primeiro os componentes relacionados ao progresso e aulas

### Requirement 6: Feedback Visual de Progresso

**User Story:** Como aluno, quero ver indicadores visuais claros do meu progresso, para que eu me sinta motivado a continuar praticando.

#### Acceptance Criteria

1. THE Sistema SHALL exibir uma barra de progresso visual para cada categoria
2. THE Sistema SHALL usar cores do design system para indicar diferentes níveis de progresso
3. WHEN o progresso atinge 2 aulas (mínimo), THE Sistema SHALL destacar visualmente que o mínimo foi atingido
4. WHEN o progresso atinge 10 aulas (recomendado), THE Sistema SHALL destacar visualmente que a meta recomendada foi atingida
5. THE Sistema SHALL exibir a porcentagem de progresso em formato numérico junto com a barra visual

### Requirement 7: Acessibilidade e Usabilidade

**User Story:** Como aluno, quero uma interface acessível e fácil de usar, para que eu possa gerenciar meu progresso sem dificuldades.

#### Acceptance Criteria

1. THE Sistema SHALL usar componentes do design system (Typography, Button, Card, Badge) para consistência visual
2. THE Sistema SHALL seguir os design tokens definidos em variables.ts para cores, espaçamento e tipografia
3. THE Sistema SHALL garantir que todos os botões de edição tenham área de toque adequada (mínimo 44x44 pixels)
4. THE Sistema SHALL usar ícones do Lucide React Native para ações de incrementar e decrementar
5. THE Sistema SHALL exibir labels descritivos para todas as ações e informações de progresso
