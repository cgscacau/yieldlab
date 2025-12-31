# ⚡ Deploy Rápido - YieldLab

## 🎯 Opção Mais Rápida: GitHub + Cloudflare (10 minutos)

### 1️⃣ Criar Repositório GitHub (2 min)
```
1. Acesse: https://github.com/new
2. Nome: yieldlab
3. Public ou Private
4. NÃO inicialize com README
5. Create repository
```

### 2️⃣ Push do Código (1 min)
```bash
cd /home/user/webapp

# Adicione seu username GitHub aqui ↓
git remote add origin https://github.com/SEU_USUARIO/yieldlab.git

git push -u origin main
```

**Se pedir senha:** Use Personal Access Token
- GitHub > Settings > Developer settings > Tokens > Generate
- Marque: `repo`

### 3️⃣ Deploy no Cloudflare (5 min)
```
1. https://dash.cloudflare.com/
2. Workers & Pages > Create > Pages > Connect to Git
3. Autorize GitHub
4. Selecione: yieldlab
5. Configure:
   - Project name: yieldlab
   - Branch: main
   - Build command: npm run build
   - Output: dist
6. Save and Deploy
```

### 4️⃣ Variáveis de Ambiente (2 min)
No Cloudflare Pages > Settings > Environment variables:

```
FIREBASE_PROJECT_ID = yieldlab-76d87
FIREBASE_API_KEY = AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew
```

Salve e faça Retry deployment.

### 5️⃣ Pronto! 🎉
```
Sua URL: https://yieldlab.pages.dev
```

---

## 🔧 Alternativa: Wrangler CLI (Sem GitHub)

```bash
# Login
npx wrangler login

# Deploy
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name yieldlab

# Variáveis
npx wrangler pages secret put FIREBASE_PROJECT_ID --project-name yieldlab
# Digite: yieldlab-76d87

npx wrangler pages secret put FIREBASE_API_KEY --project-name yieldlab
# Digite: AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew
```

---

## ✅ Checklist Rápido

- [ ] Repositório GitHub criado
- [ ] Código pushed para GitHub
- [ ] Cloudflare conectado ao GitHub
- [ ] Build configurado (npm run build → dist)
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy realizado com sucesso
- [ ] URL funcionando

---

## 🧪 Testes Pós-Deploy

```bash
# API Health
curl https://yieldlab.pages.dev/api/health

# Deve retornar: "service": "YieldLab API"
```

Browser:
```
https://yieldlab.pages.dev/
https://yieldlab.pages.dev/login.html
```

---

## 📁 Arquivos Importantes

- `DEPLOY_GUIDE.md` - Guia completo e detalhado
- `README.md` - Documentação geral
- `SETUP_GUIDE.md` - Setup Firebase
- `API_EXAMPLES.md` - Exemplos de API

---

**Dúvidas? Veja DEPLOY_GUIDE.md para instruções detalhadas!**
