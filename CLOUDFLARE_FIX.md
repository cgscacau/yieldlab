# 🔧 Correção do Erro de Deploy - Cloudflare Pages

## ❌ Erro Atual:
```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
For Pages, please run `wrangler pages deploy` instead.
```

## ✅ Solução:

O Cloudflare Pages está tentando executar um comando de **Workers** em vez de **Pages**.

---

## 🎯 Passo a Passo para Corrigir:

### 1. Acesse as Configurações do Projeto

No seu projeto `yieldlab` no Cloudflare:

1. Clique em **Settings** (menu lateral esquerdo)
2. Role até a seção **"Build & deployments"**
3. Procure por **"Build configuration"**
4. Clique no botão **"Edit"** ou **"Configure"**

### 2. Configure os Campos Corretamente

**COPIE E COLE exatamente assim:**

```
┌─────────────────────────────────────────────┐
│ Framework preset                            │
│ ┌─────────────────────────────────────────┐ │
│ │ None                                    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Build command                               │
│ ┌─────────────────────────────────────────┐ │
│ │ npm run build                           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Build output directory                      │
│ ┌─────────────────────────────────────────┐ │
│ │ dist                                    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Root directory (optional)                   │
│ ┌─────────────────────────────────────────┐ │
│ │ (deixe vazio)                           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Environment variables                       │
│ Production (já deve estar configurado)      │
└─────────────────────────────────────────────┘
```

### 3. ⚠️ IMPORTANTE: Remover Deploy Command

Se houver um campo chamado:
- **"Deploy command"**
- **"Custom deployment command"**
- Ou qualquer comando além de "Build command"

**→ DEIXE VAZIO ou REMOVA**

O Cloudflare Pages NÃO precisa de deploy command separado!

### 4. Verificar Variáveis de Ambiente

Ainda em **Settings** > **Environment variables**:

Certifique-se que existem (para Production):

| Variable name | Value |
|--------------|-------|
| `FIREBASE_PROJECT_ID` | `yieldlab-76d87` |
| `FIREBASE_API_KEY` | `AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew` |

### 5. Salvar e Redesploy

1. Clique em **"Save"**
2. Vá na aba **"Deployments"**
3. No deployment que falhou, clique nos **3 pontos** (⋮)
4. Clique em **"Retry deployment"**

---

## 🔍 Se o Problema Persistir:

### Opção A: Deletar e Recriar Projeto

1. **Delete o projeto** atual:
   - Settings > **Delete project**

2. **Recrie** do zero:
   - Workers & Pages > **Create application**
   - Pages > **Connect to Git**
   - Selecione: `cgscacau/yieldlab`
   - Configure:
     - Project name: `yieldlab-app` (nome diferente)
     - Production branch: `main`
     - Build command: `npm run build`
     - Build output directory: `dist`
     - **NÃO adicione** deploy command
   - Save and Deploy

3. **Adicione variáveis** de ambiente depois

### Opção B: Criar Projeto Manualmente (Pages Only)

1. Workers & Pages > **Create application**
2. Escolha aba **"Pages"**
3. **Upload assets** (em vez de Connect to Git)
4. Faça build local e upload da pasta `dist/`

---

## 📋 Checklist:

- [ ] Settings > Build & deployments > Edit
- [ ] Framework preset: `None`
- [ ] Build command: `npm run build`
- [ ] Build output: `dist`
- [ ] Deploy command: **VAZIO**
- [ ] Root directory: **VAZIO**
- [ ] Salvar
- [ ] Retry deployment
- [ ] Aguardar 2-3 minutos
- [ ] Testar: `https://yieldlab.pages.dev/api/health`

---

## 🎯 Configuração Correta Final:

```yaml
Framework: None
Build Command: npm run build
Build Output: dist
Root Directory: (empty)
Deploy Command: (empty or not present)
Environment Variables:
  - FIREBASE_PROJECT_ID=yieldlab-76d87
  - FIREBASE_API_KEY=AIzaSyDf2WKMfvtd8Pv_BlS2W928bqp24_v-pew
```

---

## 🧪 Após Deploy com Sucesso:

Teste sua API:

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

---

## 💡 Por que deu erro?

O Cloudflare detectou que você está usando **Cloudflare Pages** mas tentou executar um comando de **Cloudflare Workers** (`wrangler deploy`).

A diferença:
- **Workers**: `wrangler deploy` (para Workers standalone)
- **Pages**: Build automático, sem comando de deploy separado

---

**Me avise se funcionou ou se ainda está dando erro! 🚀**
