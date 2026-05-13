# Drivoo - Pausa do Projeto e Estado Atual

Data da pausa: 13 de maio de 2026  
Branch registrada: `main`  
Base registrada: `c5fcc32 feat: melhora telas de pagamentos e aulas`

## Contexto

O desenvolvimento do Drivoo foi pausado neste ponto para preservar o estado atual da aplicação e facilitar uma retomada futura. Este documento registra o que existe hoje, o que parece estar integrado, o que ainda depende de validação e os principais passos antes de considerar o app pronto para produção.

O repositório está estruturado como um aplicativo React Native com TypeScript. A arquitetura já migrou em grande parte para um modelo orientado a features, com `src/features`, `src/core`, `src/shared` e `src/app`, mas ainda existem alguns módulos legados em `src/services`, `src/screens`, `src/contexts` e `src/navigation`.

## Estado Geral da Aplicação

### Plataforma e base técnica

- App React Native `0.83.1` com React `19.2.0`.
- Navegação com React Navigation, incluindo fluxos de aluno, instrutor, admin, auth e rotas compartilhadas.
- Dados remotos gerenciados principalmente com TanStack Query.
- Cliente HTTP centralizado em `src/core/api`.
- Storage seguro com `react-native-keychain` e camadas em `src/core/storage`.
- UI compartilhada em `src/shared/ui`, com componentes de layout, feedback, formulários, navegação, calendário e primitives.
- Stripe integrado via `@stripe/stripe-react-native`.
- Supabase Auth presente no fluxo de autenticação.

### Arquitetura

O projeto tem uma direção arquitetural documentada em `docs/ARCHITECTURE_TARGET.md`:

- `app`: bootstrap, providers e navegação principal.
- `core`: infraestrutura transversal, como API, auth e storage.
- `features`: domínios de produto, como auth, bookings, instructors, instructor-panel, home, profile e notifications.
- `shared`: UI, hooks, tipos, constantes e utilitários reutilizáveis.

Ainda há duplicidade controlada com camadas antigas, especialmente em:

- `src/services`
- `src/screens`
- `src/contexts`
- `src/navigation`

Na retomada, a recomendação é continuar removendo dependências dessas áreas antigas aos poucos, sem quebrar fluxos já migrados.

## Funcionalidades Implementadas ou Avançadas

### Autenticação e onboarding

- Login real via Supabase/Auth API.
- Consulta de `/auth/me` apos login.
- Cadastro/onboarding separado para aluno e instrutor.
- Fluxo de onboarding em etapas em `src/features/auth/screens/OnboardingScreen.tsx`.
- Armazenamento de tokens e refresh de sessão estruturados.

Pendências principais:

- Validar em device/simulador todos os fluxos de sessão, expiração e refresh.
- Revisar logs de auth antes de produção para evitar ruído ou exposição indevida.
- Confirmar comportamento de recuperação de senha no ambiente final.

### Busca e detalhe de instrutores

- Feature `instructors` criada com APIs, mappers, hooks e tipos próprios.
- Busca de instrutores via API.
- Detalhe de instrutor e disponibilidade pública encaminhados para hooks e mappers da feature.
- Tela de busca do aluno com fallback de coordenadas quando localização falha.

Pendências principais:

- Validar payloads reais do backend em todos os cenários.
- Trocar fallback de geocoding/mock por integração real quando necessário.
- Garantir paginação, filtros e mapa com comportamento consistente em produção.

### Agendamentos e pagamentos

- Feature `bookings` contém tipos, APIs, mappers, hooks e telas principais.
- Fluxo de checkout de agendamento criado.
- Persistência local de checkout pendente.
- Tela de confirmação de pagamento consulta status do backend.
- Deep link `drivoo://` preparado para retorno da Stripe.
- Fluxo mockado de cartão foi substituído por Checkout hospedado na direção da integração real.

Pendências principais:

- Integrar listagem real definitiva de `GET /agendamentos/meus`.
- Integrar detalhe real de `GET /agendamentos/{agendamento_id}` com `payment_summary`.
- Integrar cancelamento, refund e pós-aula.
- Validar ponta a ponta com Stripe real, webhooks reais e backend de produção.
- Confirmar comportamento de reserva temporária, expiração e reconciliação após retorno da Stripe.

### Área do instrutor

- Telas de dashboard, agenda, ganhos, aulas e perfil foram evoluídas.
- Contratos, mappers e hooks para perfil, veículos, disponibilidade, agenda e financeiro foram adicionados em `src/features/instructors`.
- Área de recebimentos do instrutor foi criada com onboarding Stripe.
- Tela de aulas do instrutor consome a base de bookings e permite ações de status onde suportado.

Pendências principais:

- Criar ou validar rota backend dedicada para confirmação/ocorrência do instrutor.
- Validar campos reais de aluno retornados no detalhe de agendamento.
- Validar visualmente a tela de recebimentos em device/simulador.
- Integrar textos legais reais de aceite contratual/fiscal.
- Confirmar contrato final de disponibilidade em lote antes de consolidar a nova UI como fonte única.

### Disponibilidade do instrutor

- Há uma proposta robusta documentada em `docs/specs/instructor-availability-bulk`.
- Existem componentes e telas para edição de disponibilidade e exceções.
- O draft local de disponibilidade e componentes de calendário já existem.

Pendências principais:

- Confirmar a rota oficial de escrita bulk do backend.
- Confirmar formato final de leitura `weekly + exceptions`.
- Confirmar regra de remoção de dia e indice de `dia_semana`.
- Integrar bookings existentes para bloqueio de conflito.
- Finalizar remoção controlada do editor semanal legado.

### Notificações

- Existe base documental extensa em `docs/NOTIFICATION_PRODUCTION_GUIDE.md`.
- Existem telas compartilhadas de lista e configuração de notificações.
- Existe contexto/serviço de notificações para desenvolvimento.

Pendências principais:

- Implementar FCM/APNs real.
- Criar e validar rotas backend de device token, preferências e envio.
- Testar permissões, foreground/background e deep links de notificação.
- Remover mocks ou serviços temporários antes de produção.

### Perfil e configurações

- Telas de perfil de aluno, instrutor, edição de perfil e configurações existem.
- Parte das APIs de perfil e edição já está encaminhada em `src/features/profile` e `src/features/instructors`.

Pendências principais:

- Validar `PUT`/atualização real de usuário e instrutor.
- Integrar configurações persistidas no backend.
- Substituir seleção mock de imagem por upload real.
- Revisar campos que ainda não possuem contrato backend.

### Admin

- Existem telas de admin para analytics, usuarios, instrutores e configurações.
- A área aparenta estar em estado de UI/base funcional.

Pendências principais:

- Integrar dados reais de administração.
- Definir permissões e autorização por papel no backend.
- Validar se o app mobile deve manter admin como fluxo de produção ou se será separado.

## Riscos e Pontos de Atenção

- O README principal ainda está no template padrão do React Native e deve ser reescrito antes de onboarding de novos devs.
- Há documentação antiga que pode mencionar caminhos legados, como `src/screens/client`, enquanto o código atual já usa `src/features`.
- Alguns módulos antigos ainda coexistem com a arquitetura nova.
- Existem mocks residuais em localização, imagem, instrutores e fluxos de desenvolvimento.
- A configuração de produção usa `https://api.drivoo.com`, mas precisa ser validada com ambiente real, certificados, CORS/API gateway e versionamento.
- Stripe não deve ir para produção sem validação completa de Checkout, webhooks, Connect, refunds, reconciliação e estados de erro.
- Push notifications ainda parecem ser planejamento/base, não produção.
- Testes automatizados precisam ser ampliados antes de release.

## O Que Falta Para Produção

### Produto e escopo

- Fechar escopo MVP: aluno, instrutor, admin, pagamentos, notificações e suporte.
- Decidir se admin fica dentro do app mobile ou em ferramenta separada.
- Confirmar regras de negócio de cancelamento, refund, expiração de reserva, aula concluída e disputa.
- Validar textos legais, termos, política de privacidade e consentimentos.

### Backend e contratos

- Congelar OpenAPI real do MVP.
- Validar payload real de todas as rotas com schema vazio ou incompleto.
- Garantir autenticação/autorização por papel.
- Criar rotas pendentes de ocorrência/confirmacao do instrutor.
- Finalizar disponibilidade bulk e exceções.
- Finalizar webhooks Stripe e notificações transacionais.

### Mobile

- Remover mocks como fonte principal de dado.
- Reescrever README com setup real do projeto.
- Revisar `.env`, schemes, bundle IDs, permissões nativas e configs por ambiente.
- Validar iOS e Android em simulador e device físico.
- Revisar logs, mensagens de erro e estados vazios.
- Garantir acessibilidade básica em formulários e fluxos críticos.

### Pagamentos

- Configurar Stripe Connect em ambiente real.
- Validar onboarding do instrutor.
- Validar Checkout hospedado em iOS e Android.
- Validar webhooks e atualização do status no app.
- Validar cancelamento, refund, falha, expiração e retorno interrompido.
- Criar rotina de reconciliação ou consulta confiável do status de pagamento.

### Qualidade

- Rodar e corrigir `npm run lint`.
- Rodar e corrigir `npm test`.
- Adicionar testes de mappers e validações de domínio.
- Adicionar testes para auth, bookings, pagamento, disponibilidade e financeiro.
- Executar QA manual por papel: aluno, instrutor e admin.
- Fazer revisão de segurança de tokens, secrets, logs e armazenamento local.

### Release

- Definir versionamento, changelog e pipeline de build.
- Configurar assinatura Android e iOS.
- Configurar Apple Developer, Google Play Console e certificados.
- Preparar ambientes staging/prod.
- Validar crash reporting e analytics, se forem parte do MVP.
- Criar checklist final de submissão para lojas.

## Checklist Para Retomar

1. Atualizar a branch `main` e confirmar que o projeto instala com Node 20+.
2. Rodar `npm install` ou o gerenciador escolhido e confirmar lockfile oficial.
3. Rodar `npm run lint` e `npm test`.
4. Subir a API local ou staging e validar login com `/auth/me`.
5. Testar fluxo completo de aluno: login, busca, detalhe, checkout, retorno e meus agendamentos.
6. Testar fluxo completo de instrutor: login, perfil, veículos, disponibilidade, agenda, ganhos e recebimentos.
7. Revisar as specs em `docs/specs` e marcar o que já foi concluído no código.
8. Remover ou isolar o legado restante depois que os fluxos migrados estiverem estáveis.
9. Reescrever `README.md` com setup real, variáveis de ambiente e comandos de desenvolvimento.
10. Atualizar este documento quando o projeto for retomado.

## Referências Internas

- `docs/ARCHITECTURE_TARGET.md`
- `docs/API_IMPLEMENTATION_SPEC.md`
- `docs/API_IMPLEMENTATION_DESIGN.md`
- `docs/API_IMPLEMENTATION_TASKS.md`
- `docs/PAYMENT_SETUP.md`
- `docs/NOTIFICATION_PRODUCTION_GUIDE.md`
- `docs/specs/booking-payments-stripe`
- `docs/specs/instructors-api-integration`
- `docs/specs/instructor-financial-onboarding`
- `docs/specs/instructor-availability-bulk`
- `docs/specs/instructor-bookings-area`

## Nota Final

O projeto não deve ser tratado como pronto para produção neste estado. Ele tem uma base forte de arquitetura, UI e integração, mas ainda precisa de validação real ponta a ponta, remoção de mocks, fechamento de contratos backend, testes automatizados, QA mobile e preparação de release.
