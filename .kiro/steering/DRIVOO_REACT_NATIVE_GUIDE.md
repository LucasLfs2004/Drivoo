---
inclusion: manual
---

# 🚗 DRIVOO - Guia de Integração React Native

## 📋 Visão Geral do Projeto

**DRIVOO** é uma plataforma de agendamento de aulas práticas de direção que conecta alunos com instrutores. O backend é uma API FastAPI completa com 34 endpoints implementados.

### Stack Backend
- **Framework:** FastAPI (Python)
- **Banco de Dados:** PostgreSQL (Supabase)
- **Autenticação:** JWT
- **Geocoding:** Google Maps API
- **Moderação:** Automática de conteúdo sensível

---

## 🔐 Autenticação JWT

### Fluxo de Login

1. **Usuário faz login**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

2. **Resposta com Token**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid",
    "email": "usuario@email.com",
    "nome": "João",
    "sobrenome": "Silva",
    "tipo": "aluno",
    "foto_url": null
  }
}
```

3. **Armazenar Token (React Native)**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Após login bem-sucedido
await AsyncStorage.setItem('token', token);
await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
```

4. **Enviar Token em Requisições**
```javascript
// Interceptor com Axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://seu-backend.com'
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tratamento de erro 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado - fazer logout
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('usuario');
      // Redirecionar para login
    }
    return Promise.reject(error);
  }
);
```

### Endpoints Públicos (Sem Autenticação)
- `POST /auth/registro/aluno` - Cadastro de aluno
- `POST /auth/registro/instrutor` - Cadastro de instrutor
- `POST /auth/login` - Login
- `GET /instrutores/buscar` - Buscar instrutores
- `GET /instrutores/{id}` - Perfil do instrutor
- `GET /instrutores/{id}/horarios-disponiveis` - Horários disponíveis

### Endpoints Protegidos (Requerem Token)
- `GET /dashboard` - Dashboard (redireciona automaticamente)
- `GET /dashboard/aluno` - Dashboard do aluno
- `GET /dashboard/instrutor` - Dashboard do instrutor
- `GET /agendamentos/meus` - Minhas aulas
- `POST /agendamentos` - Criar agendamento
- `GET /conversas` - Minhas conversas
- `POST /conversas/{id}/mensagens` - Enviar mensagem
- `GET /usuarios/{id}` - Dados do usuário
- `PUT /usuarios/{id}` - Atualizar usuário

---

## 🗺️ Estrutura de Telas

### 1. **Tela de Login/Registro**
- Cadastro de aluno
- Cadastro de instrutor
- Login com email/senha

**Endpoints:**
```
POST /auth/registro/aluno
POST /auth/registro/instrutor
POST /auth/login
```

### 2. **Tela Home (Dashboard)**
Mostra próxima aula e progresso do aluno

**Endpoint:**
```
GET /dashboard/aluno

Response:
{
  "proxima_aula": {
    "id": "uuid",
    "instrutor": {
      "nome": "Maria",
      "sobrenome": "Santos",
      "foto_url": "https://..."
    },
    "inicio": "2025-01-15T08:00:00",
    "fim": "2025-01-15T09:30:00",
    "local_aproximado": "Bela Vista, São Paulo"
  },
  "progresso": {
    "aulas_concluidas": 5,
    "horas_pratica": 7.5,
    "proximas_agendadas": 2
  }
}
```

### 3. **Tela Buscar Instrutores**
Busca instrutores por localização com filtros

**Endpoint:**
```
GET /instrutores/buscar?latitude=-23.5648&longitude=-46.6518&raio_km=10&ordenar_por=proximidade

Query Params:
- latitude (obrigatório)
- longitude (obrigatório)
- raio_km: 10 (padrão)
- ordenar_por: proximidade | avaliacao | preco
- tipo_cambio: MANUAL | AUTOMATICO
- genero: M | F | Outro
- aceita_veiculo_aluno: true | false
- limite: 20 (padrão)
- offset: 0 (padrão)

Response:
{
  "total": 15,
  "instrutores": [
    {
      "id": "uuid",
      "nome": "Maria",
      "sobrenome": "Santos",
      "foto_url": "https://...",
      "avaliacao_media": 4.8,
      "total_avaliacoes": 120,
      "valor_hora": 80.00,
      "experiencia_anos": 10,
      "genero": "F",
      "distancia_km": 2.5,
      "coordenadas": {
        "latitude": -23.5648865,
        "longitude": -46.651918
      },
      "veiculo": {
        "modelo": "Gol",
        "ano": 2020,
        "tipo_cambio": "MANUAL",
        "aceita_veiculo_aluno": true
      },
      "tags": ["paciente", "especialista_manual"]
    }
  ]
}
```

**Implementação React Native:**
```javascript
import * as Location from 'expo-location';

const buscarInstrutores = async () => {
  // Obter localização do usuário
  const location = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = location.coords;

  // Buscar instrutores
  const response = await api.get('/instrutores/buscar', {
    params: {
      latitude,
      longitude,
      raio_km: 10,
      ordenar_por: 'proximidade'
    }
  });

  return response.data.instrutores;
};
```

### 4. **Tela Detalhes do Instrutor**
Mostra perfil completo do instrutor

**Endpoint:**
```
GET /instrutores/{instrutor_id}

Response:
{
  "id": "uuid",
  "nome": "Maria",
  "sobrenome": "Santos",
  "foto_url": "https://...",
  "genero": "F",
  "avaliacao_media": 4.8,
  "total_avaliacoes": 120,
  "total_aulas": 500,
  "experiencia_anos": 10,
  "valor_hora": 80.00,
  "cnh_categorias": ["A", "B"],
  "bio": "Instrutora experiente...",
  "tags": ["paciente", "especialista_manual"],
  "veiculo": {
    "id": "uuid",
    "modelo": "Gol",
    "ano": 2020,
    "tipo_cambio": "MANUAL",
    "aceita_veiculo_aluno": true,
    "ativo": true
  },
  "coordenadas": {
    "latitude": -23.5648865,
    "longitude": -46.651918
  }
}
```

### 5. **Tela Agendar Aula**
Seleciona data/hora e confirma agendamento

**Endpoints:**
```
1. Obter horários disponíveis
GET /instrutores/{instrutor_id}/horarios-disponiveis?data=2025-01-15&duracao_minutos=90

Response:
{
  "data": "2025-01-15",
  "dia_semana": "Segunda-feira",
  "instrutor_trabalha": true,
  "horarios": [
    {
      "hora_inicio": "08:00:00",
      "hora_fim": "09:30:00",
      "disponivel": true
    },
    {
      "hora_inicio": "14:00:00",
      "hora_fim": "15:30:00",
      "disponivel": false,
      "motivo": "Horário já agendado"
    }
  ]
}

2. Validar disponibilidade
POST /agendamentos/validar
{
  "instrutor_id": "uuid",
  "inicio": "2025-01-15T08:00:00",
  "fim": "2025-01-15T09:30:00"
}

Response:
{
  "disponivel": true,
  "conflito": false,
  "mensagem": "Horário disponível"
}

3. Criar agendamento
POST /agendamentos
{
  "instrutor_id": "uuid",
  "data": "2025-01-15",
  "hora_inicio": "08:00:00",
  "duracao_minutos": 90,
  "veiculo_instrutor": true,
  "veiculo_id": null
}

Response:
{
  "id": "uuid",
  "status": "AGENDADO",
  "instrutor": {
    "id": "uuid",
    "nome": "Maria",
    "sobrenome": "Santos",
    "foto_url": "https://..."
  },
  "inicio": "2025-01-15T08:00:00",
  "fim": "2025-01-15T09:30:00",
  "valor_total": 120.00,
  "valor_instrutor": 102.00,
  "valor_plataforma": 18.00,
  "veiculo": {
    "modelo": "Gol",
    "tipo_cambio": "MANUAL",
    "proprietario": "instrutor"
  }
}
```

### 6. **Tela Minhas Aulas**
Lista todas as aulas do aluno

**Endpoint:**
```
GET /agendamentos/meus?status_filtro=AGENDADO&limite=20&offset=0

Query Params:
- status_filtro: AGENDADO | CONFIRMADO | CONCLUIDO | CANCELADO
- limite: 20 (padrão)
- offset: 0 (padrão)

Response:
{
  "total": 25,
  "agendamentos": [
    {
      "id": "uuid",
      "status": "AGENDADO",
      "inicio": "2025-01-15T08:00:00",
      "fim": "2025-01-15T09:30:00",
      "instrutor": {
        "id": "uuid",
        "nome": "Maria",
        "sobrenome": "Santos",
        "foto_url": "https://..."
      },
      "plano_aula": null,
      "valor_total": 120.00,
      "pode_avaliar": false,
      "avaliado": false
    }
  ],
  "resumo": {
    "proximas": 3,
    "concluidas": 20,
    "canceladas": 2
  }
}
```

### 7. **Tela Chat**
Conversa com instrutor sobre agendamento

**Endpoints:**
```
1. Listar conversas
GET /conversas

Response:
{
  "conversas": [
    {
      "id": "uuid",
      "agendamento_id": "uuid",
      "participante": {
        "id": "uuid",
        "nome": "Maria",
        "sobrenome": "Santos",
        "foto_url": "https://..."
      },
      "ultima_mensagem": {
        "conteudo": "Confirmo o horário!",
        "criado_em": "2025-01-15T10:00:00"
      },
      "nao_lidas": 2
    }
  ]
}

2. Obter mensagens
GET /conversas/{conversa_id}/mensagens?limite=50&offset=0

Response:
{
  "conversa_id": "uuid",
  "mensagens": [
    {
      "id": "uuid",
      "remetente_id": "uuid",
      "conteudo": "Olá! Confirmo o horário.",
      "moderada": false,
      "lida": true,
      "criado_em": "2025-01-15T10:00:00"
    }
  ]
}

3. Enviar mensagem
POST /conversas/{conversa_id}/mensagens
{
  "conteudo": "Olá! Confirmo o horário."
}

Response:
{
  "id": "uuid",
  "conteudo": "Olá! Confirmo o horário.",
  "moderada": false,
  "criado_em": "2025-01-15T10:00:00"
}
```

**Nota:** O chat tem moderação automática que bloqueia:
- Números de telefone
- Palavras-chave como "whatsapp", "zap"
- Tentativas de contato externo

### 8. **Tela Perfil**
Dados e configurações do usuário

**Endpoints:**
```
1. Obter dados
GET /usuarios/{usuario_id}

Response:
{
  "id": "uuid",
  "email": "joao@teste.com",
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "12345678901",
  "telefone": "11999999999",
  "data_nascimento": "1995-05-15",
  "foto_url": "https://...",
  "tipo": "aluno",
  "status": "ATIVO"
}

2. Atualizar dados
PUT /usuarios/{usuario_id}
{
  "nome": "João Pedro",
  "sobrenome": "Silva Santos",
  "telefone": "11988888888",
  "foto_url": "https://...",
  "cep": "01310100",
  "cidade": "São Paulo",
  "estado": "SP"
}

3. Obter configurações
GET /usuarios/{usuario_id}/configuracoes

Response:
{
  "notificacoes_push": true,
  "notificacoes_email": true,
  "notificacoes_sms": false,
  "tema_escuro": false,
  "idioma": "pt-BR"
}

4. Atualizar configurações
PUT /usuarios/{usuario_id}/configuracoes
{
  "notificacoes_push": false,
  "tema_escuro": true
}
```

### 9. **Tela Avaliar Aula**
Avalia aula concluída

**Endpoint:**
```
POST /agendamentos/{agendamento_id}/avaliar
{
  "nota": 5,
  "comentario": "Excelente instrutora! Muito paciente."
}

Response:
{
  "id": "uuid",
  "nota": 5,
  "comentario": "Excelente instrutora! Muito paciente.",
  "criado_em": "2025-01-15T10:00:00"
}
```

---

## 📱 Implementação React Native - Exemplo Completo

### 1. Configurar API Client

```javascript
// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000'
});

// Interceptor para adicionar token
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('usuario');
      // Redirecionar para login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Context de Autenticação

```javascript
// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  tipo: 'aluno' | 'instrutor';
  foto_url?: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se tem token ao iniciar
  useEffect(() => {
    const verificarToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUsuario = await AsyncStorage.getItem('usuario');
        
        if (storedToken && storedUsuario) {
          setToken(storedToken);
          setUsuario(JSON.parse(storedUsuario));
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verificarToken();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, usuario } = response.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      
      setToken(token);
      setUsuario(usuario);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
      setToken(null);
      setUsuario(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Hook para Usar Autenticação

```javascript
// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
```

### 4. Exemplo de Tela - Dashboard

```javascript
// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface DashboardData {
  proxima_aula: {
    id: string;
    instrutor: {
      nome: string;
      sobrenome: string;
      foto_url: string;
    };
    inicio: string;
    fim: string;
    local_aproximado: string;
  } | null;
  progresso: {
    aulas_concluidas: number;
    horas_pratica: number;
    proximas_agendadas: number;
  };
}

export const DashboardScreen: React.FC = () => {
  const { usuario } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        const response = await api.get('/dashboard/aluno');
        setDashboard(response.data);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, {usuario?.nome}!</Text>
      
      {dashboard?.proxima_aula ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próxima Aula</Text>
          <Text>Instrutor: {dashboard.proxima_aula.instrutor.nome}</Text>
          <Text>
            Horário: {new Date(dashboard.proxima_aula.inicio).toLocaleString('pt-BR')}
          </Text>
          <Text>Local: {dashboard.proxima_aula.local_aproximado}</Text>
        </View>
      ) : (
        <Text>Nenhuma aula agendada</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seu Progresso</Text>
        <Text>Aulas Concluídas: {dashboard?.progresso.aulas_concluidas}</Text>
        <Text>Horas de Prática: {dashboard?.progresso.horas_pratica}h</Text>
        <Text>Próximas Agendadas: {dashboard?.progresso.proximas_agendadas}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  }
});
```

---

## 🔄 Fluxo de Dados Típico

### Buscar e Agendar Aula

```
1. Usuário abre app
   ↓
2. Verifica se tem token (AuthContext)
   ↓
3. Se não tem, vai para Login
   ↓
4. Se tem, vai para Dashboard
   ↓
5. Usuário clica em "Buscar Instrutores"
   ↓
6. App obtém localização (expo-location)
   ↓
7. Faz requisição: GET /instrutores/buscar?latitude=...&longitude=...
   ↓
8. Mostra lista de instrutores
   ↓
9. Usuário clica em instrutor
   ↓
10. Mostra detalhes: GET /instrutores/{id}
    ↓
11. Usuário clica em "Agendar"
    ↓
12. Mostra calendário e horários disponíveis
    ↓
13. Faz requisição: GET /instrutores/{id}/horarios-disponiveis?data=...
    ↓
14. Usuário seleciona horário
    ↓
15. Valida: POST /agendamentos/validar
    ↓
16. Se disponível, cria: POST /agendamentos
    ↓
17. Mostra confirmação com valor total
    ↓
18. Agendamento criado com sucesso
```

---

## 📊 Estrutura de Dados Principais

### Usuario
```typescript
interface Usuario {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  foto_url: string | null;
  tipo: 'aluno' | 'instrutor';
  status: 'ATIVO' | 'INATIVO';
}
```

### Instrutor
```typescript
interface Instrutor {
  id: string;
  nome: string;
  sobrenome: string;
  foto_url: string;
  genero: 'M' | 'F' | 'Outro';
  avaliacao_media: number;
  total_avaliacoes: number;
  total_aulas: number;
  experiencia_anos: number;
  valor_hora: number;
  cnh_categorias: string[];
  bio: string;
  tags: string[];
  veiculo: Veiculo;
  coordenadas: {
    latitude: number;
    longitude: number;
  };
}
```

### Agendamento
```typescript
interface Agendamento {
  id: string;
  status: 'AGENDADO' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO';
  inicio: string; // ISO 8601
  fim: string;    // ISO 8601
  instrutor: {
    id: string;
    nome: string;
    sobrenome: string;
    foto_url: string;
  };
  aluno: {
    id: string;
    nome: string;
    sobrenome: string;
    foto_url: string;
  };
  veiculo: {
    modelo: string;
    tipo_cambio: 'MANUAL' | 'AUTOMATICO';
    proprietario: 'instrutor' | 'aluno';
  };
  valor_total: number;
  valor_instrutor: number;
  valor_plataforma: number;
  pode_avaliar: boolean;
  avaliado: boolean;
}
```

---

## ⚠️ Tratamento de Erros

### Erros Comuns

```javascript
// 401 - Não autenticado
if (error.response?.status === 401) {
  // Fazer logout e redirecionar para login
  await logout();
  navigation.navigate('Login');
}

// 403 - Sem permissão
if (error.response?.status === 403) {
  Alert.alert('Erro', 'Você não tem permissão para acessar isso');
}

// 400 - Dados inválidos
if (error.response?.status === 400) {
  const mensagem = error.response.data.detail;
  Alert.alert('Erro', mensagem);
}

// 500 - Erro do servidor
if (error.response?.status === 500) {
  Alert.alert('Erro', 'Erro no servidor. Tente novamente mais tarde.');
}
```

---

## 🚀 Checklist de Implementação

- [ ] Configurar API client com Axios
- [ ] Implementar AuthContext
- [ ] Criar tela de Login
- [ ] Criar tela de Registro (Aluno)
- [ ] Criar tela de Registro (Instrutor)
- [ ] Implementar Dashboard
- [ ] Implementar busca de instrutores com mapa
- [ ] Implementar tela de detalhes do instrutor
- [ ] Implementar agendamento de aula
- [ ] Implementar lista de minhas aulas
- [ ] Implementar chat
- [ ] Implementar avaliação de aula
- [ ] Implementar perfil do usuário
- [ ] Implementar configurações
- [ ] Adicionar tratamento de erros
- [ ] Adicionar loading states
- [ ] Testar todos os endpoints

---

## 📚 Referências

- **Documentação Completa:** `backend/docs/02-frontend/CONTRATO_API_COMPLETO.md`
- **Autenticação JWT:** `backend/docs/02-frontend/AUTENTICACAO_JWT.md`
- **Guia de Integração:** `backend/docs/02-frontend/GUIA_INTEGRACAO_FRONTEND.md`
- **API Base:** `http://localhost:8000`
- **Swagger:** `http://localhost:8000/docs`

---

**Última atualização:** 2026-02-27
**Versão da API:** 1.2.0
