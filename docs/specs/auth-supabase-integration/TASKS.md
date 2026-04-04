# Auth Supabase Integration Tasks

- [x] Documentar spec, design e tarefas da migração
- [x] Adaptar storage para persistir sessão autenticada com ou sem perfil concluído
- [x] Implementar cliente de auth do Supabase via HTTP
- [x] Atualizar `authService` para login Supabase + onboarding na API
- [x] Atualizar `AuthContext` para suportar `needsOnboarding`
- [x] Ajustar bootstrap da sessão e refresh token
- [x] Ajustar navegação para roteamento de onboarding
- [x] Reaproveitar `RegisterScreen` como tela de onboarding
- [ ] Validar o fluxo em device/simulador com `SUPABASE_URL` e `SUPABASE_ANON_KEY`
