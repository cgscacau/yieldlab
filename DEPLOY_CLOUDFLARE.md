# 🚀 Deploy para Cloudflare Pages - YieldLab

## ✅ Preparação Completa

- ✅ Código limpo e organizado
- ✅ Build de produção gerado (`dist/` folder)
- ✅ Git commit realizado
- ✅ Código enviado para GitHub (https://github.com/cgscacau/yieldlab)
- ✅ Projeto pronto para deploy

---

## 📋 Passos para Deploy

### Método 1: Deploy via Wrangler CLI (Recomendado)

#### 1. Configure sua API Key do Cloudflare
1. Vá para a aba **Deploy** no sidebar
2. Siga as instruções para criar um token da API Cloudflare
3. Salve o token

#### 2. Execute o deploy
Após configurar a API key na aba Deploy, execute:

```bash
cd /home/user/webapp
npx wrangler pages deploy dist --project-name yieldlab
```

---

### Método 2: Deploy via Dashboard do Cloudflare (Alternativo)

#### 1. Acesse o Cloudflare Dashboard
- Vá para: https://dash.cloudflare.com/
- Faça login na sua conta

#### 2. Crie um novo projeto Pages
1. Clique em **Workers & Pages**
2. Clique em **Create application**
3. Selecione **Pages**
4. Escolha **Connect to Git**

#### 3. Conecte o repositório GitHub
1. Selecione **GitHub**
2. Autorize o Cloudflare a acessar seus repositórios
3. Selecione o repositório: **cgscacau/yieldlab**
4. Configure o projeto:
   - **Project name**: `yieldlab`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

#### 4. Configure as variáveis de ambiente
Na seção **Environment variables**, adicione:

```
FIREBASE_PROJECT_ID = yieldlab-76d87
FIREBASE_API_KEY = AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew
BRAPI_API_TOKEN = neCCcmX2AynTnvLpiH25TY
```

#### 5. Deploy
- Clique em **Save and Deploy**
- O Cloudflare irá:
  - Clonar o repositório
  - Instalar dependências (`npm install`)
  - Executar build (`npm run build`)
  - Fazer deploy do conteúdo de `dist/`

---

## 🌐 URLs do Projeto

### Sandbox (Desenvolvimento)
- **URL**: https://3000-ig8mf8il3ksar3mnxnn5e-82b888ba.sandbox.novita.ai
- **API**: https://3000-ig8mf8il3ksar3mnxnn5e-82b888ba.sandbox.novita.ai/api/health

### GitHub
- **Repositório**: https://github.com/cgscacau/yieldlab

### Cloudflare Pages (Após deploy)
- **Produção**: https://yieldlab.pages.dev (ou seu domínio customizado)
- **Branch**: https://main.yieldlab.pages.dev

---

## 🔧 Comandos Úteis

```bash
# Build local
npm run build

# Preview local do build
npm run preview

# Deploy para produção (após configurar API key)
npm run deploy:prod

# Verificar status do Cloudflare
npx wrangler whoami

# Listar projetos
npx wrangler pages project list

# Ver logs do deploy
npx wrangler pages deployment list --project-name yieldlab
```

---

## ✨ Recursos Implantados

### Backend (Hono + Cloudflare Workers)
- ✅ API REST completa
- ✅ Autenticação Firebase
- ✅ Gestão de portfólios
- ✅ Gestão de ativos e transações
- ✅ Cálculos de métricas financeiras
- ✅ Integração com Brapi para cotações

### Frontend
- ✅ Landing page responsiva
- ✅ Sistema de autenticação (login/registro)
- ✅ Dashboard com gráficos
- ✅ Gestão de carteiras
- ✅ Análise de investimentos

### Integrações
- ✅ Firebase Firestore (banco de dados)
- ✅ Firebase Authentication
- ✅ Brapi API (cotações de ações/FIIs)

---

## 🎯 Próximos Passos Após Deploy

1. **Teste a aplicação em produção**
   - Acesse a URL do Cloudflare Pages
   - Teste autenticação
   - Crie um portfólio de teste
   - Adicione ativos

2. **Configure domínio customizado** (opcional)
   ```bash
   npx wrangler pages domain add seudominio.com --project-name yieldlab
   ```

3. **Configure HTTPS** (automático no Cloudflare)
   - Cloudflare fornece SSL gratuito
   - HTTPS já está habilitado automaticamente

4. **Monitore performance**
   - Acesse Analytics no dashboard do Cloudflare
   - Verifique logs e métricas de uso

---

## 🐛 Troubleshooting

### Erro: "API Key não configurada"
- Configure a API key na aba **Deploy**
- Execute `npx wrangler whoami` para verificar

### Erro: "Build falhou"
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente
- Teste `npm run build` localmente primeiro

### Erro: "Variáveis de ambiente não encontradas"
- Adicione as variáveis no dashboard do Cloudflare Pages
- Seção: Settings > Environment variables

### Erro: "Firebase não conectado"
- Verifique se as variáveis do Firebase estão corretas
- Teste a API localmente primeiro

---

## 📊 Estrutura do Deploy

```
yieldlab/
├── dist/                      # Pasta de build (enviada para Cloudflare)
│   ├── _worker.js            # Worker do Cloudflare (backend Hono)
│   ├── _routes.json          # Configuração de rotas
│   ├── dashboard.html        # Página do dashboard
│   ├── login.html            # Página de login
│   └── static/               # Arquivos estáticos (CSS/JS)
│       ├── css/
│       └── js/
├── src/                      # Código fonte TypeScript
├── public/                   # Arquivos estáticos originais
├── wrangler.jsonc            # Configuração do Cloudflare
├── package.json              # Dependências e scripts
└── README.md                 # Documentação principal
```

---

## ✅ Checklist de Deploy

- [x] Build de produção gerado
- [x] Código commitado no Git
- [x] Código enviado para GitHub
- [ ] API Key do Cloudflare configurada
- [ ] Deploy executado via Wrangler ou Dashboard
- [ ] Aplicação testada em produção
- [ ] Domínio customizado configurado (opcional)

---

**🎉 Seu aplicativo está pronto para o mundo!**

Após o deploy, você terá um aplicativo de gestão de investimentos profissional, rodando globalmente na edge network do Cloudflare, com latência ultra-baixa e escalabilidade automática!
