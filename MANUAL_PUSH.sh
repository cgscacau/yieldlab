#!/bin/bash

# ====================================
# Script de Push Manual para GitHub
# YieldLab - cgscacau/yieldlab
# ====================================

echo "🚀 YieldLab - Push para GitHub"
echo "================================"
echo ""

# Verificar branch atual
echo "📍 Branch atual:"
git branch --show-current
echo ""

# Mostrar últimos commits
echo "📝 Últimos commits:"
git log --oneline -5
echo ""

# Mostrar status
echo "📊 Status do repositório:"
git status
echo ""

# Instruções para push
echo "================================"
echo "🔐 OPÇÕES DE PUSH"
echo "================================"
echo ""
echo "OPÇÃO 1: Push com Personal Access Token (PAT)"
echo "---------------------------------------------"
echo "1. Vá para: https://github.com/settings/tokens"
echo "2. Clique em 'Generate new token (classic)'"
echo "3. Selecione scope: 'repo' (acesso completo)"
echo "4. Copie o token gerado"
echo "5. Execute:"
echo ""
echo "   git push https://TOKEN@github.com/cgscacau/yieldlab.git main --force"
echo ""
echo "   (Substitua TOKEN pelo seu token)"
echo ""
echo ""
echo "OPÇÃO 2: Upload Manual no GitHub"
echo "---------------------------------"
echo "1. Baixe o código completo:"
echo "   https://www.genspark.ai/api/files/s/k8QXH1mM"
echo ""
echo "2. Extraia o arquivo"
echo ""
echo "3. No GitHub:"
echo "   - Vá para https://github.com/cgscacau/yieldlab"
echo "   - Delete todos os arquivos antigos"
echo "   - Clique em 'Add file' > 'Upload files'"
echo "   - Arraste TODOS os arquivos da pasta 'webapp/'"
echo "   - Commit message: 'feat: Sistema completo YieldLab'"
echo "   - Commit changes"
echo ""
echo ""
echo "OPÇÃO 3: GitHub CLI (se tiver gh instalado localmente)"
echo "-------------------------------------------------------"
echo "   gh auth login"
echo "   cd webapp"
echo "   git push -f origin main"
echo ""
echo ""
echo "================================"
echo "📊 INFORMAÇÕES DO REPOSITÓRIO"
echo "================================"
echo ""
echo "Remote URL: $(git remote get-url origin)"
echo "Commit atual: $(git rev-parse HEAD)"
echo "Total de commits: $(git rev-list --count HEAD)"
echo ""
echo "================================"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Use --force porque o repositório remoto está desatualizado"
echo "   - Após o push, o Cloudflare Pages vai fazer rebuild automático"
echo "   - Aguarde 2-3 minutos após o push para acessar"
echo ""
echo "🎯 URL final: https://yieldlab.cgscacau.workers.dev"
echo ""
