# Drivoo: Briefing Rápido para Design

## 1. Visão Geral

O **Drivoo** é um aplicativo mobile em **React Native** para conectar **alunos** a **instrutores de direção**, permitindo busca de instrutores, visualização de perfil, agendamento de aula e pagamento. O app também possui uma área específica para **instrutores** gerenciarem agenda, ganhos e perfil, além de uma área **admin** ainda mais inicial.

Hoje, o produto está funcionalmente dividido em 3 perfis:

- **Aluno**: busca instrutores, agenda aulas, acompanha progresso e gerencia perfil.
- **Instrutor**: gerencia disponibilidade, ganhos, perfil profissional e solicitações.
- **Admin**: visualiza métricas e áreas operacionais da plataforma.

## 2. Objetivo deste material

Este documento existe para dar a um designer contexto suficiente para:

- entender a proposta do produto;
- identificar as principais jornadas;
- saber quais telas existem hoje;
- perceber o nível de maturidade de cada fluxo;
- propor melhorias visuais, de hierarquia e experiência.

## 3. Estrutura do Produto

### Fluxo de autenticação

Antes do acesso principal, o usuário passa por:

- **Login**
- **Cadastro**
- **Recuperação de senha**

Após autenticação, o app direciona automaticamente o usuário conforme o papel:

- aluno -> navegação por abas
- instrutor -> navegação por abas
- admin -> navegação por drawer lateral

## 4. Jornada do Aluno

É a jornada mais completa do app neste momento.

### Abas principais

- **Início**
- **Buscar**
- **Aulas**
- **Chat**
- **Perfil**

### Telas e função de cada uma

#### 4.1 Início

Tela de dashboard do aluno. Reúne:

- saudação e contexto rápido;
- card de progresso;
- próxima aula em destaque;
- ações rápidas;
- dicas;
- conquistas;
- links internos para componentes/design system.

Observação:
é uma tela com bastante potencial para trabalhar hierarquia, modularidade e senso de evolução do aluno.

#### 4.2 Buscar Instrutores

Tela central da proposta do produto. Possui:

- campo de busca por nome ou especialidade;
- filtros;
- alternância entre **lista** e **mapa**;
- contagem de resultados;
- acesso ao detalhe do instrutor.

Essa tela é uma das mais importantes para design, porque mistura:

- descoberta;
- comparação;
- geolocalização;
- filtros;
- decisão de contratação.

#### 4.3 Detalhe do Instrutor

Exibe:

- avatar/iniciais;
- nome;
- avaliação;
- distância;
- preço por hora;
- veículo;
- especialidades;
- seleção de data;
- seleção de horário;
- CTA para agendar aula.

É uma tela crítica para conversão. Hoje ela já concentra informação suficiente, mas pode evoluir muito em clareza, confiança, escaneabilidade e destaque do CTA principal.

#### 4.4 Confirmação do Agendamento

Resume:

- instrutor;
- data e horário;
- duração;
- local;
- resumo financeiro;
- aceite de termos;
- CTA para seguir ao pagamento.

Boa candidata para revisão de:

- hierarquia de resumo;
- legibilidade de preço;
- sensação de segurança/confiança.

#### 4.5 Pagamento

Contém:

- resumo da aula;
- breakdown do valor;
- formulário de pagamento;
- mensagens de erro;
- estado de processamento.

É uma tela sensível e importante. Precisa transmitir segurança, simplicidade e baixa fricção.

#### 4.6 Aulas

Área para visualizar agendamentos do aluno. Hoje está mais simples e funciona quase como estado inicial/empty state.

Possui:

- título;
- alternância visual entre próximas, concluídas e canceladas;
- empty state;
- CTA para buscar instrutores.

#### 4.7 Chat

Atualmente é uma tela inicial de conversas, ainda simples, com foco em empty state.

#### 4.8 Perfil do Aluno

Contém:

- avatar;
- nome/email;
- estatísticas rápidas;
- atalhos para editar perfil, configurações, aulas, pagamentos e suporte;
- logout.

É uma tela mais utilitária, com espaço para melhorar organização, modularidade e percepção de conta pessoal.

## 5. Jornada do Instrutor

A área do instrutor está mais orientada a gestão operacional.

### Abas principais

- **Dashboard**
- **Agenda**
- **Ganhos**
- **Chat**
- **Perfil**

### Telas e função de cada uma

#### 5.1 Dashboard

Mostra:

- saudação;
- cards de estatísticas;
- agenda do dia;
- ações rápidas;
- solicitações recentes.

Hoje tem uma base funcional, mas ainda parece bastante estrutural. Há espaço para dar mais valor visual e sensação de painel profissional.

#### 5.2 Agenda

Tela importante para o instrutor. Permite:

- visualizar disponibilidade semanal;
- editar horários;
- ver dias disponíveis;
- salvar alterações.

Essa área tende a se beneficiar de um tratamento visual mais robusto para calendário, slots, status e feedback de salvamento.

#### 5.3 Ganhos

É uma das telas mais maduras visualmente no fluxo do instrutor, com:

- resumo financeiro;
- totais pagos e pendentes;
- gráfico de barras;
- gráfico de linha;
- lista de pagamentos recentes.

Aqui o design pode evoluir para um dashboard mais confiável, executivo e fácil de escanear.

#### 5.4 Perfil do Instrutor

Reúne:

- dados profissionais;
- categorias;
- experiência;
- valor por hora;
- bio;
- especialidades;
- veículo;
- ações de edição/configuração/suporte/logout.

É uma tela com cara de painel de credencial profissional, então pode ganhar mais sofisticação e melhor agrupamento de informações.

## 6. Jornada Admin

Existe, mas ainda está mais inicial.

### Áreas atuais

- **Analytics**
- **Usuários**
- **Instrutores**
- **Configurações**

O painel admin hoje tem caráter mais de placeholder funcional do que produto final. Um designer deve tratar essa área como base conceitual, não como linguagem visual consolidada.

## 7. Linguagem Visual Atual

O app já possui um design system básico implementado com:

- paleta principal em tons de azul;
- verde para sucesso;
- cinzas neutros e cool gray;
- componentes reutilizáveis como `Button`, `Card`, `Typography`, `Badge`, `Avatar`, inputs e selects.

### Direção visual atual

- aparência limpa;
- bastante uso de fundo branco;
- cards como bloco principal de organização;
- estilo utilitário e funcional;
- tipografia ainda baseada em `System`;
- uso moderado de ícones e alguns emojis em pontos específicos.

### Paleta principal

- Azul principal: `#0061CC`
- Azul secundário: `#148AD9`
- Azul de destaque: `#17C8FD`
- Verde de sucesso: `#13B57D`

## 8. O Que Já Está Mais Maduro

- fluxo geral de navegação por perfil;
- busca de instrutores;
- detalhe do instrutor;
- agendamento e pagamento;
- agenda do instrutor;
- tela de ganhos do instrutor;
- base de componentes reutilizáveis.

## 9. O Que Ainda Parece Mais Provisório

- tela de chat;
- área admin;
- tela de aulas do aluno;
- algumas telas de dashboard com números zerados/estados vazios;
- consistência geral de cabeçalhos, espaçamentos e densidade visual;
- padronização de empty states, feedbacks e mensagens de erro.

## 10. Oportunidades Claras para o Designer

- fortalecer a identidade da marca sem perder clareza e confiança;
- melhorar a hierarquia de informação nas telas com muito conteúdo;
- deixar os fluxos principais mais “comerciais” e mais orientados à conversão;
- criar padrões mais consistentes para estados vazios, loading e erro;
- evoluir a navegação e a percepção de continuidade entre lista, mapa e detalhe;
- refinar o painel do instrutor para parecer mais profissional e menos genérico;
- tornar pagamento e agendamento mais seguros e transparentes visualmente;
- revisar acessibilidade visual, contraste, tamanho de toque e legibilidade.

## 11. Restrições e Contexto Técnico Importante

- O produto é **mobile-first**.
- O app foi construído em **React Native**.
- Há uso de **mapa**, **gráficos** e **formulários**.
- Já existe uma camada de componentes compartilhados, então vale pensar em design com reutilização.
- Parte das telas já consome dados reais da API, enquanto outras ainda estão em estado mais estático ou parcial.

## 12. Sugestão de Priorização para Redesign

Se o trabalho de design começar por fases, a ordem mais valiosa parece ser:

1. **Fluxo do aluno**: busca -> detalhe do instrutor -> agendamento -> pagamento.
2. **Home do aluno** e **perfil do aluno**.
3. **Agenda** e **ganhos do instrutor**.
4. **Dashboard e perfil do instrutor**.
5. **Área admin** e telas ainda mais provisórias.

## 13. Referências Técnicas Úteis no Projeto

Se o designer ou time precisar alinhar com implementação, estes pontos ajudam:

- Navegação principal por perfil:
  - `src/navigation/RootNavigator.tsx`
  - `src/navigation/AlunoTabNavigator.tsx`
  - `src/navigation/InstrutorTabNavigator.tsx`
  - `src/navigation/AdminDrawerNavigator.tsx`
- Tokens e tema:
  - `src/theme/variables.ts`
- Componentes compartilhados:
  - `src/shared/ui/`
- Documentação de design system existente:
  - `docs/DESIGN_SYSTEM.md`

## 14. Resumo Executivo

O Drivoo já tem uma base funcional sólida e uma arquitetura de produto relativamente clara. Para design, o maior valor está em transformar uma interface hoje mais utilitária em uma experiência:

- mais consistente;
- mais confiável;
- mais clara;
- mais orientada a conversão;
- mais madura visualmente para alunos e instrutores.

O coração do produto está no encontro entre:

- descoberta de instrutor,
- confiança no profissional,
- facilidade para agendar,
- segurança no pagamento,
- gestão prática da rotina do instrutor.
