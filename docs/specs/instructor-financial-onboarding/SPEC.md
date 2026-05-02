# Instructor Financial Onboarding Spec

## Contexto

Instrutores precisam configurar dados fiscais e uma conta conectada Stripe antes de receber repasses. O perfil básico do instrutor já deve existir no Supabase/Auth e no banco da API antes desta etapa.

## Objetivo

Adicionar ao app mobile uma etapa de "Recebimentos" para o instrutor consultar pendências financeiras, salvar dados fiscais e iniciar/continuar o onboarding hospedado da Stripe.

## Rotas da API

- `GET /instrutores/me/financeiro`
- `PUT /instrutores/me/financeiro`
- `POST /instrutores/me/stripe/onboarding-link`

## Regras

- A tela deve consultar o backend como fonte de verdade.
- O app deve abrir `onboarding_url` hospedada pela Stripe.
- Ao retornar da Stripe, o app deve chamar novamente `GET /instrutores/me/financeiro`.
- Se ainda houver pendências, o app deve permitir gerar novo link de onboarding.
- PF exige CPF, telefone, data de nascimento e aceites.
- MEI exige os campos de PF mais CNPJ, razão social e endereço fiscal.

## Fora do Escopo

- Criar conta Stripe diretamente no frontend.
- Tratar webhooks Stripe no app.
- Exibir dados bancários sensíveis no app.
