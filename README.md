# 💰 YieldLab - Sistema de Gestão de Investimentos

Sistema completo de gestão de investimentos desenvolvido com **Hono Framework**, **Firebase** e **Cloudflare Pages**. Uma alternativa moderna e gratuita ao Smartfolio/Meus Dividendos.

## 🚀 Demo Online

- **Sandbox**: https://3000-ig8mf8il3ksar3mnxnn5e-82b888ba.sandbox.novita.ai
- **API Health**: https://3000-ig8mf8il3ksar3mnxnn5e-82b888ba.sandbox.novita.ai/api/health
- **GitHub**: https://github.com/cgscacau/yieldlab
- **Backup**: https://www.genspark.ai/api/files/s/udhE94Xa

## ✨ Funcionalidades

### ✅ Implementadas

- ✅ **Autenticação Firebase** (Email/Senha)
- ✅ **API REST Completa** com Hono Framework
- ✅ **Gestão de Portfólios** (CRUD completo)
- ✅ **Gestão de Ativos** (Ações, FIIs, ETFs, Cripto)
- ✅ **Histórico de Transações** (Compra, Venda, Bonificação, Split)
- ✅ **Controle de Proventos** (Dividendos, JCP)
- ✅ **Cálculos Automáticos**:
  - Custo médio
  - Valor de mercado
  - Rentabilidade (R$ e %)
  - Dividend Yield
  - Imposto de Renda
  - Alocação por ativo e setor
- ✅ **Importação de CSV**
- ✅ **Métricas e Analytics**
- ✅ **Evolução Patrimonial**
- ✅ **Evolução de Proventos**

### 🚧 Frontend (Em Desenvolvimento)

As páginas HTML já estão estruturadas e os módulos JavaScript prontos:
- Login e Registro
- Dashboard com gráficos (Chart.js)
- Gestão de carteiras e ativos
- Relatórios exportáveis

## 🏗️ Arquitetura

### Backend
- **Framework**: Hono (TypeScript/JavaScript)
- **Runtime**: Cloudflare Workers Edge
- **Database**: Firebase Firestore (NoSQL)
- **Auth**: Firebase Authentication REST API
- **Deploy**: Cloudflare Pages

### Frontend
- **HTML5** + **CSS3** (Tailwind via CDN)
- **Vanilla JavaScript** (sem frameworks)
- **Chart.js** para gráficos
- **Firebase SDK Web** para autenticação

### Estrutura de Arquivos

```
webapp/
├── src/
│   ├── index.tsx              # Aplicação principal Hono
│   ├── routes/                # Rotas da API
│   │   ├── portfolios.ts      # CRUD de portfólios
│   │   ├── assets.ts          # CRUD de ativos
│   │   ├── transactions.ts    # CRUD de transações
│   │   └── dividends.ts       # CRUD de dividendos
│   ├── services/
│   │   └── firebase.ts        # Client Firestore REST API
│   ├── middleware/
│   │   └── auth.ts            # Middleware de autenticação
│   ├── utils/
│   │   └── calculations.ts    # Cálculos financeiros
│   └── types/
│       └── index.ts           # Interfaces TypeScript
├── public/static/
│   ├── css/
│   │   └── main.css           # Estilos customizados
│   └── js/
│       ├── firebase-config.js # Configuração Firebase
│       ├── auth.js            # Módulo de autenticação
│       ├── api-client.js      # Client da API
│       └── utils.js           # Utilitários
├── ecosystem.config.cjs       # Configuração PM2
├── vite.config.ts             # Configuração Vite
├── wrangler.jsonc             # Configuração Cloudflare
├── package.json               # Dependências
└── README.md                  # Este arquivo
```

## 📊 Modelos de Dados

### Portfolio
```typescript
{
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Asset
```typescript
{
  id: string;
  portfolioId: string;
  userId: string;
  ticker: string;
  name: string;
  type: 'stock' | 'reit' | 'etf' | 'fii' | 'crypto' | 'other';
  quantity: number;
  averageCost: number;
  currentPrice: number;
  sector?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Transaction
```typescript
{
  id: string;
  portfolioId: string;
  assetId: string;
  userId: string;
  type: 'buy' | 'sell' | 'dividend' | 'jscp' | 'split' | 'bonification';
  ticker: string;
  quantity: number;
  price: number;
  total: number;
  fees: number;
  date: string;
  notes?: string;
  createdAt: string;
}
```

### Dividend
```typescript
{
  id: string;
  portfolioId: string;
  assetId: string;
  userId: string;
  ticker: string;
  type: 'dividend' | 'jscp' | 'income';
  amount: number;
  quantity: number;
  pricePerShare: number;
  paymentDate: string;
  exDate?: string;
  taxAmount: number;
  netAmount: number;
  createdAt: string;
}
```

## 🔌 Endpoints da API

### Portfolios
- `GET /api/portfolios` - Lista portfólios do usuário
- `GET /api/portfolios/:id` - Busca portfólio específico
- `POST /api/portfolios` - Cria portfólio
- `PATCH /api/portfolios/:id` - Atualiza portfólio
- `DELETE /api/portfolios/:id` - Deleta portfólio

### Assets
- `GET /api/assets/:portfolioId` - Lista ativos do portfólio
- `POST /api/assets` - Cria ativo
- `PATCH /api/assets/:id` - Atualiza ativo
- `DELETE /api/assets/:id` - Deleta ativo

### Transactions
- `GET /api/transactions/:portfolioId` - Lista transações
- `POST /api/transactions` - Registra transação
- `DELETE /api/transactions/:id` - Deleta transação

### Dividends
- `GET /api/dividends/:portfolioId` - Lista dividendos
- `POST /api/dividends` - Registra dividendo

### Metrics
- `GET /api/metrics/:portfolioId` - Calcula métricas do portfólio

### Import
- `POST /api/import-csv` - Importa dados via CSV

### Health
- `GET /api/health` - Status da API

## 🚀 Configuração e Deploy

### 1. Configurar Firebase

#### 1.1. Criar Projeto Firebase
1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Escolha um nome (ex: `yieldlab`)
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

#### 1.2. Ativar Firestore Database
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (ou modo produção com regras)
4. Selecione localização: `southamerica-east1` (São Paulo) ou `us-central1`
5. Clique em "Ativar"

#### 1.3. Ativar Authentication
1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Na aba "Sign-in method", ative:
   - ✅ **Email/Password**
   - 🔘 Google (opcional)
   - 🔘 Facebook (opcional)

#### 1.4. Obter Credenciais
1. Vá em **Configurações do projeto** (ícone engrenagem)
2. Role até "Seus aplicativos"
3. Clique no ícone **Web** (`</>`)
4. Registre o app (nome: `YieldLab`)
5. Copie o objeto `firebaseConfig`
6. Cole em `public/static/js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "yieldlab-xxxxx.firebaseapp.com",
  projectId: "yieldlab-xxxxx",
  storageBucket: "yieldlab-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

#### 1.5. Configurar Regras de Segurança Firestore

Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /portfolios/{portfolioId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /assets/{assetId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /transactions/{txId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /dividends/{divId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 2. Rodar Localmente

```bash
# 1. Clone ou baixe o projeto
cd /home/user/webapp

# 2. Instale dependências (se necessário)
npm install

# 3. Configure Firebase (edite public/static/js/firebase-config.js)

# 4. Build
npm run build

# 5. Inicie servidor
pm2 start ecosystem.config.cjs

# 6. Teste
curl http://localhost:3000/api/health

# 7. Acesse no navegador
# http://localhost:3000
```

### 3. Deploy no Cloudflare Pages

#### 3.1. Preparar Cloudflare

1. Crie conta em https://dash.cloudflare.com/
2. Vá em **Workers & Pages**
3. Obtenha API Token:
   - Meu perfil > API Tokens
   - Create Token > Edit Cloudflare Workers
   - Copie o token

#### 3.2. Configurar Token

```bash
# Configure token no ambiente
export CLOUDFLARE_API_TOKEN=seu_token_aqui

# Ou use wrangler login
npx wrangler login
```

#### 3.3. Criar Projeto

```bash
# Cria projeto no Cloudflare Pages
npx wrangler pages project create yieldlab \
  --production-branch main \
  --compatibility-date 2024-01-01
```

#### 3.4. Deploy

```bash
# Deploy para produção
npm run deploy:prod

# Ou manualmente
npm run build
npx wrangler pages deploy dist --project-name investfolio
```

#### 3.5. Configurar Variáveis de Ambiente

No painel do Cloudflare Pages:
1. Settings > Environment variables
2. Adicione:
   - `FIREBASE_PROJECT_ID` = seu_project_id
   - `FIREBASE_API_KEY` = sua_api_key

### 4. GitHub (Opcional)

```bash
# Inicializar repositório (se ainda não fez)
git init
git add .
git commit -m "Initial commit - InvestFolio"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/investfolio.git
git push -u origin main
```

## 📝 Exemplos de Uso da API

### Registrar Usuário
```bash
curl -X POST https://seu-app.pages.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }'
```

### Criar Portfólio
```bash
curl -X POST https://seu-app.pages.dev/api/portfolios \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Carteira",
    "description": "Investimentos em ações"
  }'
```

### Adicionar Ativo
```bash
curl -X POST https://seu-app.pages.dev/api/assets \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "portfolio_123",
    "ticker": "ITUB4",
    "name": "Itaú Unibanco PN",
    "type": "stock",
    "quantity": 100,
    "averageCost": 25.50,
    "currentPrice": 28.00,
    "sector": "Financeiro"
  }'
```

### Registrar Transação
```bash
curl -X POST https://seu-app.pages.dev/api/transactions \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "portfolio_123",
    "assetId": "asset_456",
    "type": "buy",
    "ticker": "ITUB4",
    "quantity": 100,
    "price": 25.50,
    "fees": 10.00,
    "date": "2024-12-31",
    "notes": "Compra inicial"
  }'
```

### Buscar Métricas
```bash
curl https://seu-app.pages.dev/api/metrics/portfolio_123 \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 📤 Formato CSV para Importação

```csv
data,ticker,tipo,quantidade,preço,taxas
2024-01-15,ITUB4,buy,100,25.50,10.00
2024-02-10,PETR4,buy,50,32.20,8.00
2024-03-05,ITUB4,dividend,100,0.50,0.00
```

Campos:
- `data`: YYYY-MM-DD
- `ticker`: Código do ativo
- `tipo`: `buy`, `sell`, `dividend`, `jscp`
- `quantidade`: Número de cotas/ações
- `preço`: Preço unitário
- `taxas`: Taxas de corretagem (opcional)

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Servidor de desenvolvimento (Vite)
npm run dev:sandbox      # Wrangler dev no sandbox (porta 3000)
npm run build            # Build para produção
npm run preview          # Preview local do build
npm run deploy           # Build + Deploy
npm run deploy:prod      # Deploy em produção
npm run cf-typegen       # Gera types do Cloudflare
npm run clean-port       # Limpa porta 3000
npm test                 # Testa servidor local
```

## 🔐 Segurança

- ✅ Autenticação obrigatória em todas as rotas protegidas
- ✅ Validação de token Firebase em cada requisição
- ✅ Regras de segurança Firestore por usuário
- ✅ HTTPS obrigatório em produção
- ✅ CORS configurado para domínios específicos
- ✅ Sanitização de inputs
- ✅ Rate limiting (via Cloudflare)

## 📊 Performance

- ⚡ Edge computing (latência < 50ms)
- ⚡ Build otimizado com Vite
- ⚡ CDN global Cloudflare
- ⚡ Lazy loading de módulos
- ⚡ Compressão gzip/brotli automática

## 🌐 Tecnologias Utilizadas

### Backend
- **Hono** 4.11.3 - Web framework
- **TypeScript** 5.x - Type safety
- **Vite** 6.x - Build tool
- **Wrangler** 4.x - Cloudflare CLI
- **Firebase** - Firestore + Auth (REST API)

### Frontend
- **Vanilla JavaScript** - Sem frameworks
- **Tailwind CSS** (CDN) - Estilos
- **Chart.js** (CDN) - Gráficos
- **Font Awesome** (CDN) - Ícones
- **Firebase SDK Web** - Autenticação

### Infrastructure
- **Cloudflare Pages** - Hosting
- **Cloudflare Workers** - Edge runtime
- **Firebase** - Database + Auth

## 📈 Próximos Passos

- [ ] Completar páginas HTML do dashboard
- [ ] Integração com API de cotações (Alpha Vantage, Yahoo Finance)
- [ ] Gráficos interativos com Chart.js
- [ ] Exportação de relatórios em PDF
- [ ] Notificações por email (SendGrid)
- [ ] Modo dark
- [ ] PWA (Progressive Web App)
- [ ] Testes automatizados
- [ ] CI/CD com GitHub Actions

## 🐛 Troubleshooting

### Erro: "Firebase não configurado"
- Edite `public/static/js/firebase-config.js`
- Adicione suas credenciais Firebase

### Erro: "Token inválido"
- Verifique se o token não expirou
- Faça login novamente

### Erro: "CORS blocked"
- Verifique configuração CORS no backend
- Em produção, configure domínios permitidos

### Build Error
```bash
rm -rf node_modules dist .wrangler
npm install
npm run build
```

## 📄 Licença

MIT License - use livremente!

## 👨‍💻 Autor

Sistema desenvolvido com Hono + Firebase + Cloudflare Pages.

---

**⭐ Se gostou, dê uma estrela no GitHub!**

**📧 Dúvidas? Abra uma issue!**
# Trigger rebuild
