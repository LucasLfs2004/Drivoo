# Arquitetura de Autenticação - Login

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      React Native App                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              LoginScreen (UI)                        │   │
│  │  - Formulário com email e senha                      │   │
│  │  - Validação de entrada                             │   │
│  │  - Exibição de erros                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AuthContext (Estado Global)                 │   │
│  │  - Gerencia estado de autenticação                  │   │
│  │  - Fornece função login()                           │   │
│  │  - Fornece usuario e token                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         authService (Lógica de Negócio)             │   │
│  │  - Valida credenciais                               │   │
│  │  - Chama API                                        │   │
│  │  - Armazena tokens                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         apiClient (HTTP Client)                     │   │
│  │  - Axios instance                                   │   │
│  │  - Interceptadores de request/response              │   │
│  │  - Refresh automático de token                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      SecureStorageService (Armazenamento)           │   │
│  │  - Armazena tokens de forma segura                  │   │
│  │  - Recupera tokens                                  │   │
│  │  - Remove tokens                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
│  POST /auth/login                                           │
│  - Valida credenciais                                       │
│  - Gera tokens JWT                                          │
│  - Retorna user data                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Fluxo de Dados

### 1. Usuário Submete Formulário

```
LoginScreen
  ├─ email: "aluno@drivoo.com"
  ├─ password: "123456"
  └─ onSubmit()
      └─ contextLogin(credentials)
```

### 2. AuthContext Processa Login

```
AuthContext.login()
  ├─ dispatch({ type: 'AUTH_LOADING' })
  ├─ authService.login(credentials)
  │   └─ Aguarda resposta da API
  ├─ Mapeia resposta para Usuario
  ├─ dispatch({ type: 'AUTH_SUCCESS' })
  └─ Atualiza estado global
```

### 3. authService Chama API

```
authService.login()
  ├─ Valida input
  ├─ apiClient.post('/auth/login', credentials)
  │   └─ Faz requisição HTTP
  ├─ Recebe resposta
  ├─ setToken(access_token)
  ├─ setRefreshToken(refresh_token)
  └─ Retorna resposta
```

### 4. apiClient Faz Requisição

```
apiClient.post()
  ├─ Request Interceptor
  │   ├─ Adiciona Authorization header
  │   └─ Log da requisição
  ├─ Faz POST /auth/login
  ├─ Response Interceptor
  │   ├─ Log da resposta
  │   └─ Trata erros
  └─ Retorna resposta
```

### 5. SecureStorage Armazena Tokens

```
SecureStorageService
  ├─ setToken(access_token)
  │   └─ Armazena em Keychain (iOS) / Keystore (Android)
  ├─ setRefreshToken(refresh_token)
  │   └─ Armazena em Keychain (iOS) / Keystore (Android)
  └─ Tokens persistem entre sessões
```

### 6. LoginScreen Detecta Mudança

```
useEffect(() => {
  if (usuario) {
    // Usuario foi atualizado no contexto
    navigation.navigate('AlunoTabs')
  }
}, [usuario])
```

---

## 🔐 Segurança

### Armazenamento de Tokens

```
┌─────────────────────────────────────────┐
│         SecureStorageService            │
├─────────────────────────────────────────┤
│                                         │
│  iOS:                                   │
│  ├─ Keychain (Secure Enclave)          │
│  └─ Criptografia de hardware            │
│                                         │
│  Android:                               │
│  ├─ Keystore (Hardware-backed)         │
│  └─ Criptografia de hardware            │
│                                         │
│  ❌ NUNCA em localStorage               │
│  ❌ NUNCA em AsyncStorage               │
│  ❌ NUNCA em variáveis globais          │
│                                         │
└─────────────────────────────────────────┘
```

### Fluxo de Token

```
1. Login
   └─ API retorna access_token + refresh_token
      └─ Armazenados em SecureStorage

2. Requisição Autenticada
   └─ apiClient recupera access_token
      └─ Adiciona Authorization header
         └─ POST /api/endpoint

3. Token Expirado (401)
   └─ apiClient detecta 401
      └─ Chama refreshToken()
         └─ Usa refresh_token para obter novo access_token
            └─ Armazena novo access_token
               └─ Retenta requisição original

4. Refresh Token Expirado
   └─ Logout automático
      └─ Redireciona para Login
```

---

## 🔄 Ciclo de Vida

### Inicialização

```
App Start
  ├─ AuthProvider monta
  ├─ initializeAuth()
  │   ├─ Tenta recuperar tokens do SecureStorage
  │   ├─ Se encontrar: dispatch AUTH_SUCCESS
  │   └─ Se não encontrar: dispatch AUTH_LOADING
  └─ App renderiza
      ├─ Se autenticado: Renderiza telas protegidas
      └─ Se não: Renderiza LoginScreen
```

### Login

```
User Action: Clica em "Entrar"
  ├─ LoginScreen.onSubmit()
  ├─ AuthContext.login()
  ├─ authService.login()
  ├─ API /auth/login
  ├─ SecureStorage.setToken()
  ├─ dispatch AUTH_SUCCESS
  ├─ useEffect detecta usuario
  ├─ Navigation.navigate()
  └─ Renderiza tela protegida
```

### Logout

```
User Action: Clica em "Logout"
  ├─ AuthContext.logout()
  ├─ apiClient.post('/auth/logout')
  ├─ SecureStorage.removeToken()
  ├─ queryClient.clear()
  ├─ dispatch AUTH_LOGOUT
  ├─ useEffect detecta usuario = null
  ├─ Navigation.reset()
  └─ Renderiza LoginScreen
```

### Token Refresh

```
API retorna 401
  ├─ apiClient Response Interceptor
  ├─ AuthApiService.refreshToken()
  ├─ POST /auth/refresh com refresh_token
  ├─ API retorna novo access_token
  ├─ SecureStorage.updateTokens()
  ├─ Retenta requisição original
  └─ Retorna resposta
```

---

## 📦 Componentes

### LoginScreen
- **Responsabilidade**: UI de login
- **Entrada**: Credenciais do usuário
- **Saída**: Chamada para `useAuth().login()`
- **Estado**: Carregamento, erro, validação

### AuthContext
- **Responsabilidade**: Gerenciar estado de autenticação
- **Entrada**: Credenciais, tokens
- **Saída**: Usuario, token, funções de login/logout
- **Estado**: Usuario, token, carregando, erro

### authService
- **Responsabilidade**: Lógica de autenticação
- **Entrada**: Credenciais
- **Saída**: Resposta da API
- **Efeitos**: Armazena tokens

### apiClient
- **Responsabilidade**: Requisições HTTP
- **Entrada**: URL, método, dados
- **Saída**: Resposta
- **Efeitos**: Adiciona headers, trata erros, refresh token

### SecureStorageService
- **Responsabilidade**: Armazenamento seguro
- **Entrada**: Tokens
- **Saída**: Tokens recuperados
- **Efeitos**: Persiste dados entre sessões

---

## 🧪 Testes

### Teste Unitário: authService.login()

```typescript
describe('authService.login', () => {
  it('deve fazer login com credenciais válidas', async () => {
    const credentials = { email: 'test@test.com', password: '123456' };
    const response = await authService.login(credentials);
    
    expect(response.access_token).toBeDefined();
    expect(response.user).toBeDefined();
  });

  it('deve lançar erro com credenciais inválidas', async () => {
    const credentials = { email: 'invalid@test.com', password: 'wrong' };
    
    await expect(authService.login(credentials)).rejects.toThrow();
  });
});
```

### Teste de Integração: LoginScreen

```typescript
describe('LoginScreen', () => {
  it('deve fazer login e navegar', async () => {
    const { getByTestId } = render(<LoginScreen />);
    
    fireEvent.changeText(getByTestId('email-input'), 'aluno@drivoo.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.press(getByTestId('login-button'));
    
    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith('AlunoTabs');
    });
  });
});
```

---

## 🚀 Performance

### Otimizações

1. **Memoização**
   - `useAuth()` retorna objeto memoizado
   - Evita re-renders desnecessários

2. **Lazy Loading**
   - Telas protegidas carregam sob demanda
   - Reduz bundle size inicial

3. **Caching**
   - React Query cache de dados do usuário
   - Evita requisições desnecessárias

4. **Token Refresh**
   - Refresh automático antes de expirar
   - Evita 401 durante uso

---

## 📈 Escalabilidade

### Adicionar Novo Tipo de Usuário

```typescript
// 1. Adicionar tipo em types/auth.ts
export type UserRole = 'aluno' | 'instrutor' | 'admin' | 'novo_tipo';

// 2. Adicionar rota em types/navigation/index.ts
export type RootStackParamList = {
  NovoTabs: NavigatorScreenParams<NovoTabParamList>;
};

// 3. Adicionar navegação em LoginScreen
if (usuario.papel === 'novo_tipo') {
  navigation.navigate('NovoTabs' as any);
}

// 4. Criar novo navigator
export const NovoTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={NovoHomeScreen} />
    </Tab.Navigator>
  );
};
```

### Adicionar Novo Endpoint de Autenticação

```typescript
// 1. Adicionar em authService
async loginWithGoogle(token: string) {
  const response = await apiClient.post('/auth/google', { token });
  await setToken(response.access_token);
  return response;
}

// 2. Usar em AuthContext
const loginWithGoogle = async (token: string) => {
  const response = await authService.loginWithGoogle(token);
  dispatch({ type: 'AUTH_SUCCESS', payload: { usuario, token } });
};

// 3. Expor em useAuth()
export const useAuth = () => {
  return { ..., loginWithGoogle };
};
```

---

## 🔍 Debugging

### Logs Importantes

```typescript
// authService.ts
console.log('Login iniciado:', credentials.email);
console.log('Tokens armazenados:', { access_token, refresh_token });

// apiClient.ts
console.log('Request:', config.url, config.method);
console.log('Response:', response.status, response.data);

// AuthContext.tsx
console.log('Auth state:', { usuario, token, isAuthenticated });
```

### Ferramentas

1. **React Native Debugger**
   - Inspecionar estado do Redux/Context
   - Ver requisições de rede

2. **Flipper**
   - Inspecionar AsyncStorage
   - Ver logs do app

3. **Xcode Debugger** (iOS)
   - Inspecionar Keychain
   - Ver logs nativos

4. **Android Studio Debugger** (Android)
   - Inspecionar Keystore
   - Ver logs nativos

---

## 📚 Referências

- [React Context API](https://react.dev/reference/react/useContext)
- [React Native Keychain](https://github.com/react-native-keychain/react-native-keychain)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [JWT Authentication](https://jwt.io/introduction)
- [OAuth 2.0](https://oauth.net/2/)
