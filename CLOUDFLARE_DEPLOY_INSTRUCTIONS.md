# ☁️ Deploy no Cloudflare Pages - Instruções Específicas

## 📦 Backup do Projeto

**Download completo do código:**
🔗 https://www.genspark.ai/api/files/s/k8QXH1mM

- Arquivo: `yieldlab-deploy-ready.tar.gz`
- Tamanho: ~200KB
- Conteúdo: Projeto completo pronto para deploy

---

## Opção 1: Deploy via GitHub (Recomendado)

### Problema Atual
❌ Não conseguimos fazer push automático devido às restrições do computador.

### Soluções Disponíveis:

#### **Solução A: Upload Manual no GitHub**

1. **Download do código:**
   - Baixe: https://www.genspark.ai/api/files/s/k8QXH1mM
   - Extraia o arquivo `.tar.gz`

2. **Upload no GitHub via Web:**
   - Acesse: https://github.com/cgscacau/yieldlab
   - Clique em "Add file" > "Upload files"
   - Arraste TODOS os arquivos (exceto `.git/`, `node_modules/`, `dist/`)
   - Commit message: "Initial commit - YieldLab ready for deploy"
   - Commit changes

#### **Solução B: Usar Token de Acesso (Se conseguir rodar comandos)**

Se você conseguir abrir um terminal no Genspark:

```bash
cd /home/user/webapp

# Configure token (você precisará criar um)
git remote set-url origin https://SEU_TOKEN@github.com/cgscacau/yieldlab.git

# Push
git push -u origin main
```

**Como criar token:**
1. GitHub > Settings > Developer settings
2. Personal access tokens > Tokens (classic)
3. Generate new token
4. Marque: `repo`
5. Copie o token

---

## Opção 2: Deploy Direto no Cloudflare (Sem GitHub)

### Você pode fazer deploy direto via Wrangler!

**No Cloudflare Dashboard:**

1. **Baixe o código** localmente: https://www.genspark.ai/api/files/s/k8QXH1mM

2. **Extraia** o arquivo

3. **Instale** Wrangler (se não tiver):
   ```bash
   npm install -g wrangler
   ```

4. **Login** no Cloudflare:
   ```bash
   wrangler login
   ```

5. **Deploy:**
   ```bash
   cd pasta-extraida/webapp
   npm install
   npm run build
   npx wrangler pages deploy dist --project-name yieldlab
   ```

6. **Adicione variáveis de ambiente:**
   ```bash
   npx wrangler pages secret put FIREBASE_PROJECT_ID --project-name yieldlab
   # Digite: yieldlab-76d87

   npx wrangler pages secret put FIREBASE_API_KEY --project-name yieldlab  
   # Digite: AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew
   ```

---

## 🎯 Deploy via Cloudflare Dashboard (Método Manual)

### Passo 1: Preparar arquivos

1. Baixe e extraia: https://www.genspark.ai/api/files/s/k8QXH1mM

2. Abra terminal na pasta extraída

3. Execute:
   ```bash
   npm install
   npm run build
   ```

4. Isso criará a pasta `dist/` com os arquivos prontos

### Passo 2: No Cloudflare Dashboard

Você disse que está com Cloudflare aberto, então:

1. **Workers & Pages** > **Create application**

2. **Pages** tab > **Upload assets**

3. **Project name:** `yieldlab`

4. **Upload** toda a pasta `dist/`:
   - Arraste a pasta `dist/` inteira
   - Ou selecione todos os arquivos dentro de `dist/`

5. **Deploy**

### Passo 3: Configurar Variáveis de Ambiente

Após o primeiro deploy:

1. No projeto `yieldlab`, vá em **Settings**

2. **Environment variables** > **Add variable**

3. Adicione para **Production**:

   | Variable name | Value |
   |--------------|-------|
   | `FIREBASE_PROJECT_ID` | `yieldlab-76d87` |
   | `FIREBASE_API_KEY` | `AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew` |

4. **Save**

5. Vá em **Deployments** > Clique nos 3 pontos do último deploy > **Retry deployment**

---

## ✅ Checklist de Deploy

- [ ] Código baixado/acessível
- [ ] `npm install` executado
- [ ] `npm run build` executado com sucesso
- [ ] Pasta `dist/` criada
- [ ] Projeto criado no Cloudflare
- [ ] Arquivos da pasta `dist/` uploaded
- [ ] Variáveis de ambiente configuradas:
  - [ ] `FIREBASE_PROJECT_ID` = `yieldlab-76d87`
  - [ ] `FIREBASE_API_KEY` = `AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew`
- [ ] Redesploy realizado
- [ ] URL funcionando

---

## 🧪 Testar Após Deploy

### Sua URL será algo como:
```
https://yieldlab.pages.dev
```

### Testes:

1. **API Health:**
   ```bash
   curl https://yieldlab.pages.dev/api/health
   ```
   Deve retornar: `"service": "YieldLab API"`

2. **Landing Page:**
   Abra: `https://yieldlab.pages.dev/`

3. **Firebase:**
   Abra o console (F12):
   ```javascript
   console.log(window.IS_FIREBASE_CONFIGURED)
   // Deve ser: true
   
   console.log(window.FIREBASE_CONFIG.projectId)
   // Deve ser: yieldlab-76d87
   ```

---

## 📁 Estrutura da pasta `dist/` (após build)

```
dist/
├── _worker.js          ← Backend compilado (50KB)
├── _routes.json        ← Rotas do Cloudflare
├── login.html          ← Página de login
└── static/             ← CSS, JS, Assets
    ├── css/
    │   └── main.css
    ├── js/
    │   ├── firebase-config.js  ← COM SUAS CREDENCIAIS
    │   ├── auth.js
    │   ├── api-client.js
    │   └── utils.js
    └── style.css
```

**IMPORTANTE:** Certifique-se que `static/js/firebase-config.js` contém suas credenciais:
- `projectId: "yieldlab-76d87"`
- `apiKey: "AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew"`

---

## 🆘 Problemas Comuns

### ❌ "Project name already exists"
Tente outro nome:
- `yieldlab-app`
- `yieldlab-2024`
- `cgscacau-yieldlab`

### ❌ Build Error
No terminal:
```bash
cd pasta-extraida/webapp
rm -rf node_modules dist
npm install
npm run build
```

### ❌ Firebase não funciona
Verifique se as variáveis de ambiente estão corretas:
- Settings > Environment variables
- Deve ter `FIREBASE_PROJECT_ID` e `FIREBASE_API_KEY`
- Faça Retry deployment após adicionar

### ❌ 404 em páginas
O Cloudflare Pages deve ter:
- `_worker.js` na raiz de `dist/`
- `_routes.json` configurando rotas

---

## 💡 Dica Final

**Se nada funcionar**, me avise e vou:
1. Gerar arquivos individuais para você copiar
2. Criar instruções ainda mais específicas
3. Preparar um ZIP direto do `dist/` pronto

---

## 📞 Links Importantes

- **Código completo:** https://www.genspark.ai/api/files/s/k8QXH1mM
- **Seu GitHub:** https://github.com/cgscacau/yieldlab
- **Firebase Console:** https://console.firebase.google.com/project/yieldlab-76d87
- **Cloudflare Dashboard:** https://dash.cloudflare.com/

---

**Boa sorte com o deploy! Me avise se precisar de ajuda! 🚀**
