# Estrutura do Projeto

## Nível Raiz
- `App.tsx`: Ponto de entrada principal da aplicação com providers (Stripe, Navigation, SafeArea)
- `index.js`: Registro da aplicação React Native
- Pastas específicas da plataforma: `android/`, `ios/`
- Arquivos de configuração: `package.json`, `tsconfig.json`, `.eslintrc.js`, etc.

## Organização do Código Fonte (`src/`)

### Diretórios Principais
```
src/
├── assets/          # Recursos estáticos (imagens, SVGs)
├── components/      # Componentes UI reutilizáveis
├── mock/           # Dados mock para desenvolvimento
├── routes/         # Configuração de navegação
├── screens/        # Componentes de tela organizados por tipo de usuário
├── services/       # Integrações de API e serviços externos
├── themes/         # Sistema de design (cores, fontes, espaçamento)
├── types/          # Definições de tipos TypeScript
└── utils/          # Funções utilitárias e helpers
```

## Estrutura Detalhada

### Assets (`src/assets/`)
- Imagens: Arquivos PNG para logos e avatares de usuário
- Ícones SVG com arquivo index TypeScript para exports

### Components (`src/components/`)
- **Organizados por funcionalidade**: `calendar/`, `graphics/`, `header/`
- **Componentes reutilizáveis**: Cards, listas, logos
- **Convenção de nomenclatura**: camelCase para arquivos, PascalCase para componentes

### Screens (`src/screens/`)
- **Separação por tipo de usuário**: `admin/`, `client/`, `auth/`
- **Subpastas baseadas em funcionalidade**: `home/`, `classes/`, `profile/`, etc.
- **Utilitários compartilhados**: `utils.ts`, `dataAuth.ts`

### Types (`src/types/`)
- **Específicos do domínio**: `auth/`, `Class/`, `style/`
- **Arquivos de interface**: Sufixo `.interface.ts`
- **Nomenclatura consistente**: PascalCase para interfaces

### Themes (`src/themes/`)
- **Design tokens**: `variables.ts` com cores, fontes, espaçamento
- **Escala responsiva**: Integração com utilitários de escala
- **Nomenclatura consistente**: Nomes semânticos de cores (primary, secondary, etc.)

### Utils (`src/utils/`)
- **Sistema de escala**: Utilitários de design responsivo para diferentes tamanhos de tela
- **Detecção de dispositivo**: Detecção de tablet vs mobile
- **Helpers reutilizáveis**: Utilitários multiplataforma

## Convenções de Nomenclatura
- **Arquivos**: camelCase (ex: `classCard.tsx`, `dataAuth.ts`)
- **Componentes**: PascalCase (ex: `ClassCard`, `HeaderAdmin`)
- **Interfaces**: PascalCase com nomes descritivos (ex: `Login`)
- **Diretórios**: camelCase para funcionalidades, minúsculas para pastas genéricas

## Padrões de Arquitetura
- **Organização baseada em funcionalidade**: Agrupar arquivos relacionados por funcionalidade
- **Separação de responsabilidades**: Distinção clara entre UI, dados e lógica de negócio
- **Design responsivo**: Sistema de escala centralizado para compatibilidade entre dispositivos
- **Segurança de tipos**: Interfaces TypeScript abrangentes para todas as estruturas de dados

## Contexto Específico do Drivoo
- **Domínio de autoescola**: Estruturas de dados para instrutores, alunos, aulas de direção
- **Sistema de pagamentos**: Integração com split payment do Stripe
- **Geolocalização**: Suporte para busca de instrutores próximos
- **Chat**: Sistema de comunicação entre instrutores e alunos