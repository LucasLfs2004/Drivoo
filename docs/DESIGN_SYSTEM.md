# Design System Drivoo

Sistema de design completo implementado no aplicativo Drivoo, garantindo consistência visual e facilidade de manutenção.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Componentes](#componentes)
- [Design Tokens](#design-tokens)
- [Como Usar](#como-usar)
- [Visualização](#visualização)

## 🎯 Visão Geral

O Design System do Drivoo é baseado em:
- **Design Tokens**: Valores centralizados para cores, tipografia, espaçamento, etc.
- **Componentes Reutilizáveis**: Biblioteca de componentes UI consistentes
- **Escala Responsiva**: Sistema de escala para diferentes tamanhos de tela
- **Acessibilidade**: Componentes com boas práticas de acessibilidade

## 🧩 Componentes

### Componentes Básicos (`src/components/common/`)

#### Typography
Componente para textos com variantes predefinidas.

```typescript
import { Typography } from '@/components/common';

<Typography variant="h1">Título Principal</Typography>
<Typography variant="body" color="secondary">
  Texto do corpo
</Typography>
<Typography variant="caption" weight="bold">
  Legenda em negrito
</Typography>
```

**Props:**
- `variant`: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label'
- `color`: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'error'
- `weight`: 'normal' | 'medium' | 'semibold' | 'bold'
- `align`: 'left' | 'center' | 'right'

#### Button
Botão com múltiplas variantes e tamanhos.

```typescript
import { Button } from '@/components/common';

<Button 
  title="Confirmar" 
  variant="primary" 
  size="md"
  onPress={handlePress}
/>
<Button 
  title="Cancelar" 
  variant="outline" 
  disabled={isLoading}
/>
<Button 
  title="Carregando..." 
  loading={true}
/>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `loading`: boolean

#### Card
Container com elevação e variantes.

```typescript
import { Card } from '@/components/common';

<Card variant="elevated" padding="md">
  <Typography variant="body">Conteúdo do card</Typography>
</Card>
```

**Props:**
- `variant`: 'elevated' | 'outlined' | 'filled'
- `padding`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

#### Badge
Etiquetas para status e categorias.

```typescript
import { Badge } from '@/components/common';

<Badge variant="success">Ativo</Badge>
<Badge variant="warning" size="sm">Pendente</Badge>
<Badge variant="error">Cancelado</Badge>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
- `size`: 'sm' | 'md' | 'lg'

#### Avatar
Componente para exibir avatares de usuários.

```typescript
import { Avatar } from '@/components/common';

<Avatar 
  source={{ uri: 'https://...' }} 
  size="md" 
/>
<Avatar 
  name="João Silva" 
  variant="circle" 
  size="lg" 
/>
<Avatar size="md" /> {/* Ícone padrão */}
```

**Props:**
- `source`: ImageSourcePropType | string
- `name`: string (para iniciais)
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'circle' | 'rounded' | 'square'

#### IconButton
Botão apenas com ícone.

```typescript
import { IconButton } from '@/components/common';
import { Settings } from 'lucide-react-native';

<IconButton 
  icon={Settings} 
  variant="ghost" 
  onPress={handleSettings}
/>
```

**Props:**
- `icon`: LucideIcon (componente de ícone)
- `variant`: 'primary' | 'secondary' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean

#### Divider
Linha divisória horizontal ou vertical.

```typescript
import { Divider } from '@/components/common';

<Divider />
<Divider orientation="vertical" thickness="thick" />
<Divider color="strong" spacing="lg" />
```

**Props:**
- `orientation`: 'horizontal' | 'vertical'
- `thickness`: 'thin' | 'base' | 'thick'
- `color`: 'light' | 'medium' | 'strong'
- `spacing`: keyof spacing tokens

### Componentes de Formulário (`src/components/forms/`)

#### FormInput
Input de texto com label e validação.

```typescript
import { FormInput } from '@/components/forms';

<FormInput
  label="Email"
  placeholder="seu@email.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  required
/>
```

**Props:**
- `label`: string
- `error`: string
- `required`: boolean
- Todas as props de TextInput do React Native

#### FormSelect
Seletor com opções.

```typescript
import { FormSelect } from '@/components/forms';

<FormSelect
  label="Categoria"
  options={[
    { label: 'Opção 1', value: '1' },
    { label: 'Opção 2', value: '2' },
  ]}
  value={selected}
  onChange={setSelected}
/>
```

#### FormDatePicker
Seletor de data.

```typescript
import { FormDatePicker } from '@/components/forms';

<FormDatePicker
  label="Data da Aula"
  value={date}
  onChange={setDate}
/>
```

## 🎨 Design Tokens

### Cores

```typescript
import { theme } from '@/themes';

// Cores principais
theme.colors.primary[500]    // #0061CC - Azul principal
theme.colors.secondary[500]  // #148AD9 - Azul médio
theme.colors.accent[500]     // #17C8FD - Azul claro
theme.colors.success[500]    // #13B57D - Verde

// Cores semânticas
theme.colors.semantic.success  // Verde
theme.colors.semantic.warning  // Amarelo/Laranja
theme.colors.semantic.error    // Vermelho
theme.colors.semantic.info     // Azul médio

// Backgrounds
theme.colors.background.primary    // Branco
theme.colors.background.secondary  // Cinza muito claro
theme.colors.background.tertiary   // Cinza claro

// Textos
theme.colors.text.primary    // Cinza muito escuro
theme.colors.text.secondary  // Cinza escuro
theme.colors.text.tertiary   // Cinza
theme.colors.text.disabled   // Cinza médio
theme.colors.text.inverse    // Branco
theme.colors.text.link       // Azul principal

// Cool Gray (Cinza Azulado) - Paleta baseada em #EBEEF1
theme.colors.coolGray[50]   // #F8F9FA - Quase branco
theme.colors.coolGray[100]  // #F3F5F7 - Muito claro
theme.colors.coolGray[200]  // #EBEEF1 - Base (cor original)
theme.colors.coolGray[300]  // #DDE1E6 - Claro
theme.colors.coolGray[400]  // #C5CBD3 - Médio claro
theme.colors.coolGray[500]  // #A8B0BA - Médio
theme.colors.coolGray[600]  // #8A94A0 - Médio escuro
theme.colors.coolGray[700]  // #6B7580 - Escuro
theme.colors.coolGray[800]  // #4D5660 - Muito escuro
theme.colors.coolGray[900]  // #2F3740 - Quase preto azulado
```

### Tipografia

```typescript
// Tamanhos de fonte
theme.typography.fontSize.xs    // 12px
theme.typography.fontSize.sm    // 14px
theme.typography.fontSize.md    // 16px
theme.typography.fontSize.lg    // 18px
theme.typography.fontSize.xl    // 20px
theme.typography.fontSize['2xl'] // 24px
theme.typography.fontSize['3xl'] // 30px
theme.typography.fontSize['4xl'] // 36px

// Pesos de fonte
theme.typography.fontWeight.normal    // '400'
theme.typography.fontWeight.medium    // '500'
theme.typography.fontWeight.semibold  // '600'
theme.typography.fontWeight.bold      // '700'
```

### Espaçamento

```typescript
theme.spacing.xs   // 4px
theme.spacing.sm   // 8px
theme.spacing.md   // 16px
theme.spacing.lg   // 24px
theme.spacing.xl   // 32px
theme.spacing['2xl'] // 48px
theme.spacing['3xl'] // 64px
```

### Bordas

```typescript
// Raios de borda
theme.borders.radius.none  // 0
theme.borders.radius.sm    // 4px
theme.borders.radius.md    // 8px
theme.borders.radius.lg    // 12px
theme.borders.radius.xl    // 16px
theme.borders.radius.full  // 9999

// Larguras de borda
theme.borders.width.none   // 0
theme.borders.width.thin   // 0.5px
theme.borders.width.base   // 1px
theme.borders.width.thick  // 2px
```

### Sombras

```typescript
theme.shadows.sm  // Sombra pequena (elevation: 1)
theme.shadows.md  // Sombra média (elevation: 3)
theme.shadows.lg  // Sombra grande (elevation: 5)
theme.shadows.xl  // Sombra extra grande (elevation: 8)
```

### Escala Responsiva

```typescript
// Funções de escala
theme.scaleUtils.scale(100)          // Escala horizontal
theme.scaleUtils.verticalScale(50)   // Escala vertical
theme.scaleUtils.moderateScale(16)   // Escala moderada (recomendada)

// Informações do dispositivo
theme.scaleUtils.screenWidth   // Largura da tela
theme.scaleUtils.screenHeight  // Altura da tela
theme.scaleUtils.isTablet      // true se for tablet
```

## 📖 Como Usar

### 1. Importar o tema

```typescript
import { theme } from '@/themes';
```

### 2. Usar em StyleSheet

```typescript
import { StyleSheet } from 'react-native';
import { theme } from '@/themes';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borders.radius.lg,
    ...theme.shadows.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
});
```

### 3. Usar componentes

```typescript
import { Button, Card, Typography } from '@/components/common';

<Card variant="elevated" padding="md">
  <Typography variant="h3">Título</Typography>
  <Typography variant="body" color="secondary">
    Descrição do conteúdo
  </Typography>
  <Button 
    title="Ação" 
    variant="primary" 
    onPress={handleAction}
  />
</Card>
```

## 👀 Visualização

Para visualizar todos os componentes e tokens do design system:

1. Abra o aplicativo
2. Na tela inicial, clique em "Design System"
3. Navegue pelas seções para ver:
   - Tipografia
   - Cores
   - Botões
   - Badges
   - Avatares
   - Cards
   - Espaçamento
   - Bordas

Ou navegue diretamente para:
```
src/screens/shared/DesignSystemScreen.tsx
```

## 🎯 Boas Práticas

### ✅ Fazer

- Sempre usar design tokens ao invés de valores hardcoded
- Reutilizar componentes existentes
- Usar o sistema de escala responsiva
- Seguir a hierarquia de tipografia
- Manter consistência visual

### ❌ Evitar

- Hardcoding de cores: `color: '#0061CC'` ❌
- Hardcoding de tamanhos: `fontSize: 16` ❌
- Criar componentes duplicados
- Ignorar o sistema de escala
- Usar valores arbitrários

### Exemplo Correto

```typescript
// ✅ BOM
const styles = StyleSheet.create({
  text: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    padding: theme.spacing.md,
  },
});

// ❌ RUIM
const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: '#212121',
    padding: 16,
  },
});
```

## 🔧 Extensão

Para adicionar novos componentes ao design system:

1. Crie o componente em `src/components/common/` ou `src/components/forms/`
2. Use os design tokens do tema
3. Exporte no arquivo `index.ts` correspondente
4. Adicione exemplos na `DesignSystemScreen`
5. Documente neste arquivo

## 📚 Recursos

- [Design Tokens](../src/themes/variables.ts)
- [Componentes Comuns](../src/components/common/)
- [Componentes de Formulário](../src/components/forms/)
- [Tela de Visualização](../src/screens/shared/DesignSystemScreen.tsx)
- [Integração Figma](./FIGMA_INTEGRATION.md)
