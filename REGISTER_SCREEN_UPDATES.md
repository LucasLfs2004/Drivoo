# RegisterScreen - Atualizações Implementadas

## 📋 Resumo das Mudanças

Refatorei o RegisterScreen para adicionar seleção de tipo de usuário (Aluno/Instrutor) com campos dinâmicos e um switch para veículo particular.

---

## ✨ Novas Funcionalidades

### 1. Seleção de Tipo de Usuário
- Dois botões no topo: "Aluno" e "Instrutor"
- Seleção visual clara (botão ativo muda de cor)
- Campos do formulário mudam dinamicamente conforme o tipo selecionado

### 2. Switch para Veículo Particular (Aluno)
- Label: "Possuo veículo particular"
- Quando habilitado, exibe campos de preenchimento do carro
- Quando desabilitado, campos ficam ocultos
- Campos do veículo:
  - Modelo do Veículo
  - Ano do Veículo
  - Placa do Veículo
  - Tipo de Câmbio (Manual/Automático)

### 3. Campos Específicos do Instrutor
- **Informações da CNH:**
  - Número da CNH
  - Vencimento da CNH
- **Informações Profissionais:**
  - Valor por Hora (R$)
  - Biografia (Opcional)
- **Veículo (Obrigatório):**
  - Marca do Veículo
  - Modelo do Veículo
  - Ano do Veículo
  - Placa do Veículo
  - Tipo de Câmbio (Manual/Automático)

---

## 🔄 Fluxo de Registro

### Para Aluno:
```
1. Seleciona "Aluno"
2. Preenche dados pessoais (nome, sobrenome, CPF, etc.)
3. Preenche dados de contato (email, senha)
4. Preenche endereço
5. Habilita switch "Possuo veículo particular" (opcional)
6. Se habilitado, preenche dados do veículo
7. Clica em "Criar Conta"
```

### Para Instrutor:
```
1. Seleciona "Instrutor"
2. Preenche dados pessoais (nome, sobrenome, CPF, etc.)
3. Preenche dados de contato (email, senha)
4. Preenche endereço
5. Preenche informações da CNH
6. Preenche informações profissionais
7. Preenche dados do veículo (obrigatório)
8. Clica em "Criar Conta"
```

---

## 🎨 Componentes Visuais

### Seleção de Tipo de Usuário
```
┌─────────────────────────────────────┐
│ Tipo de Conta                       │
├─────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐ │
│ │    Aluno     │  │  Instrutor   │ │
│ └──────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
```

### Switch para Veículo
```
┌─────────────────────────────────────┐
│ Possuo veículo particular    [ON/OFF]│
└─────────────────────────────────────┘
```

### Seleção de Câmbio
```
┌─────────────────────────────────────┐
│ Tipo de Câmbio                      │
├─────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐ │
│ │    Manual    │  │  Automático  │ │
│ └──────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
```

---

## 📝 Validações

### Campos Comuns (Aluno e Instrutor)
- ✅ Nome (obrigatório)
- ✅ Sobrenome (obrigatório)
- ✅ Email (obrigatório, formato válido)
- ✅ Senha (obrigatório, mínimo 6 caracteres)
- ✅ Confirmação de Senha (deve coincidir)
- ✅ CPF (obrigatório, 11 dígitos)
- ✅ Data de Nascimento (obrigatório, formato DD/MM/AAAA)
- ✅ Telefone (obrigatório, 10-11 dígitos)
- ✅ CEP (obrigatório, 8 dígitos)
- ✅ Cidade (obrigatório)
- ✅ Estado (obrigatório)

### Campos do Aluno
- ✅ Veículo (opcional)
  - Se habilitado: modelo, ano e placa são obrigatórios

### Campos do Instrutor
- ✅ Número da CNH (obrigatório)
- ✅ Vencimento da CNH (obrigatório, formato DD/MM/AAAA)
- ✅ Valor/hora (obrigatório, número decimal)
- ✅ Biografia (opcional)
- ✅ Veículo (obrigatório)
  - Marca (obrigatório)
  - Modelo (obrigatório)
  - Ano (obrigatório)
  - Placa (obrigatório)

---

## 🔧 Formatação de Entrada

### Automática
- **CPF**: `123.456.789-00`
- **Telefone**: `(11) 99999-9999`
- **Data**: `DD/MM/AAAA`
- **CEP**: `00000-000`

---

## 📊 Tipos Atualizados

### RegisterUser
```typescript
interface RegisterUser {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  cep: string;
  cidade: string;
  estado: string;
  veiculo?: VehicleUser;
  // Campos do instrutor
  cnh_numero?: string;
  cnh_categorias?: string[];
  cnh_vencimento?: string;
  valor_hora?: number;
  bio?: string;
}
```

### VehicleUser
```typescript
interface VehicleUser {
  marca?: string;
  modelo: string;
  ano: number;
  placa: string;
  tipo_cambio: "MANUAL" | "AUTOMATICO"
}
```

---

## 🎯 Estilos Adicionados

### userTypeContainer
- Container para seleção de tipo de usuário
- Borda inferior para separação visual

### userTypeButton / userTypeButtonActive
- Botões de seleção com estado ativo/inativo
- Cores mudam conforme seleção

### switchContainer
- Container para o switch de veículo
- Layout horizontal com label e switch

### cambioContainer / cambioButton
- Container e botões para seleção de câmbio
- Similar aos botões de tipo de usuário

---

## 🔄 Fluxo de Dados

### Aluno com Veículo
```
RegisterFormData
  ├─ userType: 'aluno'
  ├─ nome, sobrenome, email, etc.
  ├─ possuiVeiculo: true
  └─ veiculo_modelo, veiculo_ano, veiculo_placa, veiculo_tipo_cambio
      ↓
RegisterUser
  ├─ nome, sobrenome, email, etc.
  └─ veiculo: { modelo, ano, placa, tipo_cambio }
      ↓
API /auth/registro/aluno
```

### Instrutor
```
RegisterFormData
  ├─ userType: 'instrutor'
  ├─ nome, sobrenome, email, etc.
  ├─ cnh_numero, cnh_vencimento, valor_hora, bio
  └─ veiculo_marca, veiculo_modelo_instrutor, etc.
      ↓
RegisterUser
  ├─ nome, sobrenome, email, etc.
  ├─ cnh_numero, cnh_vencimento, valor_hora, bio
  └─ veiculo: { marca, modelo, ano, placa, tipo_cambio }
      ↓
API /auth/registro/instrutor
```

---

## ✅ Checklist de Testes

### Funcionalidade
- [ ] Seleção de tipo de usuário funciona
- [ ] Campos mudam conforme tipo selecionado
- [ ] Switch de veículo funciona
- [ ] Campos de veículo aparecem/desaparecem conforme switch
- [ ] Validação de campos funciona
- [ ] Formatação de entrada funciona
- [ ] Registro de aluno com veículo funciona
- [ ] Registro de aluno sem veículo funciona
- [ ] Registro de instrutor funciona

### UI/UX
- [ ] Botões de tipo de usuário são claros
- [ ] Switch é fácil de usar
- [ ] Campos aparecem/desaparecem suavemente
- [ ] Mensagens de erro são claras
- [ ] Formulário é responsivo

### Validação
- [ ] Email inválido mostra erro
- [ ] Senhas não coincidentes mostram erro
- [ ] CPF inválido mostra erro
- [ ] Data inválida mostra erro
- [ ] Campos obrigatórios vazios mostram erro

---

## 🚀 Próximos Passos

1. **Testar com API real**
   - Verificar se endpoints `/auth/registro/aluno` e `/auth/registro/instrutor` funcionam
   - Validar resposta da API

2. **Melhorias de UX**
   - Adicionar animações ao mudar tipo de usuário
   - Adicionar loading skeleton
   - Melhorar mensagens de erro

3. **Validações Adicionais**
   - Validar CNH com algoritmo específico
   - Validar CPF com algoritmo específico
   - Validar CEP com API de endereço

4. **Testes**
   - Testes unitários para validações
   - Testes de integração com API
   - Testes E2E

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique se o tipo de usuário está sendo selecionado corretamente
2. Verifique se os campos aparecem/desaparecem conforme esperado
3. Verifique se a validação está funcionando
4. Verifique os logs do console para erros
5. Consulte a documentação da API para endpoints corretos
