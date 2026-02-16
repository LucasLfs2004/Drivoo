---
inclusion: always
---

# Drivoo Design System Rules

Este documento define as regras e padrões do design system do Drivoo para integração com Figma via MCP.

## 1. Design Tokens

### Localização
Todos os design tokens estão definidos em `src/themes/variables.ts`.

### Estrutura de Cores

```typescript
// Paleta principal baseada na identidade visual do Drivoo
colors.primary[500]    // #0061CC - Azul principal
colors.secondary[500]  // #148AD9 - Azul médio
colors.accent[500]     // #17C8FD - Azul claro
colors.success[500]    // #13B57D - Verde

// Cores semânticas
colors.semantic.success  // #13B57D
colors.semantic.warning  // #FF9800
colors.semantic.error    // #F44336
colors.semantic.info     // #148AD9

// Backgrounds
colors.background.primary    // #FFFFFF
colors.background.secondary  // #FAFAFA
colors.background.tertiary   // #F5F5F5

// Textos
colors.text.primary     // #212121
colors.text.secondary   // #616161
colors.text.tertiary    // #9E9E9E
colors.text.disabled    // #BDBDBD
colors.text.inverse     // #FFFFFF
colors.text.link        // #0061CC

// Bordas
colors.border.light    // #F5F5F5
colors.border.medium   // #E0E0E0
colors.border.strong   // #BDBDBD

// Cool Gray (Cinza Azulado) - Paleta baseada em #EBEEF1
colors.coolGray[50]   // #F8F9FA - Quase branco
colors.coolGray[100]  // #F3F5F7 - Muito claro
colors.coolGray[200]  // #EBEEF1 - Base (cor original)
colors.coolGray[300]  // #DDE1E6 - Claro
colors.coolGray[400]  // #C5CBD3 - Médio claro
colors.coolGray[500]  // #A8B0BA - Médio
colors.coolGray[600]  // #8A94A0 - Médio escuro
colors.coolGray[700]  // #6B7580 - Escuro
colors.coolGray[800]  // #4D5660 - Muito escuro
colors.coolGray[900]  // #2F3740 - Quase preto azulado
```

### Tipografia

```typescript
// Tamanhos de fonte (com escala responsiva)
typography.fontSize.xs    // 12px
typography.fontSize.sm    // 14px
typography.fontSize.md    // 16px
typography.fontSize.lg    // 18px
typography.fontSize.xl    // 20px
typography.fontSize['2xl'] // 24px
typography.fontSize['3xl'] // 30px
typography.fontSize['4xl'] // 36px

// Pesos de fonte
typography.fontWeight.normal    // '400'
typography.fontWeight.medium    // '500'
typography.fontWeight.semibold  // '600'
typography.fontWeight.bold      // '700'

// Família de fontes
typography.fontFamily.regular  // 'System'
typography.fontFamily.medium   // 'System'
typography.fontFamily.bold     // 'System'
```

### Espaçamento

```typescript
spacing.xs   // 4px
spacing.sm   // 8px
spacing.md   // 16px
spacing.lg   // 24px
spacing.xl   // 32px
spacing['2xl'] // 48px
spacing['3xl'] // 64px
```

### Bordas e Raios

```typescript
borders.radius.none  // 0
borders.radius.sm    // 4px
borders.radius.md    // 8px
borders.radius.lg    // 12px
borders.radius.xl    // 16px
borders.radius.full  // 9999

borders.width.none   // 0
borders.width.thin   // 0.5px
borders.width.base   // 1px
borders.width.thick  // 2px
```

### Sombras

```typescript
shadows.sm  // Sombra pequena (elevation: 1)
shadows.md  // Sombra média (elevation: 3)
shadows.lg  // Sombra grande (elevation: 5)
shadows.xl  // Sombra extra grande (elevation: 8)
```

## 2. Biblioteca de Componentes

### Estrutura
```
src/components/
├── common/          # Componentes básicos (Button, Card, Typography, Avatar, Badge, etc.)
├── display/         # Componentes de exibição (Cards, Markers)
├── forms/           # Componentes de formulário (Inputs, Selects, Pickers)
├── navigation/      # Componentes de navegação (HeaderBar, TabBar)
├── class/           # Componentes específicos de aulas
└── examples/        # Exemplos e showcases
```

### Componentes Principais

#### Typography (`src/components/common/Typography.tsx`)
```typescript
import { Typography } from '@/components/common';

<Typography variant="h1">Título Principal</Typography>
<Typography variant="body" color="secondary">Texto do corpo</Typography>
<Typography variant="caption" weight="bold">Legenda</Typography>

// Variantes: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label'
// Cores: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'error'
// Pesos: 'normal' | 'medium' | 'semibold' | 'bold'
```

#### Button (`src/components/common/Button.tsx`)
```typescript
import { Button } from '@/components/common';

<Button 
  title="Confirmar"
  variant="primary" | "secondary" | "outline" | "ghost" | "destructive"
  size="sm" | "md" | "lg"
  disabled={false}
  loading={false}
  onPress={handlePress}
/>
```

#### Card (`src/components/common/Card.tsx`)
```typescript
import { Card } from '@/components/common';

<Card 
  variant="elevated" | "outlined" | "filled"
  padding="xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
>
  {children}
</Card>
```

#### Badge (`src/components/common/Badge.tsx`)
```typescript
import { Badge } from '@/components/common';

<Badge variant="primary" | "secondary" | "success" | "warning" | "error" | "neutral">
  Status
</Badge>
<Badge size="sm" | "md" | "lg">Texto</Badge>
```

#### Avatar (`src/components/common/Avatar.tsx`)
```typescript
import { Avatar } from '@/components/common';

<Avatar 
  source={{ uri: 'https://...' }} 
  name="João Silva"
  size="xs" | "sm" | "md" | "lg" | "xl"
  variant="circle" | "rounded" | "square"
/>
```

#### IconButton (`src/components/common/IconButton.tsx`)
```typescript
import { IconButton } from '@/components/common';
import { Settings } from 'lucide-react-native';

<IconButton 
  icon={Settings}
  variant="primary" | "secondary" | "ghost" | "outline"
  size="sm" | "md" | "lg"
  onPress={handlePress}
/>
```

#### Divider (`src/components/common/Divider.tsx`)
```typescript
import { Divider } from '@/components/common';

<Divider 
  orientation="horizontal" | "vertical"
  thickness="thin" | "base" | "thick"
  color="light" | "medium" | "strong"
  spacing="xs" | "sm" | "md" | "lg" | "xl"
/>
```

#### FormInput (`src/components/forms/FormInput.tsx`)
```typescript
import { FormInput } from '@/components/forms';

<FormInput
  label="Label"
  placeholder="Placeholder"
  error="Mensagem de erro"
  required={true}
  value={value}
  onChangeText={setValue}
/>
```

## 3. Frameworks & Bibliotecas

### Stack Principal
- **Framework**: React Native 0.83.1
- **Linguagem**: TypeScript 5.8.3
- **Navegação**: React Navigation v7
- **Ícones**: Lucide React Native
- **Animações**: React Native Reanimated v4
- **Formulários**: React Hook Form
- **Gráficos**: React Native Gifted Charts

### Styling
- **Abordagem**: StyleSheet nativo do React Native
- **Design Tokens**: Sistema centralizado em `src/themes/`
- **Escala Responsiva**: Funções `scale`, `verticalScale`, `moderateScale`

```typescript
import { theme } from '@/themes';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borders.radius.md,
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
```

## 4. Sistema de Ícones

### Biblioteca
**Lucide React Native** - Ícones modernos e consistentes

### Uso
```typescript
import { Home, Search, Calendar, User } from 'lucide-react-native';

<Home 
  color={theme.colors.primary[500]} 
  size={24} 
/>
```

### Ícones Comuns no App
- `Home` - Tela inicial
- `Search` - Busca
- `Calendar` - Agendamentos/Aulas
- `MessageCircle` - Chat
- `User` - Perfil
- `LayoutDashboard` - Dashboard
- `DollarSign` - Ganhos/Pagamentos

## 5. Gestão de Assets

### Estrutura
```
src/assets/
├── images/     # Imagens PNG (logos, avatares)
└── icons/      # Ícones SVG customizados
```

### Importação
```typescript
// Imagens
import logo from '@/assets/images/logo.png';

// Ícones SVG
import { CustomIcon } from '@/assets/icons';
```

## 6. Padrões de Responsividade

### Sistema de Escala
```typescript
import { theme } from '@/themes';

// Escala horizontal
const width = theme.scaleUtils.scale(100);

// Escala vertical
const height = theme.scaleUtils.verticalScale(50);

// Escala moderada (recomendada para fontes e espaçamentos)
const fontSize = theme.scaleUtils.moderateScale(16);

// Detecção de tablet
if (theme.scaleUtils.isTablet) {
  // Layout para tablet
}
```

### Breakpoints
```typescript
const isTablet = theme.scaleUtils.screenWidth >= 768;
const isSmallDevice = theme.scaleUtils.screenWidth < 375;
```

## 7. Estrutura do Projeto

### Organização
```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes reutilizáveis
├── contexts/        # Contextos React
├── hooks/           # Custom hooks
├── mock/            # Dados mock
├── navigation/      # Configuração de navegação
├── screens/         # Telas organizadas por tipo de usuário
│   ├── auth/        # Autenticação
│   ├── client/      # Telas de alunos
│   ├── instructor/  # Telas de instrutores
│   └── shared/      # Telas compartilhadas
├── services/        # APIs e serviços
├── themes/          # Design tokens
├── types/           # Tipos TypeScript
└── utils/           # Utilitários
```

### Convenções de Nomenclatura
- **Arquivos**: camelCase (`classCard.tsx`, `authApi.ts`)
- **Componentes**: PascalCase (`Button`, `FormInput`)
- **Interfaces/Types**: PascalCase (`User`, `Booking`)
- **Funções**: camelCase (`handlePress`, `formatDate`)

## 8. Integração Figma → Código

### Mapeamento de Estilos

Quando receber código do Figma (geralmente com Tailwind):

#### ❌ NÃO usar:
```typescript
// Tailwind classes
className="bg-blue-500 text-white p-4 rounded-lg"
```

#### ✅ USAR:
```typescript
// Design tokens do projeto
style={{
  backgroundColor: theme.colors.primary[500],
  color: theme.colors.text.inverse,
  padding: theme.spacing.md,
  borderRadius: theme.borders.radius.lg,
}}
```

### Mapeamento de Cores Figma → Tokens

| Figma | Token do Projeto |
|-------|------------------|
| Primary Blue | `theme.colors.primary[500]` |
| Secondary Blue | `theme.colors.secondary[500]` |
| Accent Blue | `theme.colors.accent[500]` |
| Success Green | `theme.colors.success[500]` |
| White | `theme.colors.background.primary` |
| Light Gray | `theme.colors.background.secondary` |
| Dark Text | `theme.colors.text.primary` |
| Medium Text | `theme.colors.text.secondary` |

### Componentes Reutilizáveis

Sempre verificar se existe um componente equivalente antes de criar novo:

- **Tipografia** → Use `<Typography>` de `@/components/common`
- **Botões** → Use `<Button>` de `@/components/common`
- **Botões com Ícone** → Use `<IconButton>` de `@/components/common`
- **Cards** → Use `<Card>` de `@/components/common`
- **Badges/Etiquetas** → Use `<Badge>` de `@/components/common`
- **Avatares** → Use `<Avatar>` de `@/components/common`
- **Divisores** → Use `<Divider>` de `@/components/common`
- **Inputs** → Use `<FormInput>` de `@/components/forms`
- **Selects** → Use `<FormSelect>` de `@/components/forms`
- **Date Pickers** → Use `<FormDatePicker>` de `@/components/forms`

### Workflow de Integração

1. **Receber design do Figma** via MCP
2. **Identificar componentes** existentes que podem ser reutilizados
3. **Mapear estilos** do Figma para tokens do projeto
4. **Substituir Tailwind** por StyleSheet + design tokens
5. **Validar visualmente** contra o screenshot do Figma
6. **Testar responsividade** em diferentes tamanhos de tela

## 9. Padrões de Código

### Imports
```typescript
// React e React Native
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Bibliotecas externas
import { useNavigation } from '@react-navigation/native';
import { Home } from 'lucide-react-native';

// Imports internos (usar alias @/)
import { theme } from '@/themes';
import { Button } from '@/components/common';
import type { User } from '@/types/auth';
```

### Estilo de Código
- Aspas simples para strings
- Indentação de 2 espaços
- Vírgulas finais
- Arrow functions sem parênteses para parâmetros únicos
- Largura de linha de 80 caracteres

### Exemplo Completo
```typescript
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { theme } from '@/themes';
import { Card, Typography, Badge, Avatar, IconButton, Divider } from '@/components/common';

interface BookingCardProps {
  instructorName: string;
  instructorAvatar: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  onPress: () => void;
  onCancel: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  instructorName,
  instructorAvatar,
  date,
  time,
  status,
  onPress,
  onCancel,
}) => {
  const statusVariant = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'error',
  }[status] as 'success' | 'warning' | 'error';

  const statusLabel = {
    confirmed: 'Confirmada',
    pending: 'Pendente',
    cancelled: 'Cancelada',
  }[status];

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Card variant="elevated" padding="md">
        <View style={styles.header}>
          <View style={styles.instructorInfo}>
            <Avatar 
              source={{ uri: instructorAvatar }} 
              name={instructorName}
              size="md" 
            />
            <View style={styles.nameContainer}>
              <Typography variant="body" weight="semibold">
                {instructorName}
              </Typography>
              <Badge variant={statusVariant} size="sm">
                {statusLabel}
              </Badge>
            </View>
          </View>
          <IconButton 
            icon={Calendar} 
            variant="ghost" 
            onPress={onCancel}
          />
        </View>
        
        <Divider spacing="sm" />
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Typography variant="caption" color="secondary">
              Data
            </Typography>
            <Typography variant="body" weight="medium">
              {date}
            </Typography>
          </View>
          <View style={styles.detailRow}>
            <Typography variant="caption" color="secondary">
              Horário
            </Typography>
            <Typography variant="body" weight="medium">
              {time}
            </Typography>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  nameContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  details: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
```

## 10. Checklist de Integração Figma

Ao integrar um design do Figma:

- [ ] Verificar componentes reutilizáveis existentes (Typography, Button, Card, Badge, Avatar, IconButton, Divider)
- [ ] Mapear cores do Figma para tokens do projeto
- [ ] Substituir Tailwind por StyleSheet + tokens
- [ ] Usar ícones do Lucide React Native
- [ ] Aplicar sistema de escala responsiva
- [ ] Seguir convenções de nomenclatura
- [ ] Adicionar tipos TypeScript
- [ ] Usar componentes de tipografia ao invés de Text direto
- [ ] Usar componentes de layout (Card, Divider) para estrutura
- [ ] Validar visualmente contra Figma
- [ ] Testar em diferentes tamanhos de tela
- [ ] Verificar acessibilidade (contraste, touch targets)

## 11. Visualização do Design System

Para visualizar todos os componentes implementados:

**No aplicativo:**
1. Abra o app
2. Na tela inicial (Home), clique no botão "Design System"
3. Navegue pelas seções para ver exemplos de:
   - Typography (h1-h4, body, caption, label)
   - Cores (paleta completa)
   - Botões (variantes, tamanhos, estados)
   - Icon Buttons (variantes e tamanhos)
   - Badges (variantes e tamanhos)
   - Avatares (com iniciais, variantes, tamanhos)
   - Cards (variantes)
   - Espaçamento (escala completa)
   - Border Radius (escala completa)

**No código:**
- Tela: `src/screens/shared/DesignSystemScreen.tsx`
- Componentes: `src/components/common/`
- Tokens: `src/themes/variables.ts`

## 12. Componentes Disponíveis - Referência Rápida

### Componentes Comuns
- `Typography` - Textos com variantes semânticas
- `Button` - Botões com ações
- `IconButton` - Botões apenas com ícone
- `Card` - Containers com elevação
- `Badge` - Etiquetas de status
- `Avatar` - Avatares de usuário
- `Divider` - Linhas divisórias
- `Container` - Container base

### Componentes de Formulário
- `FormInput` - Input de texto com label
- `FormSelect` - Seletor com opções
- `FormDatePicker` - Seletor de data
- `FormImagePicker` - Seletor de imagem

### Componentes de Display
- `BookingCard` - Card de agendamento
- `InstructorCard` - Card de instrutor
- `ChatBubble` - Bolha de chat
- `PaymentSplitBreakdown` - Detalhamento de pagamento
- `InstructorMapMarker` - Marcador no mapa

### Componentes de Navegação
- `HeaderBar` - Barra de cabeçalho
- `TabBar` - Barra de tabs

Todos os componentes seguem os design tokens e são responsivos!
