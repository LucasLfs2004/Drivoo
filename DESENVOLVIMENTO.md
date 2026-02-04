# Sistema de Autenticação Temporário - Drivoo

Este documento explica como usar o sistema de autenticação temporário implementado para desenvolvimento, que permite navegar pelas diferentes áreas do aplicativo sem precisar de integração com API.

## 🚀 Acesso Rápido

Na tela de login, você encontrará botões de "Acesso Rápido" que permitem login instantâneo como diferentes tipos de usuário:

- **Entrar como Aluno**: Acessa a área do aluno com navegação por abas
- **Entrar como Instrutor**: Acessa a área do instrutor com navegação por abas  
- **Entrar como Admin**: Acessa a área do administrador com navegação por drawer

## 📧 Credenciais de Teste

Alternativamente, você pode usar o formulário de login tradicional com estas credenciais:

```
Aluno:
Email: aluno@drivoo.com
Senha: 123456

Instrutor:
Email: instrutor@drivoo.com
Senha: 123456

Administrador:
Email: admin@drivoo.com
Senha: 123456
```

## 👤 Usuários Mock

O sistema cria usuários mock com dados realistas:

### Aluno (João Silva)
- Email: aluno@drivoo.com
- Telefone: (11) 99999-1111
- Status CNH: Teoria aprovada
- Localização: Vila Madalena, São Paulo

### Instrutor (Carlos Santos)
- Email: instrutor@drivoo.com
- Telefone: (11) 99999-2222
- DETRAN ID: SP123456789
- Veículo: Volkswagen Gol 2020
- Avaliação: 4.8 estrelas (127 avaliações)
- Valor/hora: R$ 80,00

### Admin (Maria Oliveira)
- Email: admin@drivoo.com
- Telefone: (11) 99999-3333
- Departamento: Operações
- Permissões completas

## 🔧 Funcionalidades Implementadas

### ✅ Login Mock
- Login instantâneo com botões de acesso rápido
- Login tradicional com credenciais específicas
- Simulação de delay de API (800ms - 2s)
- Tratamento de erros

### ✅ Registro Mock
- Funciona com dados reais do formulário
- Cria usuário mock baseado nos dados inseridos
- Suporte a todos os tipos de usuário

### ✅ Navegação por Papel
- **Aluno**: Bottom Tab Navigator (5 abas)
- **Instrutor**: Bottom Tab Navigator (5 abas)
- **Admin**: Drawer Navigator (4 seções)

### ✅ Estado de Autenticação
- Gerenciamento completo de estado
- Logout funcional
- Dados do usuário disponíveis em todas as telas

## 🛠️ Como Funciona

1. **Inicialização**: O app inicia sempre no estado não autenticado
2. **Login**: Escolha entre acesso rápido ou credenciais
3. **Navegação**: Baseada no papel do usuário logado
4. **Dados**: Usuários mock com dados realistas
5. **Logout**: Limpa o estado e volta para login

## 📱 Testando as Áreas

### Área do Aluno
- Home: Saudação personalizada e ações rápidas
- Busca: Para encontrar instrutores
- Agendamentos: Suas aulas marcadas
- Chat: Conversas com instrutores
- Perfil: Dados pessoais e configurações

### Área do Instrutor
- Dashboard: Estatísticas e agenda do dia
- Agenda: Gerenciar disponibilidade
- Ganhos: Histórico financeiro
- Chat: Conversas com alunos
- Perfil: Dados profissionais

### Área do Admin
- Analytics: Métricas da plataforma
- Usuários: Gerenciar alunos
- Instrutores: Gerenciar instrutores
- Configurações: Configurações do sistema

## 🔄 Removendo o Sistema Temporário

Quando a API estiver pronta, você pode:

1. Remover as funções `loginAsAluno`, `loginAsInstrutor`, `loginAsAdmin`
2. Restaurar as chamadas de API nas funções `login`, `register`, `logout`
3. Remover os usuários mock
4. Restaurar a verificação de tokens na `initializeAuth`

## 💡 Dicas

- Use os botões de acesso rápido para testar rapidamente diferentes fluxos
- Todos os dados são temporários e resetam ao reiniciar o app
- O sistema mantém a estrutura completa de tipos TypeScript
- Perfeito para desenvolvimento de UI e navegação

---

**Nota**: Este é um sistema temporário apenas para desenvolvimento. Não deve ser usado em produção.