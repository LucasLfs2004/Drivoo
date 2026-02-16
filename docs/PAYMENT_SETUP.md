# Configuração do Sistema de Pagamentos - Drivoo

## Problema Identificado

O erro no processamento de pagamento ocorria por **3 motivos principais**:

### 1. Backend URL não configurada
- O código tentava fazer `fetch` para `'YOUR_BACKEND_URL/create-split-payment'`
- Esta é uma URL placeholder que não existe
- Resultado: Erro de rede ao tentar criar o PaymentIntent

### 2. Chave do Stripe não configurada
- A `STRIPE_PUBLISHABLE_KEY` estava usando valor placeholder
- Valor atual: `'pk_test_YOUR_PUBLISHABLE_KEY_HERE'`
- Necessário: Chave real do Stripe para produção

### 3. Ausência de Backend
- O Stripe requer um backend para criar PaymentIntents de forma segura
- Não é possível criar PaymentIntents diretamente do frontend por questões de segurança
- O backend precisa usar a Secret Key do Stripe

## Solução Implementada

### Modo de Desenvolvimento (Mock)

Para permitir o desenvolvimento e teste da interface sem backend, implementamos um **modo mock**:

#### Características:
- ✅ Detecta automaticamente ambiente de desenvolvimento (`__DEV__`)
- ✅ Simula criação de PaymentIntent com delay realista (1.5s)
- ✅ Simula processamento de pagamento com delay (2s)
- ✅ Gera IDs mock únicos para rastreamento
- ✅ Exibe aviso visual de que é um pagamento simulado
- ✅ Não faz cobranças reais
- ✅ Permite testar toda a UI e fluxo de pagamento

#### Como funciona:
1. `createSplitPayment()` detecta `__DEV__` e retorna um `clientSecret` mock
2. `PaymentForm` detecta clientSecret mock (começa com `'pi_mock_'`)
3. Simula processamento e chama `onPaymentSuccess` com ID mock
4. Exibe aviso: "🧪 Modo de Desenvolvimento: Este é um pagamento simulado"

### Configuração para Produção

Quando estiver pronto para produção, você precisará:

#### 1. Criar Backend para Pagamentos

Crie um endpoint no seu backend (Node.js, Python, etc.):

```javascript
// Exemplo Node.js/Express
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/create-split-payment', async (req, res) => {
  try {
    const { amount, currency, instructorAccountId, metadata } = req.body;

    // Criar PaymentIntent com split payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      transfer_data: {
        destination: instructorAccountId, // Conta Stripe Connect do instrutor
      },
      application_fee_amount: Math.round(amount * 0.15), // 15% taxa da plataforma
      metadata,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Stripe Keys (obtenha em https://dashboard.stripe.com/apikeys)
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui

# Backend URL
BACKEND_URL=https://seu-backend.com/api
```

#### 3. Configurar Stripe Connect

Para split payments, você precisa:

1. Ativar Stripe Connect no dashboard
2. Criar contas conectadas para cada instrutor
3. Obter o `accountId` de cada instrutor
4. Usar esses IDs no `transfer_data`

Documentação: https://stripe.com/docs/connect

#### 4. Atualizar stripeService.ts

O código já está preparado para produção. Quando `__DEV__` for `false`, ele usará:
- A URL do backend configurada em `process.env.BACKEND_URL`
- A chave pública do Stripe configurada em `process.env.STRIPE_PUBLISHABLE_KEY`

## Testando o Modo Mock

### Passo a Passo:

1. **Navegue para busca de instrutores**
   - Abra o app
   - Vá para a aba "Buscar"

2. **Selecione um instrutor**
   - Escolha qualquer instrutor da lista
   - Clique para ver detalhes

3. **Agende uma aula**
   - Selecione data e horário
   - Clique em "Agendar Aula"

4. **Confirme o agendamento**
   - Revise os detalhes
   - Aceite os termos
   - Clique em "Continuar para Pagamento"

5. **Processe o pagamento mock**
   - Veja o aviso "🧪 Modo de Desenvolvimento"
   - Preencha qualquer número de cartão (ex: 4242 4242 4242 4242)
   - Preencha data futura e CVC qualquer
   - Clique em "Pagar"
   - Aguarde 2 segundos
   - Veja a confirmação de sucesso!

### Logs no Console:

Você verá logs úteis durante o processo:

```
🔄 Creating split payment (MOCK MODE): {...}
✅ Mock payment intent created: {...}
💳 Processing mock payment...
✅ Mock payment successful: pi_mock_1234567890
```

## Segurança

### ⚠️ IMPORTANTE:

- **NUNCA** exponha sua `STRIPE_SECRET_KEY` no frontend
- **SEMPRE** crie PaymentIntents no backend
- **SEMPRE** valide valores no backend antes de criar PaymentIntent
- **SEMPRE** use HTTPS em produção
- **SEMPRE** valide webhooks do Stripe com assinatura

### Fluxo Seguro:

```
Frontend → Backend → Stripe → Backend → Frontend
   ↓         ↓         ↓         ↓         ↓
Solicita  Cria PI  Processa  Confirma  Exibe
         (seguro)  Pagamento  Status   Sucesso
```

## Próximos Passos

1. ✅ Interface de pagamento funcionando (COMPLETO)
2. ✅ Modo mock para desenvolvimento (COMPLETO)
3. ⏳ Criar backend para pagamentos
4. ⏳ Configurar Stripe Connect
5. ⏳ Implementar webhooks do Stripe
6. ⏳ Adicionar tratamento de erros avançado
7. ⏳ Implementar reembolsos
8. ⏳ Adicionar histórico de transações

## Suporte

Para dúvidas sobre:
- **Stripe**: https://stripe.com/docs
- **Stripe Connect**: https://stripe.com/docs/connect
- **React Native Stripe**: https://stripe.dev/stripe-react-native

## Referências

- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Split Payments](https://stripe.com/docs/connect/charges-transfers)
- [React Native Stripe SDK](https://stripe.dev/stripe-react-native)
