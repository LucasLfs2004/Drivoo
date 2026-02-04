# Stack Tecnológico

## Framework & Plataforma
- **React Native 0.82.1**: Desenvolvimento mobile multiplataforma
- **TypeScript**: Desenvolvimento JavaScript com tipagem segura
- **Node.js >=20**: Requisito de runtime

## Principais Bibliotecas & Dependências
- **Navegação**: React Navigation v7 (stack, drawer, bottom tabs)
- **Gerenciamento de Estado**: React Hook Form para manipulação de formulários
- **Componentes UI**: Componentes customizados com React Native SVG
- **Pagamentos**: Stripe React Native SDK (com suporte a split payment)
- **Gráficos**: React Native Gifted Charts
- **Animações**: React Native Reanimated v4, Worklets
- **Armazenamento**: AsyncStorage para persistência de dados local
- **Manipulação de Datas**: Day.js para manipulação de datas
- **Ícones**: Lucide React Native

## Sistema de Build & Ferramentas
- **Metro**: Bundler JavaScript para React Native
- **Babel**: Transpilador JavaScript com plugin Worklets
- **ESLint**: Linting de código com configuração React Native
- **Prettier**: Formatação de código (aspas simples, tabs de 2 espaços, vírgulas finais)
- **Jest**: Framework de testes

## Comandos de Desenvolvimento

### Configuração Inicial
```bash
# Instalar dependências
npm install

# Configuração iOS (CocoaPods)
bundle install
bundle exec pod install
```

### Desenvolvimento
```bash
# Iniciar bundler Metro
npm start

# Executar no Android
npm run android

# Executar no iOS  
npm run ios

# Linting
npm run lint

# Testes
npm test
```

### Notas Específicas da Plataforma
- **iOS**: Requer instalação do CocoaPods via Ruby bundler
- **Android**: Usa sistema de build Gradle
- **Design Responsivo**: Utilitários de escala customizados para diferentes tamanhos de tela

## Estilo de Código
- Aspas simples para strings
- Indentação de 2 espaços
- Vírgulas finais
- Arrow functions sem parênteses para parâmetros únicos
- Aspas simples no JSX
- Largura de linha de 80 caracteres