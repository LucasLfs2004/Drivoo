# Instructor Availability Bulk Backend Notes

## Objetivo

Este documento resume os cuidados necessários no backend para suportar o novo módulo de disponibilidade do instrutor sem ambiguidade de regra de negócio.

Ele complementa:

- `docs/specs/instructor-availability-bulk/SPEC.md`
- `docs/specs/instructor-availability-bulk/DESIGN.md`

## Decisão principal de produto

Mudanças de disponibilidade do instrutor não devem cancelar, invalidar nem alterar automaticamente bookings já existentes.

Regra operacional:

- bookings confirmados ou pendentes continuam válidos
- a nova disponibilidade vale para novos agendamentos
- o sistema não deve voltar a ofertar horários removidos pelo instrutor, exceto quando já houver booking preservado naquele período

## Comportamento esperado do backend

### 1. Escrita bulk substitui a configuração futura

Ao receber o payload bulk em modo `SUBSTITUIR`, o backend deve:

- substituir a regra semanal vigente
- substituir as exceções vigentes
- preservar bookings já criados
- recalcular apenas a disponibilidade ofertável para novos agendamentos

Importante:

- `SUBSTITUIR` não significa apagar ou invalidar bookings existentes
- `SUBSTITUIR` atua sobre a malha de disponibilidade futura do instrutor

### 2. Bookings existentes têm prioridade sobre a disponibilidade recém-editada

Se o instrutor reduzir um intervalo que já contém booking, o backend deve:

- manter o booking válido
- não permitir que esse intervalo continue sendo oferecido para novos agendamentos
- retornar informação suficiente para o frontend destacar que existe aula preservada fora da nova janela padrão

### 3. Horários disponíveis para novos agendamentos

Na geração de horários livres para novas reservas, o backend deve considerar:

- regra semanal vigente
- exceções vigentes
- bookings existentes
- buffers ou regras adicionais do domínio, se houver

Resultado esperado:

- booking existente ocupa o horário
- disponibilidade removida deixa de gerar oferta nova
- exceção bloqueada impede oferta nova naquela data
- exceção disponível pode abrir oferta nova adicional

## Recomendações de contrato

### Escrita bulk

Endpoint sugerido:

- `POST /instrutores/me/disponibilidades/lote`

Payload esperado:

```json
{
  "modo": "SUBSTITUIR",
  "itens": [
    {
      "tipo_disponibilidade": "SEMANAL",
      "dias_semana": [2],
      "intervalos": [
        { "hora_inicio": "08:00", "hora_fim": "12:00" }
      ]
    },
    {
      "tipo_disponibilidade": "EXCECAO_BLOQUEIO",
      "datas_especificas": ["2026-04-21"]
    }
  ]
}
```

Pontos que precisam estar fechados no backend:

- dias vazios serão enviados como `intervalos: []` ou omitidos
- índice oficial de `dia_semana`
- timezone oficial usada na persistência e leitura
- formato oficial de hora, preferencialmente `HH:mm`

### Leitura agregada da disponibilidade

Endpoint:

- `GET /instrutores/me/disponibilidades`

Resposta recomendada:

```json
{
  "timezone": "America/Sao_Paulo",
  "semanal": [
    {
      "dia_semana": 2,
      "intervalos": [
        { "hora_inicio": "08:00", "hora_fim": "12:00" }
      ]
    }
  ],
  "excecoes": [
    {
      "tipo_disponibilidade": "EXCECAO_BLOQUEIO",
      "data_especifica": "2026-04-21"
    }
  ]
}
```

### Leitura de bookings afetando o preview

Para o preview mensal do frontend funcionar bem, o backend precisa expor bookings do instrutor em janela de data consultável.

Pode ser por um endpoint existente de `bookings` ou por um novo endpoint resumido. O importante é devolver:

- identificador do booking
- status do booking
- data
- hora de início
- hora de fim
- timezone ou referência consistente com a disponibilidade

Formato recomendado:

```json
{
  "itens": [
    {
      "id": "booking_1",
      "status": "CONFIRMADO",
      "data": "2026-04-15",
      "hora_inicio": "09:00",
      "hora_fim": "10:00"
    }
  ]
}
```

## Campo recomendado para o frontend

Se o backend puder enriquecer a leitura de disponibilidade ou do preview, seria útil informar explicitamente quando existe booking preservado fora da nova disponibilidade.

Exemplo opcional:

```json
{
  "bookings_preservados": [
    {
      "id": "booking_1",
      "data": "2026-04-15",
      "hora_inicio": "09:00",
      "hora_fim": "10:00",
      "motivo": "FORA_DA_DISPONIBILIDADE_ATUAL"
    }
  ]
}
```

Esse campo não é obrigatório se o frontend conseguir derivar isso cruzando disponibilidade e bookings, mas ajuda bastante a reduzir complexidade e divergência.

## Regras de validação no backend

O backend também deve validar:

- `hora_inicio < hora_fim`
- ausência de sobreposição dentro do mesmo dia
- ausência de conflito entre exceção bloqueada e exceção disponível na mesma data
- rejeição de datas passadas para criação de exceção, se essa for a regra oficial do produto
- timezone consistente entre leitura e escrita

## Casos que o backend precisa tratar corretamente

### Caso 1. Redução de disponibilidade com aula já marcada

Cenário:

- semanal anterior: terça `08:00-12:00`
- existe booking em `2026-04-15 09:00-10:00`
- instrutor altera terça para `10:00-12:00`

Esperado:

- booking `09:00-10:00` continua válido
- novos agendamentos em `09:00-10:00` deixam de ser ofertados
- frontend consegue mostrar que existe uma aula preservada fora da nova janela padrão

### Caso 2. Bloqueio por exceção com aula já marcada

Cenário:

- existe booking em `2026-04-21 14:00-15:00`
- instrutor cria `EXCECAO_BLOQUEIO` para `2026-04-21`

Esperado:

- booking continua válido
- novos horários naquele dia deixam de ser ofertados
- frontend destaca o dia como bloqueado com aula preservada

### Caso 3. Exceção disponível adicional

Cenário:

- semanal não possui sábado
- instrutor cria `EXCECAO_DISPONIVEL` em um sábado com `09:00-12:00`

Esperado:

- sábado passa a gerar ofertas novas nessa janela
- leitura agregada retorna a exceção corretamente

## Cuidados de implementação

- não misturar contrato legado por registro unitário com o contrato novo bulk como fontes paralelas permanentes
- documentar na OpenAPI o formato final de leitura e escrita
- manter coerência de timezone em persistência, leitura e geração de slots
- deixar explícito no domínio de agendamento que booking existente sobrevive à redução de disponibilidade

## Checklist rápido para API

- definir rota final de bulk
- definir schema final do GET agregado
- definir schema para listar bookings do preview
- documentar índice de `dia_semana`
- documentar timezone oficial
- garantir que disponibilidade nova afeta só novos agendamentos
- garantir que booking existente não seja cancelado implicitamente
