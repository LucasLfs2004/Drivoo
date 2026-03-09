# Guia de Testes - Login com API Real

## ✅ Verificação Pré-Teste

Antes de testar, certifique-se de que:

1. **API está rodando**
   ```bash
   # Verifique se a API está em http://127.0.0.1:8000
   curl http://127.0.0.1:8000/health
   ```

2. **Variáveis de ambiente estão corretas**
   ```bash
   # Verifique .env
   API_BASE_URL=http://127.0.0.1:8000
   ```

3. **Dependências instaladas**
   ```bash
   npm install
   ```

---

## 🧪 Testes Manuais

### Teste 1: Login Bem-Sucedido (Aluno)

**Passos:**
1. Abra o app
2. Vá para tela de Login
3. Preencha:
   - Email: `aluno@drivoo.com`
   - Senha: `123456`
4. Clique em "Entrar"

**Esperado:**
- ✅ Botão muda para "Entrando..."
- ✅ Após 1-2 segundos, redireciona para AlunoTabs
- ✅ Usuário vê a tela Home do aluno
- ✅ Tokens estão armazenados em SecureStorage

**Verificação no Console:**
```
✅ Login successful
✅ Tokens stored
✅ Navigation to AlunoTabs
```

---

### Teste 2: Login Bem-Sucedido (Instrutor)

**Passos:**
1. Volte para Login (logout se necessário)
2. Preencha:
   - Email: `instrutor@drivoo.com`
   - Senha: `123456`
3. Clique em "Entrar"

**Esperado:**
- ✅ Redireciona para InstrutorTabs
- ✅ Usuário vê Dashboard do instrutor

---

### Teste 3: Login Bem-Sucedido (Admin)

**Passos:**
1. Volte para Login
2. Preencha:
   - Email: `admin@drivoo.com`
   - Senha: `123456`
3. Clique em "Entrar"

**Esperado:**
- ✅ Redireciona para AdminDrawer
- ✅ Usuário vê menu de administração

---

### Teste 4: Credenciais Inválidas

**Passos:**
1. Preencha:
   - Email: `invalido@test.com`
   - Senha: `123456`
2. Clique em "Entrar"

**Esperado:**
- ✅ Exibe erro em vermelho: "Email ou senha inválidos"
- ✅ Permanece na tela de Login
- ✅ Nenhum token é armazenado

---

### Teste 5: Email Vazio

**Passos:**
1. Deixe email vazio
2. Preencha senha: `123456`
3. Tente clicar em "Entrar"

**Esperado:**
- ✅ Botão "Entrar" está desabilitado
- ✅ Mensagem de erro: "Email é obrigatório"

---

### Teste 6: Senha Vazia

**Passos:**
1. Preencha email: `aluno@drivoo.com`
2. Deixe senha vazia
3. Tente clicar em "Entrar"

**Esperado:**
- ✅ Botão "Entrar" está desabilitado
- ✅ Mensagem de erro: "Senha é obrigatória"

---

### Teste 7: Senha Muito Curta

**Passos:**
1. Preencha email: `aluno@drivoo.com`
2. Preencha senha: `123` (menos de 6 caracteres)
3. Tente clicar em "Entrar"

**Esperado:**
- ✅ Botão "Entrar" está desabilitado
- ✅ Mensagem de erro: "Senha deve ter pelo menos 6 caracteres"

---

### Teste 8: Email Inválido

**Passos:**
1. Preencha email: `invalido` (sem @)
2. Preencha senha: `123456`
3. Tente clicar em "Entrar"

**Esperado:**
- ✅ Botão "Entrar" está desabilitado
- ✅ Mensagem de erro: "Email inválido"

---

### Teste 9: Persistência de Tokens

**Passos:**
1. Faça login com sucesso
2. Feche o app completamente
3. Reabra o app

**Esperado:**
- ✅ Usuário permanece logado
- ✅ Não precisa fazer login novamente
- ✅ Tokens foram recuperados do SecureStorage

---

### Teste 10: Logout

**Passos:**
1. Faça login com sucesso
2. Vá para Profile
3. Clique em "Logout" ou "Sair"

**Esperado:**
- ✅ Redireciona para tela de Login
- ✅ Tokens são removidos do SecureStorage
- ✅ Usuário não consegue acessar telas protegidas

---

## 🔍 Verificações de Rede

### Verificar Requisição de Login

**Usando React Native Debugger ou Flipper:**

1. Abra o Network tab
2. Faça login
3. Procure por requisição POST `/auth/login`

**Esperado:**
```
POST /auth/login
Headers:
  Content-Type: application/json

Body:
{
  "email": "aluno@drivoo.com",
  "password": "123456"
}

Response (200):
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "user-123",
    "email": "aluno@drivoo.com",
    "name": "João Silva",
    "userType": "student"
  }
}
```

---

### Verificar Token em Requisições Subsequentes

1. Após login, faça qualquer requisição autenticada
2. Verifique o header `Authorization`

**Esperado:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## 🐛 Troubleshooting

### Problema: "Network Error"

**Causa:** API não está rodando ou URL está incorreta

**Solução:**
```bash
# Verifique se a API está rodando
curl http://127.0.0.1:8000/health

# Verifique .env
cat .env | grep API_BASE_URL

# Reinicie o app
npm start
```

---

### Problema: "Email ou senha inválidos" (mesmo com credenciais corretas)

**Causa:** Credenciais não existem na API

**Solução:**
1. Verifique se o usuário existe na API
2. Verifique se a senha está correta
3. Verifique se o email está correto (case-sensitive)

---

### Problema: Tokens não são armazenados

**Causa:** SecureStorage não está funcionando

**Solução:**
```bash
# Verifique se react-native-keychain está instalado
npm list react-native-keychain

# Reinstale se necessário
npm install react-native-keychain
```

---

### Problema: Usuário não redireciona após login

**Causa:** Navegação não está configurada corretamente

**Solução:**
1. Verifique se as rotas existem em `src/types/navigation/index.ts`
2. Verifique se o `RootNavigator` está configurado corretamente
3. Verifique os logs do console

---

## 📊 Checklist de Testes

- [ ] Login bem-sucedido (Aluno)
- [ ] Login bem-sucedido (Instrutor)
- [ ] Login bem-sucedido (Admin)
- [ ] Credenciais inválidas
- [ ] Email vazio
- [ ] Senha vazia
- [ ] Senha muito curta
- [ ] Email inválido
- [ ] Persistência de tokens
- [ ] Logout
- [ ] Requisição de login tem headers corretos
- [ ] Token é incluído em requisições subsequentes
- [ ] Refresh token funciona quando access_token expira
- [ ] Erro de rede é tratado corretamente
- [ ] Mensagens de erro são claras

---

## 📝 Logs Esperados

### Login Bem-Sucedido

```
[AuthContext] Login iniciado
[authService] Chamando API: POST /auth/login
[apiClient] Request: POST /auth/login
[apiClient] Response: 200 OK
[authService] Tokens armazenados
[AuthContext] Login bem-sucedido
[Navigation] Redirecionando para AlunoTabs
```

### Login Falhado

```
[AuthContext] Login iniciado
[authService] Chamando API: POST /auth/login
[apiClient] Request: POST /auth/login
[apiClient] Response: 401 Unauthorized
[authService] Erro: Email ou senha inválidos
[AuthContext] Erro: Email ou senha inválidos
[LoginScreen] Exibindo erro ao usuário
```

---

## 🎯 Próximos Passos Após Testes

1. ✅ Se todos os testes passarem:
   - Commit das mudanças
   - Documentar qualquer comportamento especial
   - Preparar para testes de integração

2. ❌ Se algum teste falhar:
   - Verificar logs do console
   - Verificar resposta da API
   - Verificar configuração de rede
   - Abrir issue com detalhes do erro
