# Exemplos Práticos de Integração Figma

Este documento contém exemplos reais de como usar a integração Figma MCP no Drivoo.

## 📱 Exemplo 1: Implementar Card de Instrutor

### Cenário
Você tem um design no Figma de um card que mostra informações do instrutor.

### Passo a passo

#### 1. Obter o design do Figma
```
Gere o código para este card de instrutor:
https://figma.com/design/abc123/Drivoo?node-id=25-100
```

#### 2. Código gerado (exemplo)
```typescript
// Código do Figma (com Tailwind)
export const InstructorCard = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center gap-3">
        <img src="avatar.png" className="w-12 h-12 rounded-full" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">João Silva</h3>
          <p className="text-sm text-gray-600">5 anos de experiência</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-blue-600 font-medium">R$ 80/aula</span>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
          Ver perfil
        </button>
      </div>
    </div>
  );
};
```

#### 3. Adaptar para React Native + Design Tokens
```typescript
// src/components/display/InstructorCard.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/themes';
import { Button } from '@/components/common';

interface InstructorCardProps {
  name: string;
  experience: string;
  pricePerClass: number;
  avatarUrl: string;
  onPress: () => void;
}

export const InstructorCard: React.FC<InstructorCardProps> = ({
  name,
  experience,
  pricePerClass,
  avatarUrl,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.experience}>{experience}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.price}>
          R$ {pricePerClass.toFixed(2)}/aula
        </Text>
        <Button 
          variant="primary" 
          size="sm" 
          onPress={onPress}
        >
          Ver perfil
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.lg,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatar: {
    width: theme.scaleUtils.moderateScale(48),
    height: theme.scaleUtils.moderateScale(48),
    borderRadius: theme.borders.radius.full,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  experience: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  price: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[500],
  },
});
```

#### 4. Conectar ao Figma
```
Conecte o componente InstructorCard em src/components/display/InstructorCard.tsx
ao design: https://figma.com/design/abc123/Drivoo?node-id=25-100
```

---

## 🔍 Exemplo 2: Implementar Barra de Busca

### Cenário
Criar uma barra de busca com filtros baseada no design do Figma.

### Passo a passo

#### 1. Obter design e screenshot
```
Mostre o screenshot e gere o código para esta barra de busca:
https://figma.com/design/abc123/Drivoo?node-id=30-150
```

#### 2. Implementação adaptada
```typescript
// src/components/forms/SearchBar.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { theme } from '@/themes';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterPress: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar instrutores...',
  onSearch,
  onFilterPress,
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Search 
          color={theme.colors.text.tertiary} 
          size={20} 
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={onFilterPress}
        activeOpacity={0.7}
      >
        <SlidersHorizontal 
          color={theme.colors.primary[500]} 
          size={20} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    padding: 0,
  },
  filterButton: {
    width: theme.scaleUtils.moderateScale(44),
    height: theme.scaleUtils.moderateScale(44),
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

---

## 📊 Exemplo 3: Implementar Dashboard com Gráficos

### Cenário
Criar cards de estatísticas e gráficos para o dashboard do instrutor.

### Passo a passo

#### 1. Obter estrutura do design
```
Mostre a estrutura e metadados deste dashboard:
https://figma.com/design/abc123/Drivoo?node-id=40-200
```

#### 2. Implementar StatCard
```typescript
// src/components/display/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { theme } from '@/themes';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.iconContainer}>
          <Icon 
            color={theme.colors.primary[500]} 
            size={20} 
          />
        </View>
      </View>
      
      <Text style={styles.value}>{value}</Text>
      
      {trend && (
        <Text style={[
          styles.trend,
          trend.isPositive ? styles.trendPositive : styles.trendNegative,
        ]}>
          {trend.isPositive ? '+' : ''}{trend.value}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.lg,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  iconContainer: {
    width: theme.scaleUtils.moderateScale(36),
    height: theme.scaleUtils.moderateScale(36),
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borders.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  trend: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  trendPositive: {
    color: theme.colors.success[500],
  },
  trendNegative: {
    color: theme.colors.semantic.error,
  },
});
```

#### 3. Usar no Dashboard
```typescript
// src/screens/instructor/InstrutorDashboardScreen.tsx
import { StatCard } from '@/components/display/StatCard';
import { Calendar, DollarSign, Users } from 'lucide-react-native';

<View style={styles.statsGrid}>
  <StatCard
    title="Aulas este mês"
    value={24}
    icon={Calendar}
    trend={{ value: 12, isPositive: true }}
  />
  <StatCard
    title="Ganhos"
    value="R$ 1.920"
    icon={DollarSign}
    trend={{ value: 8, isPositive: true }}
  />
  <StatCard
    title="Alunos ativos"
    value={15}
    icon={Users}
  />
</View>
```

---

## 🎨 Exemplo 4: Extrair Variáveis de Design

### Cenário
Você quer garantir que as cores do Figma correspondem aos tokens do projeto.

### Comando
```
Mostre as variáveis de design deste arquivo:
https://figma.com/design/abc123/Drivoo?node-id=0-1
```

### Resultado esperado
```json
{
  "colors/primary/500": "#0061CC",
  "colors/secondary/500": "#148AD9",
  "colors/accent/500": "#17C8FD",
  "spacing/md": "16px",
  "radius/lg": "12px"
}
```

### Validação
Compare com `src/themes/variables.ts` e atualize se necessário.

---

## 🔄 Exemplo 5: Atualizar Componente Existente

### Cenário
O design do botão foi atualizado no Figma e você precisa sincronizar.

### Passo a passo

#### 1. Comparar versões
```
Compare o componente Button atual com este novo design:
https://figma.com/design/abc123/Drivoo?node-id=50-300

O componente atual está em: src/components/common/Button.tsx
```

#### 2. Revisar diferenças
Analise as mudanças sugeridas:
- Novos tamanhos de padding
- Mudanças de border radius
- Novos estados (loading, disabled)

#### 3. Atualizar código
```typescript
// Adicionar novo estado de loading
interface ButtonProps {
  // ... props existentes
  loading?: boolean;
}

// Atualizar estilos
const styles = StyleSheet.create({
  primary: {
    // Novo padding do Figma
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.lg,
    // Novo border radius
    borderRadius: theme.borders.radius.xl,
  },
  // ... outros estilos
});
```

#### 4. Atualizar mapeamento
```
Atualize o Code Connect do Button para o novo design:
https://figma.com/design/abc123/Drivoo?node-id=50-300
```

---

## 🎯 Exemplo 6: Criar Fluxo no FigJam

### Cenário
Documentar o fluxo de agendamento de aulas.

### Comando
```
Crie um fluxograma no FigJam mostrando o fluxo de agendamento:
1. Aluno busca instrutor
2. Seleciona horário disponível
3. Confirma dados
4. Realiza pagamento
5. Recebe confirmação
```

### Resultado
Você receberá um link para o diagrama criado no FigJam que pode compartilhar com o time.

---

## 💡 Dicas de Produtividade

### 1. Batch Processing
Processe múltiplos componentes de uma vez:
```
Gere código para estes 3 componentes:
1. Card de instrutor: [URL1]
2. Barra de busca: [URL2]
3. Filtros: [URL3]
```

### 2. Validação Visual Rápida
```
Mostre screenshots lado a lado:
- Design Figma: [URL]
- Componente implementado: src/components/display/InstructorCard.tsx
```

### 3. Auditoria de Design System
```
Verifique se todos os componentes em src/components/common/ 
estão conectados ao Figma e liste os que faltam
```

### 4. Documentação Automática
```
Gere documentação dos componentes conectados ao Figma
incluindo props, exemplos de uso e links para o design
```

---

## 🚨 Problemas Comuns e Soluções

### Problema: Cores não correspondem
**Solução**: Extraia variáveis do Figma e compare com `src/themes/variables.ts`

### Problema: Espaçamento diferente
**Solução**: Use o sistema de escala responsiva:
```typescript
padding: theme.scaleUtils.moderateScale(16)
```

### Problema: Ícones diferentes
**Solução**: Verifique se o ícone existe no Lucide. Se não, use SVG customizado.

### Problema: Componente muito complexo
**Solução**: Quebre em subcomponentes menores e implemente separadamente.

---

## 📚 Recursos

- [Guia de Integração](./FIGMA_INTEGRATION.md)
- [Design System Rules](../.kiro/steering/design-system.md)
- [Componentes](../src/components/)
- [Design Tokens](../src/themes/variables.ts)
