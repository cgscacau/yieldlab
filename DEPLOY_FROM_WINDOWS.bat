@echo off
REM ====================================
REM YieldLab - Deploy para Cloudflare
REM Deploy direto do Windows
REM ====================================

echo.
echo ========================================
echo   YieldLab - Deploy para Cloudflare
echo ========================================
echo.

REM Verificar se está no diretório correto
if not exist "package.json" (
    echo [ERRO] Arquivo package.json nao encontrado!
    echo Execute este script dentro da pasta yieldlab
    pause
    exit /b 1
)

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale o Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js: OK

echo.
echo [2/5] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias
    pause
    exit /b 1
)
echo Dependencias: OK

echo.
echo [3/5] Compilando projeto...
call npm run build
if errorlevel 1 (
    echo [ERRO] Falha ao compilar projeto
    pause
    exit /b 1
)
echo Build: OK

echo.
echo [4/5] Fazendo deploy no Cloudflare...
echo.
echo IMPORTANTE: Se for a primeira vez, o wrangler vai:
echo 1. Abrir o navegador para login
echo 2. Pedir autorizacao na Cloudflare
echo 3. Retornar para o terminal
echo.
pause

call npx wrangler pages deploy dist --project-name yieldlab
if errorlevel 1 (
    echo.
    echo [ERRO] Falha no deploy
    echo.
    echo Possiveis causas:
    echo - Nao autorizou no navegador
    echo - Projeto nao existe no Cloudflare
    echo - Token expirado
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPLOY CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Teste agora:
echo   https://yieldlab.cgscacau.workers.dev/api/health
echo.
echo Deve retornar:
echo   {"success": true, "service": "YieldLab API"}
echo.
pause
