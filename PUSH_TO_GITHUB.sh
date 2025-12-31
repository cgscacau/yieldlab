#!/bin/bash
# ============================================================================
# Script para Push no GitHub - YieldLab
# ============================================================================

echo "🚀 YieldLab - Push para GitHub"
echo "================================"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script dentro do diretório /home/user/webapp"
    exit 1
fi

# Verificar se git está configurado
if [ -z "$(git config user.email)" ]; then
    echo "${YELLOW}Configurando Git...${NC}"
    git config user.email "yieldlab@example.com"
    git config user.name "YieldLab Deploy"
fi

# Verificar se remote existe
if ! git remote | grep -q origin; then
    echo "${YELLOW}Adicionando remote do GitHub...${NC}"
    git remote add origin https://github.com/cgscacau/yieldlab.git
fi

echo ""
echo "${BLUE}Repositório:${NC} https://github.com/cgscacau/yieldlab.git"
echo "${BLUE}Branch:${NC} main"
echo "${BLUE}Commits:${NC} $(git rev-list --count HEAD)"
echo ""

# Verificar status
echo "${YELLOW}Status do repositório:${NC}"
git status --short
echo ""

# Perguntar se quer fazer push
read -p "Deseja fazer push agora? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "${YELLOW}Fazendo push para GitHub...${NC}"
    echo ""
    
    # Tentar push
    if git push -u origin main; then
        echo ""
        echo "${GREEN}✅ Push realizado com sucesso!${NC}"
        echo ""
        echo "Próximos passos:"
        echo "1. Acesse: https://dash.cloudflare.com/"
        echo "2. Workers & Pages > Create > Pages > Connect to Git"
        echo "3. Selecione: cgscacau/yieldlab"
        echo "4. Configure build:"
        echo "   - Project name: yieldlab"
        echo "   - Build command: npm run build"
        echo "   - Output directory: dist"
        echo "5. Adicione variáveis de ambiente"
        echo ""
    else
        echo ""
        echo "${YELLOW}❌ Push falhou - Autenticação necessária${NC}"
        echo ""
        echo "Opções para resolver:"
        echo ""
        echo "1️⃣ Usar GitHub CLI (gh):"
        echo "   gh auth login"
        echo "   git push -u origin main"
        echo ""
        echo "2️⃣ Usar Personal Access Token:"
        echo "   - Acesse: https://github.com/settings/tokens"
        echo "   - Generate new token (classic)"
        echo "   - Marque: repo"
        echo "   - Copie o token"
        echo "   - Use como senha ao fazer push"
        echo ""
        echo "3️⃣ Upload manual dos arquivos:"
        echo "   - Download: https://www.genspark.ai/api/files/s/k8QXH1mM"
        echo "   - Extraia o arquivo"
        echo "   - Faça upload no GitHub via interface web"
        echo ""
    fi
else
    echo ""
    echo "${YELLOW}Push cancelado.${NC}"
    echo ""
    echo "Para fazer push depois, execute:"
    echo "  cd /home/user/webapp"
    echo "  git push -u origin main"
    echo ""
fi
