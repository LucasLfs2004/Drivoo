# Requirements Document: API Integration

## Introduction

Este documento especifica os requisitos para a integração do aplicativo Drivoo com a API backend. A integração estabelecerá a comunicação entre o frontend React Native e o backend, permitindo autenticação de usuários, gerenciamento de sessões e acesso a dados de usuário.

## Glossary

- **API**: Application Programming Interface - Interface de comunicação entre frontend e backend
- **JWT**: JSON Web Token - Padrão de autenticação baseado em tokens
- **Token de Acesso**: Token JWT usado para autenticar requisições à API
- **Token de Refresh**: Token usado para renovar o token de acesso expirado
- **Interceptador**: Middleware que intercepta requisições/respostas HTTP
- **Endpoint**: URL específica da API que fornece um recurso ou ação
- **Payload**: Dados contidos em uma requisição ou resposta
- **Status Code**: Código HTTP que indica o resultado de uma requisição (200, 401, 500, etc)

## Requirements

### Requirement 1: Configuração de Cliente HTTP

**User Story:** Como desenvolvedor, quero ter um cliente HTTP centralizado e reutilizável, para que eu possa fazer requisições à API de forma consistente em toda a aplicação.

#### Acceptance Criteria

1. THE Sistema SHALL fornecer um cliente HTTP baseado em Axios configurado com a URL base da API
2. THE Cliente HTTP SHALL incluir interceptadores para adicionar tokens JWT automaticamente em requisições
3. THE Cliente HTTP SHALL incluir interceptadores para tratar respostas com erro e renovar tokens expirados
4. THE Cliente HTTP SHALL suportar timeouts configuráveis para requisições
5. THE Cliente HTTP SHALL registrar requisições e respostas para debugging

### Requirement 2: Autenticação via Login

**User Story:** Como aluno, quero fazer login com meu email e senha, para que eu possa acessar minha conta e usar o aplicativo.

#### Acceptance Criteria

1. WHEN um usuário submete credenciais de login, THE Sistema SHALL enviar uma requisição POST para o endpoint de login
2. THE Sistema SHALL validar que email e senha são fornecidos antes de enviar a requisição
3. IF o login é bem-sucedido, THE Sistema SHALL armazenar o token JWT retornado de forma segura
4. IF o login falha, THE Sistema SHALL exibir uma mensagem de erro clara ao usuário
5. THE Sistema SHALL suportar login para diferentes tipos de usuário (aluno, instrutor, admin)

### Requirement 3: Gerenciamento de Sessão

**User Story:** Como aluno, quero que minha sessão seja mantida mesmo após fechar o aplicativo, para que eu não precise fazer login novamente.

#### Acceptance Criteria

1. WHEN o aplicativo inicia, THE Sistema SHALL verificar se existe um token JWT armazenado
2. IF um token válido existe, THE Sistema SHALL restaurar a sessão automaticamente
3. IF o token está expirado, THE Sistema SHALL tentar renovar usando o refresh token
4. IF a renovação falha, THE Sistema SHALL redirecionar para a tela de login
5. WHEN um usuário faz logout, THE Sistema SHALL remover todos os tokens armazenados

### Requirement 4: Recuperação de Informações do Usuário

**User Story:** Como aluno, quero que minhas informações de perfil sejam carregadas automaticamente, para que eu veja meus dados atualizados no aplicativo.

#### Acceptance Criteria

1. WHEN um usuário faz login com sucesso, THE Sistema SHALL fazer uma requisição GET para recuperar dados do usuário
2. THE Sistema SHALL armazenar as informações do usuário em estado global (Context API)
3. THE Sistema SHALL exibir as informações do usuário em telas relevantes (perfil, home, etc)
4. IF a requisição de dados do usuário falha, THE Sistema SHALL exibir uma mensagem de erro mas permitir navegação
5. THE Sistema SHALL permitir atualizar dados do usuário através de uma requisição PUT

### Requirement 5: Tratamento de Erros de API

**User Story:** Como usuário, quero receber mensagens de erro claras quando algo dá errado, para que eu entenda o que aconteceu e como resolver.

#### Acceptance Criteria

1. THE Sistema SHALL diferenciar entre erros de rede, erros de servidor e erros de validação
2. WHEN um erro 401 (Unauthorized) ocorre, THE Sistema SHALL redirecionar para login
3. WHEN um erro 403 (Forbidden) ocorre, THE Sistema SHALL exibir mensagem de acesso negado
4. WHEN um erro 500 (Server Error) ocorre, THE Sistema SHALL exibir mensagem genérica e sugerir retry
5. WHEN um erro de rede ocorre, THE Sistema SHALL exibir mensagem de conexão e permitir retry

### Requirement 6: Segurança de Tokens

**User Story:** Como desenvolvedor, quero que os tokens JWT sejam armazenados de forma segura, para que credenciais não sejam expostas.

#### Acceptance Criteria

1. THE Sistema SHALL armazenar tokens em AsyncStorage com chaves criptografadas
2. THE Sistema SHALL nunca armazenar tokens em variáveis globais não-seguras
3. THE Sistema SHALL remover tokens do AsyncStorage ao fazer logout
4. THE Sistema SHALL validar que tokens não estão expirados antes de usar
5. THE Sistema SHALL suportar renovação automática de tokens antes da expiração

### Requirement 7: Configuração de Ambiente

**User Story:** Como desenvolvedor, quero poder configurar diferentes URLs de API para desenvolvimento, teste e produção, para que eu possa trabalhar em diferentes ambientes.

#### Acceptance Criteria

1. THE Sistema SHALL suportar variáveis de ambiente para URL base da API
2. THE Sistema SHALL permitir configuração de timeout, retry e outras opções por ambiente
3. THE Sistema SHALL carregar configurações de um arquivo .env ou similar
4. THE Sistema SHALL validar que configurações obrigatórias estão presentes na inicialização
5. THE Sistema SHALL exibir avisos se configurações críticas estão faltando

