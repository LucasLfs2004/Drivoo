# Guia de Registro - Funções Separadas por Tipo de Usuário

## Visão Geral

O sistema de registro foi implementado com **funções separadas** para alunos e instrutores, refletindo as duas rotas distintas da API:
- `/auth/registro/aluno` - Para registro de alunos
- `/auth/registro/instrutor` - Para registro de instrutores

## Arquitetura

### Estrutura de Funções

```
authService
├── registerAluno()      # Registro específico para alunos
├── registerInstrutor()  # Registro específico para instrutores
└── register()           # Função genérica que delega
```

### Por que Funções Separadas?

1. **Estruturas de Dados Diferentes**
   - Alunos: Dados básicos + preferências de instrutor
   - Instrutores: CNH, veículo, endereço, disponibilidade, preços

2. **Validações Específicas**
   - Alunos: Validação de CPF, telefone, data de nascimento
   - Instrutores: Validação de CNH, categorias, valor/hora, endereço

3. **Rotas API Diferentes**
   - Cada tipo tem seu próprio endpoint
   - Respostas podem ter estruturas diferentes

4. **Manutenibilidade**
   - Código mais limpo e organizado
   - Fácil adicionar validações específicas
   - Melhor para testes unitários

## Uso

### Registro de Aluno

```typescript
import { authService } from '@/services/auth/authService';

const response = await authService.registerAluno({
  email: 'aluno@example.com',
  senha: 'senha123',
  nome: 'João',
  sobrenome: 'Silva',
  cpf: '12345678901',
  telefone: '(11) 99999-1111',
  data_nascimento: '1995-05-15',
  cep: '05435000',
  cidade: 'São Paulo',
  estado: 'SP',
  veiculo: {
    modelo: 'Gol',
    ano: 2020,
    placa: 'ABC-1234',
    tipo_cambio: 'MANUAL'
  }
});

// response.token - JWT token
// response.usuario - Dados do usuário criado
```

### Registro de Instrutor

```typescript
import { authService } from '@/services/auth/authService';

const response = await authService.registerInstrutor({
  email: 'instrutor@example.com',
  senha: 'senha123',
  nome: 'Carlos',
  sobrenome: 'Santos',
  cpf: '98765432101',
  telefone: '(11) 98888-2222',
  data_nascimento: '1985-03-20',
  genero: 'M',
  cnh_numero: 'CNH123456789',
  cnh_categorias: ['A', 'B'],
  cnh_vencimento: '2026-12-31',
  experiencia_anos: 5,
  valor_hora: 80.00,
  bio: 'Instrutor experiente com 5 anos de experiência',
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
});

// response.token - JWT token
// response.usuario - Dados do usuário criado
// response.instrutor - Dados específicos do instrutor (opcional)
```

### Função Genérica (Delegação)

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { register } = useAuth();

// A função genérica detecta o tipo e chama a função apropriada
await register({
  email: 'user@example.com',
  password: 'senha123',
  userType: 'aluno', // ou 'instrutor'
  // ... dados específicos do tipo
});
```

## Validações

### Validações Comuns (Ambos)

- ✅ Email válido (formato)
- ✅ Senha mínimo 6 caracteres
- ✅ CPF 11 dígitos
- ✅ Telefone 10-20 caracteres
- ✅ Campos obrigatórios preenchidos

### Validações de Aluno

- ✅ Data de nascimento válida
- ✅ CEP, cidade, estado (opcionais)
- ✅ Dados do veículo (opcionais)

### Validações de Instrutor

- ✅ CNH número 5-20 caracteres
- ✅ Categorias CNH (mínimo 1)
- ✅ Data de vencimento CNH válida
- ✅ Valor/hora > 0
- ✅ Endereço obrigatório
- ✅ Veículo obrigatório
- ✅ Experiência >= 0

## Tratamento de Erros

Todos os erros são mapeados para mensagens amigáveis:

```typescript
try {
  await authService.registerAluno(data);
} catch (error) {
  // Mensagens de erro amigáveis:
  // - "Email inválido"
  // - "Senha deve ter no mínimo 6 caracteres"
  // - "CPF deve conter 11 dígitos"
  // - "Este email já está cadastrado"
  // - "Erro de conexão. Verifique sua internet"
  // - "Erro no servidor. Tente novamente mais tarde"
}
```

## Integração com AuthContext

O `AuthContext` foi atualizado para usar as novas funções:

```typescript
const { register } = useAuth();

// Detecta o tipo de usuário e chama a função apropriada
await register(registerData);
```

## Fluxo Completo

```
1. Usuário preenche formulário de registro
   ↓
2. RegisterScreen chama useAuth().register()
   ↓
3. AuthContext.register() detecta o tipo (aluno/instrutor)
   ↓
4. Chama authService.registerAluno() ou registerInstrutor()
   ↓
5. Função específica valida os dados
   ↓
6. Faz POST para /auth/registro/aluno ou /auth/registro/instrutor
   ↓
7. API retorna token e dados do usuário
   ↓
8. Token armazenado em SecureStorage
   ↓
9. AuthContext atualizado com usuário
   ↓
10. Navegação redireciona para home apropriada
```

## Tipos TypeScript

### RegistroAlunoRequest

```typescript
{
  email: string;
  senha: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  data_nascimento: string; // YYYY-MM-DD
  cep?: string;
  cidade?: string;
  estado?: string;
  veiculo?: {
    modelo: string;
    ano: number;
    placa: string;
    tipo_cambio: 'MANUAL' | 'AUTOMATICO';
  };
}
```

### RegistroInstrutorRequest

```typescript
{
  email: string;
  senha: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  data_nascimento: string; // YYYY-MM-DD
  genero?: 'M' | 'F' | 'Outro';
  cnh_numero: string;
  cnh_categorias: string[]; // ['A', 'B']
  cnh_vencimento: string; // YYYY-MM-DD
  experiencia_anos?: number;
  valor_hora: number;
  bio?: string;
  tags?: string[];
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    pais?: string;
  };
  veiculo: {
    marca: string;
    modelo: string;
    ano: number;
    placa: string;
    tipo_cambio: 'MANUAL' | 'AUTOMATICO';
  };
}
```

### RegistroResponse

```typescript
{
  token: string;
  usuario: {
    id: string;
    email: string;
    nome: string;
    papel: 'aluno' | 'instrutor';
    // ... outros dados
  };
  instrutor?: {
    id: string;
    valor_hora: number;
    // ... dados específicos do instrutor
  };
}
```

## Testes

### Teste de Registro de Aluno

```typescript
test('should register aluno successfully', async () => {
  const response = await authService.registerAluno({
    email: 'test@example.com',
    senha: 'senha123',
    nome: 'João',
    sobrenome: 'Silva',
    cpf: '12345678901',
    telefone: '(11) 99999-1111',
    data_nascimento: '1995-05-15'
  });

  expect(response.token).toBeDefined();
  expect(response.usuario.email).toBe('test@example.com');
  expect(response.usuario.papel).toBe('aluno');
});
```

### Teste de Registro de Instrutor

```typescript
test('should register instrutor successfully', async () => {
  const response = await authService.registerInstrutor({
    email: 'instrutor@example.com',
    senha: 'senha123',
    nome: 'Carlos',
    sobrenome: 'Santos',
    cpf: '98765432101',
    telefone: '(11) 98888-2222',
    data_nascimento: '1985-03-20',
    cnh_numero: 'CNH123456789',
    cnh_categorias: ['A', 'B'],
    cnh_vencimento: '2026-12-31',
    valor_hora: 80.00,
    endereco: { /* ... */ },
    veiculo: { /* ... */ }
  });

  expect(response.token).toBeDefined();
  expect(response.usuario.papel).toBe('instrutor');
  expect(response.instrutor?.valor_hora).toBe(80.00);
});
```

## Próximos Passos

1. **Atualizar RegisterScreen** para usar as novas funções
2. **Adicionar testes unitários** para validações
3. **Integrar com backend** quando API estiver pronta
4. **Adicionar upload de documentos** para instrutores (CNH, documento do veículo)
5. **Implementar geocoding** para endereço do instrutor

## Referências

- API Swagger: `/auth/registro/aluno` e `/auth/registro/instrutor`
- AuthService: `src/services/auth/authService.ts`
- AuthContext: `src/contexts/AuthContext.tsx`
- Types: `src/types/auth/index.ts`
