# Instructor Backend Gaps

## Objetivo

Registrar campos, contratos e capacidades que seriam úteis para o fluxo do instrutor, mas que hoje não têm cobertura suficiente no backend para sustentar a UI do app.

Regra desta trilha:

- se um campo não tiver integração real no backend, ele não deve permanecer como campo editável na tela
- os itens abaixo não bloqueiam a integração atual
- estes pontos podem virar backlog futuro de backend após a primeira fase de integração

## Perfil do instrutor

### Nome e sobrenome editáveis

Hoje `GET /instrutores/me` retorna `nome` e `sobrenome`, mas `PUT /instrutores/me` não expõe atualização desses campos.

Impacto:

- o instrutor consegue ver seu nome
- o app não consegue oferecer edição de nome e sobrenome no fluxo do perfil do instrutor

### Dados de credencial profissional

Não há cobertura no contrato atual de atualização do instrutor para:

- `detranId`
- número da licença
- vencimento da licença

Impacto:

- a UI não deve prometer edição desses dados
- a conta do instrutor fica sem gestão de credenciais profissionais no app

### Endereço detalhado no retorno do perfil

`PUT /instrutores/me` aceita `endereco`, mas o payload real observado em `GET /instrutores/me` não retornou esse bloco.

Impacto:

- fica difícil preencher a UI com o valor persistido
- o app evita editar algo que não consegue reler com segurança

Sugestão:

- garantir que `GET /instrutores/me` retorne `endereco` completo quando existir

### Foto do instrutor com atualização

O perfil retorna `foto_url`, mas não há rota de update específica ou campo correspondente em `PUT /instrutores/me` para trocar avatar.

Impacto:

- a UI pode exibir a foto
- o app não consegue permitir edição de avatar

## Veículos

### Marca do veículo

Os contratos de veículo atuais não expõem `marca`.

Impacto:

- a UI só consegue trabalhar com `modelo`, `ano`, `placa`, `tipo_cambio` e `aceita_veiculo_aluno`
- qualquer experiência que dependa de “marca/modelo” fica incompleta

### Veículo principal explícito

Existe `ativo`, mas não há contrato explícito de “veículo principal” ou operação dedicada para trocar o principal quando houver múltiplos veículos.

Impacto:

- o app hoje assume o primeiro ativo como referência
- uma UI de múltiplos veículos pode ficar ambígua

Sugestão:

- manter `ativo` com semântica clara de veículo principal ou criar campo/ação mais explícitos

## Disponibilidade

### Contrato de retorno detalhado em OpenAPI

As rotas de disponibilidade seguem com schema de resposta vazio na OpenAPI.

Impacto:

- a integração depende de inspeção manual do payload real
- manutenção e onboarding ficam mais lentos

Sugestão:

- documentar schema completo de resposta para:
  - `GET /instrutores/me/disponibilidades`
  - `POST /instrutores/me/disponibilidades`
  - `PUT /instrutores/me/disponibilidades/{disponibilidade_id}`

### Resumo pronto para a agenda do instrutor

Hoje o backend cobre a disponibilidade, mas não necessariamente entrega um resumo pensado para a UI da agenda semanal.

Impacto:

- o app precisa montar agrupamentos e estados derivados no cliente

Isso não é um problema grave, mas um payload mais orientado à UI pode simplificar a tela no futuro.

## Financeiro

### Schemas de resposta documentados

As rotas abaixo seguem sem schema de resposta útil na OpenAPI:

- `GET /instrutores/me/ganhos/historico`
- `GET /instrutores/me/ganhos/tendencia`
- `GET /instrutores/me/pagamentos/recentes`

Impacto:

- DTOs precisam ser descobertos na prática
- a evolução dos gráficos fica mais sujeita a divergência de contrato

### Resumo financeiro agregado

Hoje parece provável que o app precise derivar valores como:

- ganhos do mês
- total acumulado
- disponível para saque

Sugestão:

- considerar um resumo agregado no backend ou no dashboard autenticado do instrutor

Isso não bloqueia a integração atual, mas evita recálculo repetido no cliente.

### Saque disponível e solicitação de saque

A tela mockada assumia:

- valor disponível para saque
- taxa da plataforma
- ação de solicitar saque
- prazo de processamento

Nenhum desses itens está coberto pelos contratos financeiros validados até agora.

Impacto:

- o app não deve exibir CTA real de saque
- a UI não deve inventar taxa percentual fixa
- mensagens operacionais sobre repasse não devem ser tratadas como verdade sem payload específico

Sugestão:

- expor resumo de repasse com campos explícitos como `saldo_disponivel`, `taxa_plataforma`, `prazo_processamento_dias`
- ou criar rota dedicada de saque/repasse do instrutor

### Tendência de ganhos com contrato explícito

Mesmo existindo `GET /instrutores/me/ganhos/tendencia`, o contrato de resposta ainda não está documentado e não foi validado de forma confiável no backend local durante esta rodada.

Impacto:

- a tela precisa tratar o gráfico de tendência de forma defensiva
- qualquer mudança no payload pode quebrar labels, datas e valores do gráfico sem aviso do OpenAPI

Sugestão:

- documentar um array explícito com `label`, `valor`, `data` e `periodo`
- ou um objeto com `periodo` e `pontos`, desde que estável e descrito na OpenAPI

### Pagamentos recentes sem contexto rico

Os contratos financeiros atuais não deixam claro se cada item de pagamento traz:

- nome do aluno
- descrição do repasse
- data da aula
- data do pagamento
- status padronizado

Impacto:

- a UI precisa cair para descrições genéricas quando algum campo faltar
- fica difícil manter uma lista rica de pagamentos sem inventar informação

Sugestão:

- padronizar itens de pagamento com `id`, `descricao`, `valor`, `data_pagamento`, `status`
- incluir `aluno_nome` quando esse contexto fizer sentido para o instrutor

## Dashboard

### Cards de agenda e solicitações

O dashboard do instrutor mostra blocos como:

- agenda de hoje
- solicitações recentes

Esses dados não pertencem ao núcleo de `/instrutores/me` e dependem mais de `agendamentos`.

Impacto:

- nesta fase o app deve usar estado vazio honesto nesses cards

Sugestão:

- quando entrar a integração de `bookings`, definir payload próprio de dashboard ou composição clara entre domínios

### Contrato consolidado para o dashboard do instrutor

Hoje o app já consegue preencher parcialmente a dashboard com:

- perfil do instrutor
- disponibilidade configurada
- ganhos do mês
- pagamentos pendentes

Mas ainda faltam dados operacionais para a home do instrutor ficar realmente útil no dia a dia.

Sugestão de payload para `GET /dashboard/instrutor`:

- `proxima_aula`
- `aulas_hoje`
- `aulas_semana`
- `aulas_mes`
- `horas_semana`
- `ganhos_mes`
- `pagamentos_pendentes`
- `dias_com_disponibilidade`
- `slots_disponiveis_semana`
- `solicitacoes_recentes`
- `insights`
  - `dia_com_mais_aulas`
  - `horario_mais_ocupado`

Impacto:

- reduz composição manual entre vários domínios
- evita que a dashboard dependa de múltiplas chamadas para renderizar o primeiro estado útil
- permite evoluir analytics operacionais sem retrabalho de UI

## Documentação

### OpenAPI com respostas completas

O principal gap transversal é a falta de schema de resposta em várias rotas de instrutor.

Impacto:

- desacelera a integração
- aumenta o risco de mapper frágil
- dificulta revisão e manutenção

Sugestão:

- priorizar documentação dos responses reais das rotas autenticadas `/instrutores/me`
