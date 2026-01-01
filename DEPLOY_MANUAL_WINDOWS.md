# 🚀 Deploy Manual do Windows

## 🎯 Situação Atual

- ✅ Código está no GitHub
- ❌ Cloudflare não faz rebuild automático
- ❌ Não tem opção "Retry deployment"
- ✅ **Solução:** Deploy direto do seu PC

---

## 📋 Pré-requisitos

### **1. Verificar se tem Node.js instalado**

```powershell
node --version
npm --version
```

**Se não tiver instalado:**
- Baixe: https://nodejs.org/
- Instale a versão LTS (recomendada)
- Reinicie o PowerShell

---

## 🚀 MÉTODO 1: Script Automático (Recomendado)

### **Passo 1: Baixar o código completo**

1. **Download:** https://www.genspark.ai/api/files/s/Itlz3B4q
2. **Extrair** para: `C:\Users\Usuario\Documents\GitHub\yieldlab\`
3. **Ou usar o código que já está lá**

### **Passo 2: Executar o script**

```powershell
cd C:\Users\Usuario\Documents\GitHub\yieldlab
.\DEPLOY_FROM_WINDOWS.bat
```

O script vai:
1. ✅ Verificar Node.js
2. ✅ Instalar dependências (`npm install`)
3. ✅ Compilar código (`npm run build`)
4. ✅ Fazer deploy no Cloudflare
5. ✅ Mostrar URL de teste

---

## 🚀 MÉTODO 2: Passo a Passo Manual

Se preferir fazer manual:

### **Passo 1: Abrir PowerShell**

```powershell
# Navegar até a pasta
cd C:\Users\Usuario\Documents\GitHub\yieldlab

# Verificar conteúdo
ls
```

### **Passo 2: Instalar dependências**

```powershell
npm install
```

**Aguarde:** ~30 segundos (download de pacotes)

### **Passo 3: Build**

```powershell
npm run build
```

**Aguarde:** ~5 segundos (compilação TypeScript)

**Resultado esperado:**
```
vite v6.4.1 building for production...
✓ 45 modules transformed.
dist/_worker.js  50.95 kB
✓ built in 574ms
```

### **Passo 4: Login no Wrangler (primeira vez)**

```powershell
npx wrangler login
```

**O que vai acontecer:**
1. Abre navegador automaticamente
2. Mostra página de autorização Cloudflare
3. Clique em "Allow" / "Autorizar"
4. Volta para o terminal automaticamente

### **Passo 5: Deploy**

```powershell
npx wrangler pages deploy dist --project-name yieldlab
```

**Aguarde:** ~30 segundos

**Resultado esperado:**
```
✨ Success! Uploaded 3 files (X.XX sec)

✨ Deployment complete! Take a peek over at
   https://xxxxxxxx.yieldlab.pages.dev
```

---

## ✅ Teste Após Deploy

### **PowerShell:**
```powershell
curl https://yieldlab.cgscacau.workers.dev/api/health
```

### **Navegador:**
```
https://yieldlab.cgscacau.workers.dev/api/health
```

**Deve retornar:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-12-31T...",
  "service": "YieldLab API"
}
```

---

## 🔧 Solução de Problemas

### **Erro: "node não é reconhecido"**

**Causa:** Node.js não instalado

**Solução:**
1. Baixe: https://nodejs.org/
2. Instale versão LTS
3. Reinicie PowerShell
4. Teste: `node --version`

---

### **Erro: "wrangler: command not found"**

**Causa:** Wrangler não instalado globalmente

**Solução:**
```powershell
# Usar npx (sem instalar globalmente)
npx wrangler pages deploy dist --project-name yieldlab

# Ou instalar globalmente
npm install -g wrangler
wrangler pages deploy dist --project-name yieldlab
```

---

### **Erro: "Failed to publish"**

**Causa:** Não autenticado ou projeto não existe

**Solução:**
```powershell
# 1. Fazer login novamente
npx wrangler login

# 2. Verificar se está logado
npx wrangler whoami

# 3. Tentar deploy novamente
npx wrangler pages deploy dist --project-name yieldlab
```

---

### **Erro: "Project not found"**

**Causa:** Projeto `yieldlab` não existe no Cloudflare

**Solução:**

**Opção A: Criar projeto via CLI**
```powershell
npx wrangler pages project create yieldlab --production-branch main
npx wrangler pages deploy dist --project-name yieldlab
```

**Opção B: Usar nome diferente**
```powershell
# Se yieldlab já existe com outro nome
npx wrangler pages deploy dist --project-name yieldlab-app
```

---

### **Erro: "npm ERR! code ENOENT"**

**Causa:** Não está na pasta correta

**Solução:**
```powershell
# Verificar se está na pasta certa
pwd
# Deve mostrar: C:\Users\Usuario\Documents\GitHub\yieldlab

# Se não estiver:
cd C:\Users\Usuario\Documents\GitHub\yieldlab

# Verificar se tem package.json
ls package.json
```

---

## 📊 O Que Cada Comando Faz

| Comando | O Que Faz | Tempo |
|---------|-----------|-------|
| `npm install` | Baixa dependências (node_modules) | ~30s |
| `npm run build` | Compila TypeScript → JavaScript | ~5s |
| `npx wrangler login` | Autentica com Cloudflare | ~10s |
| `npx wrangler pages deploy` | Envia arquivos para Cloudflare | ~30s |

**Total:** ~1-2 minutos

---

## 🎯 Fluxo Completo

```
C:\Users\Usuario\Documents\GitHub\yieldlab\
↓
npm install (30s)
↓
npm run build (5s)
↓
npx wrangler login (primeira vez)
↓
npx wrangler pages deploy dist --project-name yieldlab (30s)
↓
✅ https://yieldlab.cgscacau.workers.dev/api/health
```

---

## 📁 Estrutura Esperada

```
C:\Users\Usuario\Documents\GitHub\yieldlab\
├── src/
│   ├── index.tsx
│   ├── routes/
│   └── services/
├── public/
│   ├── login.html
│   └── static/
├── dist/                  ← Gerado pelo build
│   ├── _worker.js
│   ├── _routes.json
│   └── static/
├── package.json
├── wrangler.jsonc
├── vite.config.ts
└── DEPLOY_FROM_WINDOWS.bat  ← Script automático
```

---

## 🚀 Comandos Rápidos

### **Deploy completo em 1 comando:**
```powershell
cd C:\Users\Usuario\Documents\GitHub\yieldlab && npm install && npm run build && npx wrangler pages deploy dist --project-name yieldlab
```

### **Apenas redeploy (após mudanças):**
```powershell
cd C:\Users\Usuario\Documents\GitHub\yieldlab && npm run build && npx wrangler pages deploy dist --project-name yieldlab
```

---

## ✅ Checklist de Deploy

- [ ] Node.js instalado (`node --version`)
- [ ] Na pasta correta (`cd C:\...\yieldlab`)
- [ ] Dependências instaladas (`npm install`)
- [ ] Build executado (`npm run build`)
- [ ] Pasta `dist/` existe
- [ ] Wrangler autenticado (`npx wrangler login`)
- [ ] Deploy realizado (`npx wrangler pages deploy...`)
- [ ] Teste da URL funcionando

---

## 🎉 Após Deploy Bem-Sucedido

### **Teste 1: API Health**
```
https://yieldlab.cgscacau.workers.dev/api/health
```

### **Teste 2: Landing Page**
```
https://yieldlab.cgscacau.workers.dev/
```

### **Teste 3: Login**
```
https://yieldlab.cgscacau.workers.dev/login.html
```

---

## 📚 Links Úteis

- **Node.js:** https://nodejs.org/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **Código no GitHub:** https://github.com/cgscacau/yieldlab

---

## 💡 Dica Final

Após o primeiro deploy funcionar, você pode configurar o GitHub Actions para deploy automático. Mas por enquanto, use o deploy manual do Windows!

---

**🎯 Próximo passo:**

1. Abra o PowerShell
2. `cd C:\Users\Usuario\Documents\GitHub\yieldlab`
3. `npm install && npm run build`
4. `npx wrangler pages deploy dist --project-name yieldlab`

**Me avise quando executar!** 🚀
