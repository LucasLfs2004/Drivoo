# Sistema de Design Drivoo

## Paleta de Cores

### Cores Principais
- **Azul Principal**: `#0061CC` - Cor primária do Drivoo, usada para CTAs principais e elementos de destaque
- **Azul Médio**: `#148AD9` - Cor secundária, usada para elementos de apoio e navegação
- **Azul Claro**: `#17C8FD` - Cor de acento, usada para highlights e elementos interativos
- **Verde**: `#13B57D` - Cor de sucesso, usada para confirmações e estados positivos
- **Amarelo**: `#FF9800` - Cor de aviso, mantida para alertas e notificações

### Paleta Neutra (Dark/Light Mode Ready)
A paleta neutra foi expandida para facilitar a futura implementação de dark/light mode:

- `neutral[0]`: `#FFFFFF` - Branco puro
- `neutral[50]`: `#FAFAFA` - Cinza muito claro
- `neutral[100]`: `#F5F5F5` - Cinza claro
- `neutral[200]`: `#EEEEEE` - Cinza claro médio
- `neutral[300]`: `#E0E0E0` - Cinza médio claro
- `neutral[400]`: `#BDBDBD` - Cinza médio
- `neutral[500]`: `#9E9E9E` - Cinza
- `neutral[600]`: `#757575` - Cinza escuro médio
- `neutral[700]`: `#616161` - Cinza escuro
- `neutral[800]`: `#424242` - Cinza muito escuro
- `neutral[900]`: `#212121` - Quase preto
- `neutral[950]`: `#0A0A0A` - Preto

### Cores Semânticas
- **Sucesso**: `#13B57D` (Verde)
- **Aviso**: `#FF9800` (Amarelo)
- **Erro**: `#F44336` (Vermelho padrão)
- **Info**: `#148AD9` (Azul médio)

### Backgrounds
- **Primary**: `#FFFFFF` - Fundo principal
- **Secondary**: `#FAFAFA` - Fundo secundário
- **Tertiary**: `#F5F5F5` - Fundo terciário
- **Elevated**: `#FFFFFF` - Fundo para cards e modais
- **Overlay**: `rgba(0, 0, 0, 0.5)` - Overlay para modais

### Textos
- **Primary**: `#212121` - Texto principal
- **Secondary**: `#616161` - Texto secundário
- **Tertiary**: `#9E9E9E` - Texto terciário
- **Disabled**: `#BDBDBD` - Texto desabilitado
- **Inverse**: `#FFFFFF` - Texto inverso (sobre fundos escuros)
- **Link**: `#0061CC` - Links (azul principal)

### Bordas
- **Light**: `#F5F5F5` - Borda clara
- **Medium**: `#E0E0E0` - Borda média
- **Strong**: `#BDBDBD` - Borda forte

## Uso dos Tokens

### Importação
```typescript
import { theme } from '../themes';
```

### Exemplos de Uso
```typescript
// Cores
backgroundColor: theme.colors.primary[500]
color: theme.colors.text.primary
borderColor: theme.colors.border.medium

// Tipografia
fontSize: theme.typography.fontSize.md
fontWeight: theme.typography.fontWeight.semibold

// Espaçamento
padding: theme.spacing.md
margin: theme.spacing.lg

// Bordas
borderRadius: theme.borders.radius.md
borderWidth: theme.borders.width.base

// Sombras
...theme.shadows.md
```

## Preparação para Dark Mode

O sistema foi projetado com uma paleta neutra expandida para facilitar a futura implementação de dark/light mode. As cores principais permanecerão as mesmas, mas os backgrounds e textos poderão ser facilmente invertidos usando a paleta neutra.

### Estratégia para Dark Mode
1. **Backgrounds**: Inverter a escala neutra (neutral[900] → primary, neutral[800] → secondary)
2. **Textos**: Usar neutral[0] para texto primário, neutral[300] para secundário
3. **Bordas**: Usar tons mais claros da paleta neutra
4. **Cores principais**: Manter as mesmas, mas ajustar opacidade se necessário

## Testes de Propriedade

O sistema inclui testes de propriedade que garantem:
- Estrutura consistente dos tokens
- Valores válidos para todas as categorias
- Compatibilidade com componentes existentes

Execute os testes com:
```bash
npm test -- --testPathPattern=designTokens.property.test.ts
```