# 📡 Exemplos de Requisições API - InvestFolio

## Base URL

```
Local: http://localhost:3000
Produção: https://seu-app.pages.dev
```

---

## 🔐 Autenticação

### Registrar Novo Usuário

```bash
curl -X POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_FIREBASE_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123456",
    "returnSecureToken": true
  }'
```

**Resposta**:
```json
{
  "idToken": "eyJhbGc...",
  "email": "usuario@exemplo.com",
  "localId": "abc123...",
  "expiresIn": "3600"
}
```

### Fazer Login

```bash
curl -X POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_FIREBASE_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123456",
    "returnSecureToken": true
  }'
```

**Resposta**:
```json
{
  "idToken": "eyJhbGc...",
  "email": "usuario@exemplo.com",
  "localId": "abc123...",
  "expiresIn": "3600"
}
```

**⚠️ Importante**: Use o `idToken` no header `Authorization: Bearer TOKEN` em todas as requisições protegidas.

---

## 💼 Portfólios

### Listar Todos os Portfólios

```bash
curl -X GET http://localhost:3000/api/portfolios \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "portfolio_1234567890",
      "userId": "abc123",
      "name": "Minha Carteira",
      "description": "Investimentos em ações",
      "createdAt": "2024-12-31T10:00:00.000Z",
      "updatedAt": "2024-12-31T10:00:00.000Z"
    }
  ]
}
```

### Buscar Portfólio por ID

```bash
curl -X GET http://localhost:3000/api/portfolios/portfolio_1234567890 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Criar Novo Portfólio

```bash
curl -X POST http://localhost:3000/api/portfolios \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carteira de Dividendos",
    "description": "Focada em ações com bons dividendos"
  }'
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": "portfolio_1735654321000",
    "userId": "abc123",
    "name": "Carteira de Dividendos",
    "description": "Focada em ações com bons dividendos",
    "createdAt": "2024-12-31T10:05:21.000Z",
    "updatedAt": "2024-12-31T10:05:21.000Z"
  },
  "message": "Portfólio criado com sucesso"
}
```

### Atualizar Portfólio

```bash
curl -X PATCH http://localhost:3000/api/portfolios/portfolio_1234567890 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Carteira Atualizada",
    "description": "Nova descrição"
  }'
```

### Deletar Portfólio

```bash
curl -X DELETE http://localhost:3000/api/portfolios/portfolio_1234567890 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📊 Ativos

### Listar Ativos de um Portfólio

```bash
curl -X GET http://localhost:3000/api/assets/portfolio_1234567890 \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "asset_1234567890",
      "portfolioId": "portfolio_1234567890",
      "userId": "abc123",
      "ticker": "ITUB4",
      "name": "Itaú Unibanco PN",
      "type": "stock",
      "quantity": 100,
      "averageCost": 25.50,
      "currentPrice": 28.00,
      "sector": "Financeiro",
      "createdAt": "2024-12-31T10:00:00.000Z",
      "updatedAt": "2024-12-31T10:00:00.000Z"
    }
  ]
}
```

### Criar Novo Ativo

```bash
curl -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "portfolio_1234567890",
    "ticker": "PETR4",
    "name": "Petrobras PN",
    "type": "stock",
    "quantity": 50,
    "averageCost": 32.20,
    "currentPrice": 35.50,
    "sector": "Petróleo e Gás"
  }'
```

**Tipos de Ativos**: `stock`, `reit`, `etf`, `fii`, `crypto`, `other`

### Atualizar Ativo

```bash
curl -X PATCH http://localhost:3000/api/assets/asset_1234567890 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "portfolio_1234567890",
    "currentPrice": 29.50,
    "quantity": 150
  }'
```

### Deletar Ativo

```bash
curl -X DELETE "http://localhost:3000/api/assets/asset_1234567890?portfolioId=portfolio_1234567890" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 💸 Transações

### Listar Transações de um Portfólio

```bash
curl -X GET http://localhost:3000/api/transactions/portfolio_1234567890 \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "tx_1234567890",
      "portfolioId": "portfolio_1234567890",
      "assetId": "asset_1234567890",
      "userId": "abc123",
      "type": "buy",
      "ticker": "ITUB4",
      "quantity": 100,
      "price": 25.50,
      "total": 2550.00,
      "fees": 10.00,
      "date": "2024-12-31",
      "notes": "Compra inicial",
      "createdAt": "2024-12-31T10:00:00.000Z"
    }
  ]
}
```

### Registrar Nova Transação - Compra

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "portfolio_1234567890",
    "assetId": "asset_1234567890",
    "type": "buy",
    "ticker": "ITUB4",
    "quantity": 100,
    "price": 25.50,
    "fees": 10.00,
    "date": "2024-12-31",
    "notes": "Compra inicial"
  }'
```

### Registrar Venda

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "portfolio_1234567890",
    "assetId": "asset_1234567890",
    "type": "sell",
    "ticker": "ITUB4",
    "quantity": 50,
    "price": 28.00,
    "fees": 8.00,
    "date": "2024-12-31",
    "notes": "Realização de lucros"
  }'
```

**Tipos de Transação**: `buy`, `sell`, `dividend`, `jscp`, `split`, `bonification`

### Deletar Transação

```bash
curl -X DELETE "http://localhost:3000/api/transactions/tx_1234567890?portfolioId=portfolio_1234567890" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 💰 Dividendos

### Listar Dividendos de um Portfólio

```bash
curl -X GET http://localhost:3000/api/dividends/portfolio_1234567890 \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "div_1234567890",
      "portfolioId": "portfolio_1234567890",
      "assetId": "asset_1234567890",
      "userId": "abc123",
      "ticker": "ITUB4",
      "type": "dividend",
      "amount": 50.00,
      "quantity": 100,
      "pricePerShare": 0.50,
      "paymentDate": "2024-12-31",
      "exDate": "2024-12-20",
      "taxAmount": 0.00,
      "netAmount": 50.00,
      "createdAt": "2024-12-31T10:00:00.000Z"
    }
  ]
}
```

### Registrar Dividendo

```bash
curl -X POST http://localhost:3000/api/dividends \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "portfolio_1234567890",
    "assetId": "asset_1234567890",
    "ticker": "ITUB4",
    "type": "dividend",
    "amount": 50.00,
    "quantity": 100,
    "paymentDate": "2024-12-31",
    "exDate": "2024-12-20"
  }'
```

**Tipos de Provento**: `dividend`, `jscp`, `income`

**Nota**: Para JCP, o sistema calcula automaticamente 15% de IR na fonte.

### Registrar JCP (Juros sobre Capital Próprio)

```bash
curl -X POST http://localhost:3000/api/dividends \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "portfolio_1234567890",
    "assetId": "asset_1234567890",
    "ticker": "PETR4",
    "type": "jscp",
    "amount": 100.00,
    "quantity": 50,
    "paymentDate": "2024-12-31"
  }'
```

**Cálculo automático**:
- `taxAmount = 100.00 * 0.15 = 15.00`
- `netAmount = 100.00 - 15.00 = 85.00`

---

## 📈 Métricas e Analytics

### Obter Métricas Completas do Portfólio

```bash
curl -X GET http://localhost:3000/api/metrics/portfolio_1234567890 \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalInvested": 5100.00,
      "currentValue": 5800.00,
      "totalGain": 700.00,
      "totalGainPercent": 13.73,
      "totalDividends": 150.00,
      "dividendYield": 2.59,
      "monthlyDividends": 12.50,
      "assetAllocation": [
        {
          "ticker": "ITUB4",
          "name": "Itaú Unibanco PN",
          "value": 2800.00,
          "percent": 48.28
        },
        {
          "ticker": "PETR4",
          "name": "Petrobras PN",
          "value": 3000.00,
          "percent": 51.72
        }
      ],
      "sectorAllocation": [
        {
          "sector": "Financeiro",
          "value": 2800.00,
          "percent": 48.28
        },
        {
          "sector": "Petróleo e Gás",
          "value": 3000.00,
          "percent": 51.72
        }
      ]
    },
    "patrimonyEvolution": [
      {
        "month": "2024-01",
        "value": 2560.00
      },
      {
        "month": "2024-02",
        "value": 5110.00
      }
    ],
    "dividendsEvolution": [
      {
        "month": "2024-01",
        "value": 50.00
      },
      {
        "month": "2024-02",
        "value": 100.00
      }
    ]
  }
}
```

---

## 📤 Importação de CSV

### Importar Transações de CSV

```bash
curl -X POST http://localhost:3000/api/import-csv \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "portfolio_1234567890",
    "csvData": "data,ticker,tipo,quantidade,preço\n2024-01-15,ITUB4,buy,100,25.50\n2024-02-10,PETR4,buy,50,32.20"
  }'
```

**Formato CSV**:
```csv
data,ticker,tipo,quantidade,preço,taxas
2024-01-15,ITUB4,buy,100,25.50,10.00
2024-02-10,PETR4,buy,50,32.20,8.00
2024-03-05,ITUB4,dividend,100,0.50,0.00
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "imported": [
      {
        "date": "2024-01-15",
        "ticker": "ITUB4",
        "type": "buy",
        "quantity": 100,
        "price": 25.50
      }
    ],
    "total": 3,
    "errors": []
  },
  "message": "3 transações importadas"
}
```

---

## 🏥 Health Check

### Verificar Status da API

```bash
curl -X GET http://localhost:3000/api/health
```

**Resposta**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-12-31T10:00:00.000Z",
  "service": "InvestFolio API"
}
```

---

## 🔧 Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido ou ausente
- `403 Forbidden` - Sem permissão para acessar recurso
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

---

## 🛡️ Headers Obrigatórios

Todas as requisições protegidas devem incluir:

```
Authorization: Bearer SEU_ID_TOKEN
Content-Type: application/json
```

---

## 📝 Notas Importantes

1. **Token expira em 1 hora** - Faça login novamente quando necessário
2. **Todos os valores monetários** são em Reais (BRL)
3. **Datas** devem estar no formato `YYYY-MM-DD`
4. **Tickers** são convertidos automaticamente para UPPERCASE
5. **Validação** de permissões é feita em cada requisição

---

## 🧪 Testando com Postman/Insomnia

1. Importe os exemplos acima
2. Configure variável de ambiente `{{baseUrl}}`
3. Configure variável `{{token}}` após login
4. Use `{{token}}` no header Authorization
