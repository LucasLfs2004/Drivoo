# Guia de Testes de Autenticação

## Visão Geral

Este diretório contém testes para o sistema de autenticação do Drivoo, incluindo registro de alunos, registro de instrutores e login.

## Arquivos de Teste

### 1. `registerAluno.test.ts`
Testes específicos para registro de alunos:
- ✅ Registro bem-sucedido
- ✅ Validação de email inválido
- ✅ Validação de CPF (11 dígitos)
- ✅ Validação de senha (mínimo 6 caracteres)
- ✅ Validação de telefone
- ✅ Validação de data de nascimento
- ✅ Validação de campos obrigatórios

### 2. `registerInstrutor.test.ts`
Testes específicos para registro de instrutores:
- ✅ Registro bem-sucedido
- ✅ Validação de CNH obrigatória
- ✅ Validação de categorias da CNH
- ✅ Validação de valor/hora > 0
- ✅ Validação de endereço obrigatório
- ✅ Validação de veículo obrigatório
- ✅ Validação de número da CNH

### 3. `login.test.ts`
Testes para login:
- ✅ Login bem-sucedido
- ✅ Falha com credenciais inválidas
- ✅ Validação de email obrigatório
- ✅ Validação de senha obrigatória
- ✅ Validação de formato de email
- ✅ Tratamento de erro de rede
- ✅ Tratamento de erro de servidor
- ✅ Tratamento de timeout
- ✅ Login com diferentes tipos de usuário

### 4. `integration.test.ts`
Testes de integração:
- ✅ Fluxo completo: registro de aluno → login → autenticação
- ✅ Fluxo completo: registro de instrutor → login → autenticação
- ✅ Validação de email inválido
- ✅ Validação de senha fraca
- ✅ Validação de CPF inválido
- ✅ Erro 400 - Email já cadastrado
- ✅ Erro 500 - Erro interno do servidor

## Como Executar os Testes

### Executar todos os testes de autenticação:
```bash
npm test -- --testPathPattern="auth"
```

### Executar testes específicos:
```bash
# Testes de registro de aluno
npm test -- registerAluno.test.ts

# Testes de registro de instrutor
npm test -- registerInstrutor.test.ts

# Testes de login
npm test -- login.test.ts

# Testes de integração
npm test -- integration.test.ts
```

### Executar com coverage:
```bash
npm test -- --coverage --testPathPattern="auth"
```

## Estrutura dos Testes

### Mock de Fetch
Todos os testes usam mock do `fetch` para simular respostas da API:

```typescript
global.fetch = jest.fn().mockResolvedValueOnce({
  ok: true,
  json: async () => ({
    access_token: 'mock-jwt-token',
    refresh_token: 'mock-refresh-token',
    user: { /* dados do usuário */ }
  }),
  status: 200
});
```

### Validações Testadas

#### Registro de Aluno
- **Email**: Formato válido, obrigatório
- **Senha**: Mínimo 6 caracteres, obrigatória
- **CPF**: 11 dígitos, obrigatório
- **Telefone**: Formato válido, obrigatório
- **Data de Nascimento**: Formato válido, obrigatória
- **Campos obrigatórios**: Todos os campos marcados como obrigatórios

#### Registro de Instrutor
- **CNH**: Número válido (5-20 caracteres), obrigatória
- **Categorias CNH**: Array não vazio, obrigatório
- **Valor/hora**: > 0, obrigatório
- **Endereço**: Objeto obrigatório
- **Veículo**: Objeto obrigatório
- **Experiência**: >= 0 (opcional)

#### Login
- **Credenciais**: Email e senha obrigatórios
- **Formato**: Email válido
- **Erros**: Tratamento de 401, 500, timeout, rede

## Cenários de Teste

### Cenários Positivos
1. Registro de aluno com dados válidos
2. Registro de instrutor com dados válidos
3. Login com credenciais válidas
4. Fluxo completo de registro + login

### Cenários Negativos
1. Registro com email inválido
2. Registro com senha muito curta
3. Registro com CPF inválido
4. Registro com CNH inválida
5. Login com credenciais inválidas
6. Erros de rede e servidor

### Cenários de Validação
1. Campos obrigatórios
2. Formatos específicos (email, CPF, telefone)
3. Valores mínimos/máximos
4. Tipos de dados

## Dados de Teste

### Aluno de Teste
```typescript
{
  email: 'aluno@teste.com',
  senha: 'senha123456',
  nome: 'João',
  sobrenome: 'Silva',
  cpf: '12345678901',
  telefone: '11999999999',
  data_nascimento: '1990-01-01',
  cep: '01234-567',
  cidade: 'São Paulo',
  estado: 'SP'
}
```

### Instrutor de Teste
```typescript
{
  email: 'instrutor@teste.com',
  senha: 'senha123456',
  nome: 'Carlos',
  sobrenome: 'Santos',
  cpf: '98765432101',
  telefone: '11988888888',
  data_nascimento: '1985-03-20',
  genero: 'M',
  cnh_numero: 'CNH123456789',
  cnh_categorias: ['A', 'B'],
  cnh_vencimento: '2030-12-31',
  experiencia_anos: 5,
  valor_hora: 80.00,
  bio: 'Instrutor experiente',
  tags: ['paciente', 'experiente'],
  endereco: {
    rua: 'Rua das Flores',
    numero: '123',
    bairro: 'Vila Madalena',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '05435000',
    pais: 'BR'
  },
  veiculo: {
    marca: 'Volkswagen',
    modelo: 'Gol',
    ano: 2020,
    placa: 'ABC-1234',
    tipo_cambio: 'MANUAL'
  }
}
```

## Configuração do Jest

Os testes usam a seguinte configuração:

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@testing-library)/)'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/index.{ts,tsx}'
  ]
};
```

## Dependências de Teste

```json
{
  "@testing-library/jest-native": "^5.4.3",
  "@testing-library/react-native": "^12.3.0",
  "jest": "^29.7.0",
  "jest-fetch-mock": "^3.0.3",
  "react-test-renderer": "18.2.0"
}
```

## Troubleshooting

### Problema: Mock do fetch não funciona
**Solução**: Certifique-se de que o mock está configurado antes dos testes:
```typescript
beforeEach(() => {
  global.fetch = jest.fn();
});
```

### Problema: Erro de timeout
**Solução**: Aumente o timeout no Jest:
```javascript
// jest.config.js
testTimeout: 10000 // 10 segundos
```

### Problema: Erro de import
**Solução**: Verifique os caminhos de importação:
```typescript
// Correto
import { authService } from '../../services/auth/authService';

// Errado
import { authService } from '@/services/auth/authService'; // Pode não funcionar em testes
```

## Próximos Passos

1. **Testes de UI**: Adicionar testes de interface para RegisterScreen e LoginScreen
2. **Testes de integração com backend**: Testar com API real (ambiente de staging)
3. **Testes de performance**: Medir tempo de resposta das APIs
4. **Testes de segurança**: Testar vulnerabilidades comuns
5. **Testes de acessibilidade**: Verificar compatibilidade com leitores de tela

## Referências

- [Documentação do Jest](https://jestjs.io/docs/getting-started)
- [Testing Library para React Native](https://testing-library.com/docs/react-native-testing-library/intro/)
- [Mock de Fetch no Jest](https://jestjs.io/docs/mock-functions#mocking-modules)
- [Padrões de Teste para React Native](https://reactnative.dev/docs/testing-overview)