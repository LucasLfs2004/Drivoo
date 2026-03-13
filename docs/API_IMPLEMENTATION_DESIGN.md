# Drivoo API Implementation Design

## Princípios

- trocar a fonte de dados sem redesenhar a navegação agora
- preservar a linguagem visual atual
- mover a complexidade para `services` e `queries`, não para as telas
- manter componentes de apresentação desacoplados do contrato cru da API

## Arquitetura Proposta

### Camadas

- `services/`: chamadas HTTP e mapeamento de contrato
- `services/queries/`: hooks de `react-query`
- `screens/`: composição de estado, loading, erro e interação
- `types/`: tipos de domínio do app

### Padrão por recurso

Cada recurso principal deve seguir este padrão:

1. service da API
2. mapper de resposta
3. query ou mutation
4. tela consumindo o hook

## Fluxos por Tela

### Busca de Instrutores

Origem:

- `GET /instrutores/buscar`

Design técnico:

- criar `instructorSearchService`
- mapear resposta da API para `InstrutorDisponivel`
- criar `useInstructorSearchQuery`
- manter `MapView` e `FlatList` consumindo o mesmo array

UX:

- loading inicial com skeleton ou spinner
- empty state quando `total = 0`
- erro com retry
- filtros ativos exibidos visualmente

### Detalhe do Instrutor

Origem:

- `GET /instrutores/{instrutor_id}`
- `GET /instrutores/{instrutor_id}/horarios-disponiveis`

Design técnico:

- criar `instructorService.getById`
- criar `instructorService.getAvailableSlots`
- separar query de detalhe e query de horários

UX:

- carregar perfil primeiro
- recarregar horários sempre que a data mudar
- desabilitar CTA de agendamento até data e slot válidos

### Agendamentos do Aluno

Origem:

- `POST /agendamentos/validar`
- `POST /agendamentos`
- `GET /agendamentos/meus`
- `PUT /agendamentos/{agendamento_id}/status`

Design técnico:

- criar `bookingService`
- criar `useMyBookingsQuery`
- criar `useCreateBookingMutation`
- invalidar `['my-bookings']`, `['current-user-home']` e horários do instrutor ao concluir mutation

UX:

- confirmar disponibilidade antes de abrir confirmação final
- mostrar status normalizados do agendamento
- permitir pull-to-refresh na lista

### Home do Aluno

Origem:

- `GET /agendamentos/meus`

Design técnico:

- derivar da resposta:
  - próxima aula
  - total de aulas
  - horas realizadas
- manter cards de dica e conquista em modo local até existir backend

UX:

- substituir só o card de “Próxima Aula” e indicadores principais
- não misturar dado real com texto mock enganoso

### Perfil e Configurações

Origem:

- `GET /auth/me`
- `PUT /usuarios/{usuario_id}`
- `GET /usuarios/{usuario_id}/configuracoes`
- `PUT /usuarios/{usuario_id}/configuracoes`

Design técnico:

- manter `AuthContext` como fonte do usuário atual
- criar `userSettingsService`
- separar `current-user` de `user-settings`

UX:

- perfil com refresh manual
- formulário com valores iniciais vindos do contexto/query
- feedback de sucesso e erro em atualização

### Área do Instrutor

Origem:

- `GET/POST/PUT/DELETE /instrutores/{instrutor_id}/disponibilidades`
- `GET/POST/PUT /instrutores/{instrutor_id}/veiculos`
- `GET /instrutores/{instrutor_id}/ganhos/historico`
- `GET /instrutores/{instrutor_id}/ganhos/tendencia`
- `GET /instrutores/{instrutor_id}/pagamentos/recentes`

Design técnico:

- tratar disponibilidade, veículo e finanças como módulos separados
- evitar acoplar o perfil do instrutor ao payload de ganhos

## Mapeamentos Necessários

### Busca

- contrato da API para `InstrutorDisponivel`
- normalização de transmissão, distância, avaliação e localização

### Agendamento

- status do backend para status exibido no app
- datas ISO para `Date`
- payload de detalhe do agendamento para cards e telas de confirmação

### Usuário

- `UsuarioResponse` para `Usuario`
- `UsuarioUpdate` para payload mínimo editável

## Decisões de Design

- usar `react-query` em vez de `useEffect` manual para dados persistentes
- manter mocks apenas quando não houver rota equivalente
- centralizar adaptação de shape em mapeadores, não nos componentes
- priorizar contratos estáveis do aluno antes de expandir o instrutor

## Riscos

- as respostas de algumas rotas no OpenAPI estão genéricas (`schema: {}`)
- a API pode ter shapes reais mais ricos do que o swagger indica
- busca e detalhe do instrutor provavelmente exigirão inspeção de payload real para mapeamento fino
- parte da home depende de regras de negócio ainda não explícitas

## Mitigação

- testar cada rota com payload real antes de substituir o mock
- criar mapeadores tolerantes a campos opcionais
- implementar integração por fases, tela a tela
