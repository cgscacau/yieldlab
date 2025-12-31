# 🚀 Guia de Deploy - YieldLab no Cloudflare Pages

## Status Atual
✅ Projeto pronto para deploy
✅ Firebase configurado
✅ 5 commits prontos
✅ Build testado localmente

---

## Opção 1: Deploy Via GitHub (Recomendado)

### Passo 1: Criar Repositório no GitHub (2 minutos)

1. Acesse: https://github.com/new
2. **Nome do repositório**: `yieldlab`
3. **Descrição**: `Sistema de Gestão de Investimentos`
4. **Visibilidade**: Public ou Private (sua escolha)
5. ❌ **NÃO** marque "Initialize with README"
6. Clique em **"Create repository"**

### Passo 2: Push do Código (1 minuto)

Após criar o repositório, você verá comandos. Use estes:

```bash
cd /home/user/webapp

# Adicionar remote (substitua SEU_USUARIO pelo seu username GitHub)
git remote add origin https://github.com/SEU_USUARIO/yieldlab.git

# Push do código
git branch -M main
git push -u origin main
```

**Se pedir credenciais:**
- Username: seu username GitHub
- Password: use um **Personal Access Token** (não sua senha)

**Como criar Personal Access Token:**
1. GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token
3. Marque: `repo` (acesso completo)
4. Copie o token e use como senha

### Passo 3: Conectar Cloudflare Pages ao GitHub (5 minutos)

1. Acesse: https://dash.cloudflare.com/
2. Clique em **"Workers & Pages"**
3. Clique em **"Create application"**
4. Aba **"Pages"** > **"Connect to Git"**
5. Autorize acesso ao GitHub
6. Selecione o repositório **"yieldlab"**
7. Configure o build:
   - **Project name**: `yieldlab`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
8. Clique em **"Save and Deploy"**

### Passo 4: Configurar Variáveis de Ambiente (2 minutos)

Após o primeiro deploy:

1. No Cloudflare Pages, vá em **Settings** > **Environment variables**
2. Clique em **"Add variable"**
3. Adicione estas variáveis para **Production**:

| Variable name | Value |
|--------------|-------|
| `FIREBASE_PROJECT_ID` | `yieldlab-76d87` |
| `FIREBASE_API_KEY` | `AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew` |

4. Clique em **"Save"**
5. Vá em **Deployments** > **Três pontos** > **"Retry deployment"**

### Passo 5: Acessar seu App! 🎉

Após o deploy (2-3 minutos):
- URL será algo como: `https://yieldlab.pages.dev`
- Ou: `https://yieldlab-xxx.pages.dev`

---

## Opção 2: Deploy Direto via Wrangler (Mais Rápido)

### Passo 1: Instalar Wrangler Globalmente (Opcional)

```bash
npm install -g wrangler
```

### Passo 2: Login no Cloudflare

```bash
npx wrangler login
```

Isso abrirá o navegador para você fazer login.

### Passo 3: Criar Projeto no Cloudflare

```bash
cd /home/user/webapp

npx wrangler pages project create yieldlab \
  --production-branch main \
  --compatibility-date 2024-01-01
```

### Passo 4: Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name yieldlab
```

### Passo 5: Configurar Variáveis

```bash
# Firebase Project ID
echo "yieldlab-76d87" | npx wrangler pages secret put FIREBASE_PROJECT_ID --project-name yieldlab

# Firebase API Key
echo "AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew" | npx wrangler pages secret put FIREBASE_API_KEY --project-name yieldlab
```

---

## Troubleshooting

### ❌ Erro: "Project name already exists"

Se o nome `yieldlab` já estiver em uso, adicione um sufixo:
- `yieldlab-2024`
- `yieldlab-app`
- `meu-yieldlab`

### ❌ Erro: "Build failed"

Verifique se todas as dependências foram instaladas:
```bash
cd /home/user/webapp
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ❌ Erro: "GitHub authentication failed"

Use Personal Access Token em vez de senha:
- GitHub > Settings > Developer settings > Personal access tokens
- Generate new token (classic)
- Marque: `repo`
- Use o token como senha

### ❌ Página 404 no Cloudflare

1. Verifique se o build gerou arquivos em `dist/`
2. Verifique se `_worker.js` está em `dist/`
3. Tente redesploy

---

## Verificações Pós-Deploy

### 1. Testar API Health

```bash
curl https://yieldlab.pages.dev/api/health
```

Deve retornar:
```json
{
  "success": true,
  "status": "healthy",
  "service": "YieldLab API"
}
```

### 2. Testar Firebase Connection

Abra no navegador:
```
https://yieldlab.pages.dev/
```

Abra o Console (F12) e digite:
```javascript
console.log('Firebase Configured:', window.IS_FIREBASE_CONFIGURED);
console.log('Project ID:', window.FIREBASE_CONFIG.projectId);
```

Deve mostrar:
```
Firebase Configured: true
Project ID: yieldlab-76d87
```

### 3. Testar Registro de Usuário

1. Acesse: `https://yieldlab.pages.dev/login.html`
2. Clique na aba "Registrar"
3. Preencha: nome, email, senha
4. Clique em "Criar Conta"

Se funcionar, você verá: ✅ "Conta criada com sucesso!"

---

## Próximos Passos Após Deploy

1. ✅ Domínio Customizado (Opcional)
   - Cloudflare Pages > Custom domains
   - Adicione: `seudominio.com`
   
2. ✅ Configurar Regras Firestore
   - Firebase Console > Firestore Database > Rules
   - Adicione regras de segurança por usuário

3. ✅ Monitoramento
   - Cloudflare Pages > Analytics
   - Veja acessos, erros, performance

4. ✅ CI/CD Automático
   - Após conectar GitHub, cada push em `main` faz deploy automático!

---

## URLs Importantes

- **Firebase Console**: https://console.firebase.google.com/project/yieldlab-76d87
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **GitHub Repo**: https://github.com/SEU_USUARIO/yieldlab
- **Documentação Cloudflare Pages**: https://developers.cloudflare.com/pages/

---

## Suporte

Se encontrar problemas:
1. Verifique logs no Cloudflare Pages > Deployments
2. Teste build local: `npm run build`
3. Verifique variáveis de ambiente no Cloudflare
4. Consulte README.md do projeto

---

**🎉 Parabéns! Seu app estará online em minutos!**
