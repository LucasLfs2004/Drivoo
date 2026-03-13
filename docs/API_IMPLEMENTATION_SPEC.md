# Drivoo API Implementation Spec

## Objetivo

Substituir os fluxos baseados em mock do aplicativo Drivoo pelos dados reais já disponíveis na API, priorizando o fluxo principal do aluno:

- descoberta de instrutores
- visualização de detalhes do instrutor
- consulta de horários disponíveis
- criação e gestão de agendamentos
- consumo de perfil e configurações do usuário

O foco desta trilha é aumentar o valor do produto sem depender de novas rotas de backend.

## Escopo

### Em escopo

- autenticação e restauração de sessão com dados reais do usuário
- busca de instrutores por localização e filtros
- detalhe de instrutor
- consulta de horários disponíveis por data
- criação de agendamento
- listagem de agendamentos do usuário logado
- atualização de perfil básico do usuário
- leitura e atualização de configurações do usuário
- áreas do instrutor com disponibilidade, veículo e ganhos, quando a navegação já existir

### Fora de escopo

- chat em tempo real
- notificações push transacionais da API
- gamificação real
- progresso pedagógico detalhado de CNH
- pagamento Stripe ponta a ponta
- matching avançado ou recomendação

## Rotas Relevantes

### Autenticação

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`

### Instrutores

- `GET /instrutores/buscar`
- `GET /instrutores/{instrutor_id}`
- `PUT /instrutores/{instrutor_id}`
- `GET /instrutores/{instrutor_id}/horarios-disponiveis`
- `GET /instrutores/{instrutor_id}/disponibilidades`
- `POST /instrutores/{instrutor_id}/disponibilidades`
- `PUT /instrutores/{instrutor_id}/disponibilidades/{disponibilidade_id}`
- `DELETE /instrutores/{instrutor_id}/disponibilidades/{disponibilidade_id}`
- `GET /instrutores/{instrutor_id}/veiculos`
- `POST /instrutores/{instrutor_id}/veiculos`
- `PUT /instrutores/{instrutor_id}/veiculos/{veiculo_id}`

### Agendamentos

- `POST /agendamentos/validar`
- `POST /agendamentos`
- `GET /agendamentos/meus`
- `GET /agendamentos/{agendamento_id}`
- `PUT /agendamentos/{agendamento_id}/status`
- `POST /agendamentos/{agendamento_id}/avaliar`

### Usuário

- `PUT /usuarios/{usuario_id}`
- `GET /usuarios/{usuario_id}/configuracoes`
- `PUT /usuarios/{usuario_id}/configuracoes`
- `POST /usuarios/suporte/tickets`

### Instrutor financeiro

- `GET /instrutores/{instrutor_id}/ganhos/historico`
- `GET /instrutores/{instrutor_id}/ganhos/tendencia`
- `GET /instrutores/{instrutor_id}/pagamentos/recentes`

## Estratégia de Implementação

### Fase 1

Integrar a busca de instrutores e substituir o catálogo mock do aluno por resultados reais.

### Fase 2

Integrar o detalhe do instrutor e os horários disponíveis por data.

### Fase 3

Integrar criação de agendamento, validação prévia e listagem de agendamentos do aluno.

### Fase 4

Completar perfil e configurações do usuário logado.

### Fase 5

Enriquecer a home do aluno com dados reais derivados de agendamentos.

### Fase 6

Substituir áreas do instrutor que hoje são mock por disponibilidade, veículo e ganhos reais.

## Requisitos Funcionais

### Busca

- o app deve buscar instrutores usando localização atual do aluno
- o app deve enviar filtros compatíveis com o backend
- o app deve suportar paginação e refresh
- o app deve renderizar lista e mapa com a mesma fonte de dados

### Detalhe do instrutor

- o app deve exibir dados básicos do instrutor, preço, veículo e disponibilidade
- o app deve carregar horários disponíveis para a data selecionada

### Agendamento

- o app deve validar disponibilidade antes de confirmar o booking
- o app deve criar um agendamento real
- o aluno deve conseguir ver seus agendamentos
- o aluno deve conseguir atualizar status quando suportado pelo fluxo de negócio

### Perfil

- o app deve carregar o usuário logado ao iniciar
- o app deve atualizar nome, sobrenome, telefone e dados básicos de endereço
- o app deve permitir leitura e atualização de configurações do usuário

## Requisitos Não Funcionais

- manter `react-query` como camada principal de cache e invalidação
- isolar mapeamento API -> tipos do app em services próprios
- preservar fallback visual com loading, empty state e error state
- reduzir dependência de mocks a cada fase concluída
- evitar quebrar a UX atual antes de cada tela ter contrato estável

## Critérios de Aceite

- nenhuma das telas priorizadas depende de `mock` para seu dado principal
- os erros de rede e estados vazios são tratados visualmente
- a sessão do usuário é restaurada com `/auth/me`
- a busca, o detalhe e os agendamentos funcionam com a API local
- a implementação fica organizada em serviços, queries e mapeadores reutilizáveis
