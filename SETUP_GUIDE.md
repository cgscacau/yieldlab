# 🚀 Guia Rápido de Configuração - InvestFolio

## Passo 1: Configurar Firebase (15 minutos)

### 1.1. Criar Projeto
1. Acesse https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `investfolio` (ou outro nome)
4. Desabilite Google Analytics (opcional)
5. Clique em **"Criar projeto"**

### 1.2. Ativar Firestore
1. Menu lateral > **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Modo: **"Iniciar no modo de teste"** (permite leitura/escrita por 30 dias)
4. Localização: **"southamerica-east1 (São Paulo)"** ou **"us-central1"**
5. Clique em **"Ativar"**

### 1.3. Ativar Authentication
1. Menu lateral > **"Authentication"**
2. Clique em **"Começar"**
3. Aba **"Sign-in method"**
4. Ative **"Email/Password"**
5. (Opcional) Ative **"Google"** ou **"Facebook"**

### 1.4. Obter Credenciais
1. Clique no ícone de **engrenagem** > **"Configurações do projeto"**
2. Role até **"Seus aplicativos"**
3. Clique no ícone **Web** (`</>`)
4. Nome do app: `InvestFolio`
5. **NÃO** marque "Firebase Hosting"
6. Clique em **"Registrar app"**
7. **COPIE** o objeto `firebaseConfig`

### 1.5. Configurar no Código

Edite `/public/static/js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",              // ← Cole aqui
  authDomain: "investfolio-xxxxx.firebaseapp.com",
  projectId: "investfolio-xxxxx",   // ← Importante!
  storageBucket: "investfolio-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 1.6. Configurar Regras de Segurança

No Firestore Database > **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Clique em **"Publicar"**.

---

## Passo 2: Rodar Localmente (5 minutos)

### 2.1. Instalar Dependências

```bash
cd /home/user/webapp
npm install
```

### 2.2. Build

```bash
npm run build
```

### 2.3. Iniciar Servidor

```bash
# Limpa porta
npm run clean-port

# Inicia com PM2
pm2 start ecosystem.config.cjs

# Aguarda 3 segundos
sleep 3

# Testa
curl http://localhost:3000/api/health
```

### 2.4. Acessar

Abra no navegador:
- http://localhost:3000

---

## Passo 3: Deploy no Cloudflare Pages (10 minutos)

### 3.1. Criar Conta Cloudflare

1. Acesse https://dash.cloudflare.com/sign-up
2. Crie conta gratuita
3. Confirme email

### 3.2. Obter API Token

1. Faça login em https://dash.cloudflare.com/
2. Clique no seu perfil (canto superior direito)
3. **"My Profile"** > **"API Tokens"**
4. Clique em **"Create Token"**
5. Escolha template: **"Edit Cloudflare Workers"**
6. Clique em **"Continue to summary"**
7. Clique em **"Create Token"**
8. **COPIE O TOKEN** (você só verá uma vez!)

### 3.3. Configurar Token no Ambiente

```bash
# Opção 1: Exportar variável
export CLOUDFLARE_API_TOKEN=seu_token_aqui

# Opção 2: Login interativo
npx wrangler login
```

### 3.4. Criar Projeto no Cloudflare

```bash
cd /home/user/webapp

npx wrangler pages project create investfolio \
  --production-branch main \
  --compatibility-date 2024-01-01
```

### 3.5. Deploy

```bash
npm run deploy:prod
```

### 3.6. Configurar Variáveis de Ambiente (IMPORTANTE!)

1. Acesse https://dash.cloudflare.com/
2. **Workers & Pages** > Seu projeto
3. **Settings** > **Environment variables**
4. Adicione:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `FIREBASE_PROJECT_ID` | `investfolio-xxxxx` | Production |
| `FIREBASE_API_KEY` | `AIzaSyC...` | Production |

5. Clique em **"Save"**

### 3.7. Redesploy

```bash
npm run deploy:prod
```

### 3.8. Acessar

Sua aplicação estará em:
- `https://investfolio.pages.dev`
- Ou `https://investfolio-xxx.pages.dev`

---

## Passo 4: Testar Aplicação (5 minutos)

### 4.1. Abrir Frontend

Acesse sua URL do Cloudflare Pages.

### 4.2. Criar Conta

1. Clique em **"Login"** ou **"Registrar"**
2. Preencha email e senha
3. Clique em **"Criar Conta"**

### 4.3. Criar Portfólio

1. No dashboard, clique em **"Novo Portfólio"**
2. Nome: `"Minha Carteira"`
3. Descrição: `"Investimentos em ações"`
4. Clique em **"Salvar"**

### 4.4. Adicionar Ativo

1. Clique no portfólio criado
2. Clique em **"Adicionar Ativo"**
3. Preencha:
   - Ticker: `ITUB4`
   - Nome: `Itaú Unibanco PN`
   - Tipo: `Ação`
   - Quantidade: `100`
   - Preço médio: `25.50`
   - Preço atual: `28.00`
4. Clique em **"Salvar"**

### 4.5. Visualizar Métricas

O dashboard mostrará automaticamente:
- Valor investido
- Valor atual
- Rentabilidade
- Dividend yield
- Alocação por ativo

---

## Comandos Úteis

### Desenvolvimento

```bash
# Build
npm run build

# Dev server (Vite)
npm run dev

# Dev server (Wrangler)
npm run dev:sandbox

# Limpar porta
npm run clean-port

# Testar API
npm test
```

### PM2

```bash
# Iniciar
pm2 start ecosystem.config.cjs

# Parar
pm2 stop investfolio

# Reiniciar
pm2 restart investfolio

# Logs
pm2 logs investfolio --nostream

# Status
pm2 list

# Remover
pm2 delete investfolio
```

### Deploy

```bash
# Deploy produção
npm run deploy:prod

# Preview local
npm run preview

# Gerar types
npm run cf-typegen
```

### Wrangler

```bash
# Login
npx wrangler login

# Whoami
npx wrangler whoami

# Deploy manual
npx wrangler pages deploy dist --project-name investfolio

# Logs
npx wrangler pages deployment tail
```

---

## Troubleshooting

### ❌ Erro: "Firebase não configurado"

**Solução**: Edite `public/static/js/firebase-config.js` e adicione suas credenciais.

### ❌ Erro: "Token inválido"

**Solução**: 
1. Faça logout e login novamente
2. Verifique se o token não expirou (1 hora)
3. Verifique se as regras do Firestore permitem acesso

### ❌ Erro: "CORS blocked"

**Solução**: Verifique se a API está rodando e se o CORS está configurado corretamente.

### ❌ Build Error

**Solução**:
```bash
rm -rf node_modules dist .wrangler
npm install
npm run build
```

### ❌ Porta 3000 em uso

**Solução**:
```bash
npm run clean-port
# ou
fuser -k 3000/tcp
```

---

## Checklist de Configuração

- [ ] Firebase projeto criado
- [ ] Firestore ativado
- [ ] Authentication ativado (Email/Senha)
- [ ] Credenciais Firebase copiadas
- [ ] `firebase-config.js` atualizado
- [ ] Regras Firestore publicadas
- [ ] Dependências instaladas (`npm install`)
- [ ] Build executado (`npm run build`)
- [ ] Servidor local testado
- [ ] Cloudflare account criada
- [ ] API Token obtido
- [ ] Projeto Cloudflare criado
- [ ] Deploy realizado
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação testada em produção

---

## Suporte

Se encontrar problemas:
1. Verifique os logs: `pm2 logs investfolio --nostream`
2. Teste a API: `curl http://localhost:3000/api/health`
3. Verifique o console do navegador (F12)
4. Revise este guia desde o início

---

## Próximos Passos

Após configuração:
1. ✅ Explore o dashboard
2. ✅ Adicione ativos e transações
3. ✅ Importe CSV de notas de corretagem
4. ✅ Visualize gráficos e métricas
5. ✅ Configure domínio customizado (opcional)

---

**🎉 Parabéns! Seu sistema de gestão de investimentos está funcionando!**
