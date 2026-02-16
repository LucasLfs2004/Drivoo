# Guia de Integração Figma MCP

Este guia explica como usar a integração do Figma com o Drivoo através do Model Context Protocol (MCP).

## 🎯 O que foi configurado

### 1. Design System Rules
Criamos um documento completo de regras do design system em `.kiro/steering/design-system.md` que:
- Define todos os design tokens (cores, tipografia, espaçamento, etc.)
- Documenta a estrutura de componentes
- Estabelece padrões de código
- Fornece mapeamento Figma → Código

### 2. Hook de Code Connect
Um hook automático foi criado que:
- Monitora mudanças em arquivos de componentes (`src/components/**/*.tsx`, `src/screens/**/*.tsx`)
- Pergunta se você quer conectar o componente ao Figma
- Facilita o mapeamento entre código e design

## 🚀 Como usar

### Passo 1: Obter URL do Figma

1. Abra seu arquivo no Figma
2. Selecione o frame/componente que deseja implementar
3. Copie a URL (formato: `https://figma.com/design/FILE_KEY/FILE_NAME?node-id=NODE_ID`)

Exemplo:
```
https://figma.com/design/abc123/Drivoo-App?node-id=1-2
```

### Passo 2: Gerar código do design

Use um dos seguintes comandos comigo:

#### Obter contexto de design completo
```
Gere o código para este design do Figma: [URL]
```

Isso irá:
- Extrair o design do Figma
- Gerar código React Native
- Fornecer URLs de assets
- Incluir variáveis de design

#### Obter screenshot
```
Mostre um screenshot deste componente do Figma: [URL]
```

#### Obter metadados da estrutura
```
Mostre a estrutura deste frame do Figma: [URL]
```

### Passo 3: Implementar o código

Quando você receber o código gerado:

1. **Identifique componentes reutilizáveis**
   - Verifique se já existe um componente similar em `src/components/`
   - Reutilize componentes existentes quando possível

2. **Converta estilos**
   - Substitua classes Tailwind por StyleSheet
   - Use design tokens de `src/themes/variables.ts`
   
   Exemplo de conversão:
   ```typescript
   // ❌ Código do Figma (Tailwind)
   <View className="bg-blue-500 p-4 rounded-lg">
   
   // ✅ Código adaptado (Design Tokens)
   <View style={styles.container}>
   
   const styles = StyleSheet.create({
     container: {
       backgroundColor: theme.colors.primary[500],
       padding: theme.spacing.md,
       borderRadius: theme.borders.radius.lg,
     },
   });
   ```

3. **Use ícones do Lucide**
   ```typescript
   import { Home, Search, Calendar } from 'lucide-react-native';
   
   <Home color={theme.colors.primary[500]} size={24} />
   ```

4. **Aplique escala responsiva**
   ```typescript
   import { theme } from '@/themes';
   
   const fontSize = theme.scaleUtils.moderateScale(16);
   ```

### Passo 4: Conectar código ao Figma (Code Connect)

Depois de implementar o componente:

1. O hook automático irá perguntar se você quer conectar ao Figma
2. Ou você pode fazer manualmente:

```
Conecte o componente Button em src/components/common/Button.tsx 
ao design do Figma: [URL]
```

Isso cria um mapeamento bidirecional entre código e design.

## 📋 Comandos úteis

### Obter variáveis de design
```
Mostre as variáveis de design deste arquivo Figma: [URL]
```

### Criar diagrama no FigJam
```
Crie um fluxograma no FigJam mostrando o fluxo de agendamento de aulas
```

### Verificar mapeamentos existentes
```
Mostre os mapeamentos de Code Connect para este arquivo: [URL]
```

### Obter sugestões de conexão
```
Sugira como conectar componentes deste design ao código: [URL]
```

## 🎨 Mapeamento de Cores

Quando implementar designs do Figma, use este mapeamento:

| Cor no Figma | Token do Drivoo |
|--------------|-----------------|
| Primary Blue (#0061CC) | `theme.colors.primary[500]` |
| Secondary Blue (#148AD9) | `theme.colors.secondary[500]` |
| Accent Blue (#17C8FD) | `theme.colors.accent[500]` |
| Success Green (#13B57D) | `theme.colors.success[500]` |
| Warning Orange (#FF9800) | `theme.colors.semantic.warning` |
| Error Red (#F44336) | `theme.colors.semantic.error` |
| White | `theme.colors.background.primary` |
| Light Gray | `theme.colors.background.secondary` |
| Dark Text | `theme.colors.text.primary` |
| Medium Text | `theme.colors.text.secondary` |

## 🔧 Troubleshooting

### Erro: "Permission denied"
- Verifique se você está autenticado no Figma
- Use o comando: `Quem está autenticado no Figma?`

### Erro: "Node not found"
- Verifique se o node-id na URL está correto
- Formato correto: `node-id=1-2` (não `node-id=1:2`)

### Código gerado não corresponde ao design
- Peça um screenshot para comparar visualmente
- Ajuste manualmente usando os design tokens
- Valide contra o Figma

## 📚 Exemplos práticos

### Exemplo 1: Implementar tela de busca

```
Gere o código React Native para esta tela de busca do Figma:
https://figma.com/design/abc123/Drivoo?node-id=10-50
```

Depois de receber o código:
1. Identifique componentes: SearchBar, FilterChips, InstructorCard
2. Verifique se já existem em `src/components/`
3. Adapte estilos para usar design tokens
4. Implemente a tela em `src/screens/client/AlunoSearchScreen.tsx`

### Exemplo 2: Criar novo componente

```
Gere o código para este card de instrutor:
https://figma.com/design/abc123/Drivoo?node-id=15-30
```

Depois:
1. Crie `src/components/display/InstructorCard.tsx`
2. Adapte o código usando design tokens
3. Conecte ao Figma via Code Connect
4. Exporte em `src/components/display/index.ts`

### Exemplo 3: Atualizar componente existente

```
Compare o componente Button atual com este design do Figma:
https://figma.com/design/abc123/Drivoo?node-id=5-10
```

Depois:
1. Revise diferenças visuais
2. Atualize estilos mantendo a API do componente
3. Teste em todas as telas que usam o Button
4. Atualize o mapeamento Code Connect

## 🎯 Boas práticas

1. **Sempre use design tokens** - Nunca hardcode cores ou tamanhos
2. **Reutilize componentes** - Verifique antes de criar novos
3. **Mantenha paridade visual** - Compare com screenshots do Figma
4. **Teste responsividade** - Use o sistema de escala
5. **Documente mapeamentos** - Use Code Connect para rastreabilidade
6. **Valide acessibilidade** - Contraste, touch targets, etc.

## 🔗 Recursos adicionais

- [Design System Rules](.kiro/steering/design-system.md)
- [Componentes existentes](../src/components/)
- [Design Tokens](../src/themes/variables.ts)
- [Lucide Icons](https://lucide.dev/icons/)

## 💡 Dicas

- Use `Ctrl/Cmd + K` no Figma para copiar link do node selecionado
- Peça screenshots para validação visual rápida
- Use Code Connect para manter sincronia design-código
- Sempre teste em diferentes tamanhos de tela
- Consulte o design system antes de criar novos componentes
