# Drivoo — Spec da Tela de Busca de Instrutores

## 1. Objetivo da Feature

Permitir que alunos encontrem instrutores de direção próximos com base na sua localização atual, visualizando as opções disponíveis em:

- **Modo Lista** (principal)
- **Modo Mapa** (visual complementar)

A tela deve ajudar o aluno a **comparar e escolher o melhor instrutor**, considerando:

- proximidade
- avaliação
- preço
- disponibilidade
- tipo de carro/aula

---

# 2. Estrutura da Tela

A tela é composta por:

1. **Campo de busca**
2. **Botão de filtros**
3. **Alternador de visualização**
   - Lista
   - Mapa
4. **Resultado da busca**
5. **Cards de instrutor**
6. **Mapa com pins (modo mapa)**

---

# 3. Integração com API

## 3.1 Carregamento de dados

- [ ] A lista de instrutores deve ser carregada via API
- [ ] Deve existir estado de **loading** durante a requisição
- [ ] Deve existir estado de **erro** caso a API falhe
- [ ] Deve existir estado de **lista vazia** quando não houver instrutores

---

## 3.2 Normalização de dados

Antes de renderizar os dados:

- [ ] Campos opcionais devem ser tratados
- [ ] Campos nulos não devem quebrar a interface
- [ ] Valores devem ser normalizados para o formato esperado

### Exemplos

| Campo | Tratamento |
|------|-----------|
| preço | formatar para `R$ XX/h` |
| distância | exibir em `km` |
| avaliações | evitar mostrar `0` como nota |
| avatar | fallback para iniciais |

---

# 4. Estrutura esperada do Instrutor (exemplo)

```json
{
  "id": "uuid",
  "name": "Maria Santos",
  "rating": 4.8,
  "reviewsCount": 32,
  "pricePerHour": 80,
  "distanceKm": 2.6,
  "vehicleType": "automatico",
  "tags": ["paciente", "experiente", "aulas-noturnas"],
  "availability": "consultar",
  "location": {
    "lat": -23.55,
    "lng": -46.63
  }
}