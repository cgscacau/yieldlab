// ============================================================================
// YIELDLAB - Main Application
// Sistema de Gestão de Investimentos
// ============================================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { DASHBOARD_HTML } from './dashboard-html';

// Routes
import portfolios from './routes/portfolios';
import assets from './routes/assets';
import transactions from './routes/transactions';
import dividends from './routes/dividends';
import quotes from './routes/quotes';

// Types
import type { Portfolio, Asset, Transaction, Dividend } from './types';
import { calculatePortfolioMetrics, calculateDividendsEvolution, calculatePatrimonyEvolution } from './utils/calculations';
import { FirestoreService } from './services/firebase';
import { authMiddleware } from './middleware/auth';

const app = new Hono();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS para aceitar requisições do frontend
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Servir arquivos estáticos CSS/JS
app.use('/static/*', serveStatic({ root: '.' }));

// ============================================================================
// API ROUTES
// ============================================================================

app.route('/api/portfolios', portfolios);
app.route('/api/assets', assets);
app.route('/api/transactions', transactions);
app.route('/api/dividends', dividends);
app.route('/api/quotes', quotes);

// ============================================================================
// ANALYTICS & METRICS
// ============================================================================

/**
 * GET /api/metrics/:portfolioId - Calcula métricas completas do portfólio
 */
app.get('/api/metrics/:portfolioId', authMiddleware, async (c) => {
  try {
    const portfolioId = c.req.param('portfolioId');
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID';
    
    const firestore = new FirestoreService(token, projectId);
    
    // Verifica permissão
    const portfolio = await firestore.getPortfolioById(portfolioId);
    if (!portfolio || portfolio.userId !== user.uid) {
      return c.json({ success: false, error: 'Acesso negado' }, 403);
    }

    // Busca dados
    const assets = await firestore.getAssetsByPortfolioId(portfolioId);
    const transactions = await firestore.getTransactionsByPortfolioId(portfolioId);
    const dividends = await firestore.getDividendsByPortfolioId(portfolioId);

    // Calcula métricas
    const metrics = calculatePortfolioMetrics(assets, transactions, dividends);
    
    // Evolução patrimonial
    const patrimonyEvolution = calculatePatrimonyEvolution(transactions, assets);
    
    // Evolução de dividendos
    const dividendsEvolution = calculateDividendsEvolution(dividends);

    return c.json({
      success: true,
      data: {
        metrics,
        patrimonyEvolution,
        dividendsEvolution
      }
    });
  } catch (error: any) {
    console.error('Error calculating metrics:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/import-csv - Importa dados de um CSV
 */
app.post('/api/import-csv', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { portfolioId, csvData } = body;

    if (!portfolioId || !csvData) {
      return c.json({
        success: false,
        error: 'portfolioId e csvData são obrigatórios'
      }, 400);
    }

    // Parse CSV (formato simples: data,ticker,tipo,quantidade,preço)
    const lines = csvData.trim().split('\n');
    const imported = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) { // Pula header
      try {
        const [date, ticker, type, quantity, price] = lines[i].split(',');
        
        if (!date || !ticker || !type || !quantity || !price) {
          errors.push(`Linha ${i + 1}: dados incompletos`);
          continue;
        }

        imported.push({
          date: date.trim(),
          ticker: ticker.trim().toUpperCase(),
          type: type.trim().toLowerCase(),
          quantity: parseFloat(quantity.trim()),
          price: parseFloat(price.trim())
        });
      } catch (err) {
        errors.push(`Linha ${i + 1}: erro ao processar`);
      }
    }

    return c.json({
      success: true,
      data: {
        imported,
        total: imported.length,
        errors
      },
      message: `${imported.length} transações importadas`
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'YieldLab API'
  });
});

// ============================================================================
// FRONTEND - Landing Page
// ============================================================================

// Rota de Login
app.get('/login', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - YieldLab</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-indigo-500 to-purple-600 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <!-- Logo -->
        <div class="text-center mb-8">
            <i class="fas fa-chart-line text-5xl text-indigo-600 mb-4"></i>
            <h1 class="text-3xl font-bold text-gray-900">YieldLab</h1>
            <p class="text-gray-600 mt-2">Gestão Inteligente de Investimentos</p>
        </div>

        <!-- Alert -->
        <div id="alert" class="hidden mb-4 p-4 rounded-lg"></div>

        <!-- Tabs -->
        <div class="flex mb-6 border-b">
            <button id="loginTab" class="flex-1 py-3 font-semibold text-indigo-600 border-b-2 border-indigo-600">
                Login
            </button>
            <button id="registerTab" class="flex-1 py-3 font-semibold text-gray-500">
                Registrar
            </button>
        </div>

        <!-- Login Form -->
        <form id="loginForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" id="loginEmail" required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="seu@email.com">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <input type="password" id="loginPassword" required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••">
            </div>
            <button type="submit" 
                class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center">
                <i class="fas fa-sign-in-alt mr-2"></i>
                Entrar
            </button>
        </form>

        <!-- Register Form (Hidden) -->
        <form id="registerForm" class="space-y-4 hidden">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input type="text" id="registerName" required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Seu nome">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" id="registerEmail" required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="seu@email.com">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <input type="password" id="registerPassword" required minlength="6"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••">
                <p class="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>
            <button type="submit"
                class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center">
                <i class="fas fa-user-plus mr-2"></i>
                Criar Conta
            </button>
        </form>

        <!-- Firebase Status -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 text-center">
                <i class="fas fa-shield-alt mr-2"></i>
                <span id="firebaseStatus">Verificando Firebase...</span>
            </p>
        </div>

        <!-- Back to Home -->
        <div class="mt-6 text-center">
            <a href="/" class="text-sm text-indigo-600 hover:underline">
                <i class="fas fa-arrow-left mr-1"></i>
                Voltar para home
            </a>
        </div>
    </div>

    <!-- Scripts -->
    <script src="/static/js/firebase-config.js"></script>
    <script src="/static/js/auth.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const statusEl = document.getElementById('firebaseStatus');
            
            if (window.IS_FIREBASE_CONFIGURED) {
                statusEl.innerHTML = '<i class="fas fa-check-circle text-green-600 mr-2"></i>Firebase Conectado';
                console.log('✅ Firebase configurado:', window.FIREBASE_CONFIG.projectId);
            } else {
                statusEl.innerHTML = '<i class="fas fa-exclamation-triangle text-red-600 mr-2"></i>Firebase não configurado';
                showAlert('Firebase não configurado! Verifique firebase-config.js', 'error');
            }
        });

        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        loginTab.addEventListener('click', () => {
            loginTab.classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
            loginTab.classList.remove('text-gray-500');
            registerTab.classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
            registerTab.classList.add('text-gray-500');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
            registerTab.classList.remove('text-gray-500');
            loginTab.classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
            loginTab.classList.add('text-gray-500');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });

        function showAlert(message, type = 'info') {
            const alert = document.getElementById('alert');
            alert.className = \`mb-4 p-4 rounded-lg \${
                type === 'success' ? 'bg-green-100 text-green-800' :
                type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
            }\`;
            alert.innerHTML = \`
                <div class="flex items-center">
                    <i class="fas \${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>
                    \${message}
                </div>
            \`;
            alert.classList.remove('hidden');
            
            if (type === 'success') {
                setTimeout(() => alert.classList.add('hidden'), 5000);
            }
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                showAlert('Autenticando...', 'info');
                const user = await window.authService.login(email, password);
                showAlert(\`Bem-vindo, \${user.email}!\`, 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } catch (error) {
                console.error('Login error:', error);
                showAlert(error.message || 'Erro ao fazer login', 'error');
            }
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            try {
                showAlert('Criando conta...', 'info');
                const user = await window.authService.register(email, password, name);
                showAlert(\`Conta criada! Bem-vindo, \${user.displayName}!\`, 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } catch (error) {
                console.error('Register error:', error);
                showAlert(error.message || 'Erro ao criar conta', 'error');
            }
        });

        if (window.authService && window.authService.isAuthenticated()) {
            showAlert('Você já está logado!', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        }
    </script>
</body>
</html>`);
});

// Rota de Dashboard - retorna HTML inline
app.get('/dashboard', (c) => {
  return c.html(DASHBOARD_HTML);
});

// Dashboard antigo (backup)
app.get('/dashboard-old', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - YieldLab</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Navbar -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <i class="fas fa-chart-line text-indigo-600 text-3xl mr-3"></i>
                    <span class="text-2xl font-bold text-gray-900">YieldLab</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span id="userEmail" class="text-gray-700"></span>
                    <button id="logoutBtn" class="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
                        <i class="fas fa-sign-out-alt mr-2"></i>Sair
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p class="text-gray-600">Bem-vindo ao YieldLab - Sistema de Gestão de Investimentos</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Card 1 -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-gray-500">Total Investido</h3>
                    <i class="fas fa-wallet text-2xl text-green-600"></i>
                </div>
                <p class="text-3xl font-bold text-gray-900">R$ 0,00</p>
                <p class="text-sm text-gray-500 mt-2">
                    <i class="fas fa-arrow-up text-green-500 mr-1"></i>
                    0% vs. mês passado
                </p>
            </div>

            <!-- Card 2 -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-gray-500">Rentabilidade</h3>
                    <i class="fas fa-chart-line text-2xl text-blue-600"></i>
                </div>
                <p class="text-3xl font-bold text-gray-900">R$ 0,00</p>
                <p class="text-sm text-gray-500 mt-2">
                    <i class="fas fa-minus text-gray-500 mr-1"></i>
                    0% de retorno
                </p>
            </div>

            <!-- Card 3 -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-medium text-gray-500">Dividendos</h3>
                    <i class="fas fa-coins text-2xl text-yellow-600"></i>
                </div>
                <p class="text-3xl font-bold text-gray-900">R$ 0,00</p>
                <p class="text-sm text-gray-500 mt-2">
                    <i class="fas fa-calendar mr-1"></i>
                    Este mês
                </p>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition">
                    <i class="fas fa-plus-circle text-3xl text-indigo-600 mb-2"></i>
                    <span class="text-sm font-medium text-gray-700">Novo Portfólio</span>
                </button>
                <button class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition">
                    <i class="fas fa-chart-pie text-3xl text-green-600 mb-2"></i>
                    <span class="text-sm font-medium text-gray-700">Adicionar Ativo</span>
                </button>
                <button class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                    <i class="fas fa-exchange-alt text-3xl text-blue-600 mb-2"></i>
                    <span class="text-sm font-medium text-gray-700">Transação</span>
                </button>
                <button class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
                    <i class="fas fa-file-csv text-3xl text-purple-600 mb-2"></i>
                    <span class="text-sm font-medium text-gray-700">Importar CSV</span>
                </button>
            </div>
        </div>

        <!-- Empty State -->
        <div class="bg-white rounded-lg shadow p-12 text-center">
            <i class="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum portfólio criado</h3>
            <p class="text-gray-600 mb-6">Comece criando seu primeiro portfólio de investimentos</p>
            <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                <i class="fas fa-plus mr-2"></i>
                Criar Primeiro Portfólio
            </button>
        </div>

        <!-- Info Box -->
        <div class="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div class="flex items-start">
                <i class="fas fa-info-circle text-blue-500 text-xl mr-3 mt-1"></i>
                <div>
                    <h4 class="font-semibold text-blue-900 mb-1">Dashboard em Desenvolvimento</h4>
                    <p class="text-sm text-blue-800">
                        Esta é a versão inicial do dashboard. Em breve teremos gráficos, relatórios detalhados e mais funcionalidades!
                    </p>
                    <p class="text-sm text-blue-800 mt-2">
                        <strong>API REST disponível:</strong> Você já pode usar todos os endpoints da API para gerenciar seus investimentos.
                        <a href="/api/health" class="underline ml-1">Testar API</a>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="/static/js/firebase-config.js"></script>
    <script src="/static/js/auth.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Check if user is logged in
            if (!window.authService || !window.authService.isAuthenticated()) {
                window.location.href = '/login';
                return;
            }

            // Display user email
            const user = window.authService.getCurrentUser();
            if (user) {
                document.getElementById('userEmail').textContent = user.email;
            }

            // Logout button
            document.getElementById('logoutBtn').addEventListener('click', async () => {
                try {
                    await window.authService.logout();
                    window.location.href = '/';
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Erro ao fazer logout');
                }
            });

            console.log('✅ Dashboard carregado');
            console.log('Usuario:', user);
        });
    </script>
</body>
</html>`);
});

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YieldLab - Gestão de Investimentos</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <!-- Navbar -->
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <i class="fas fa-chart-line text-indigo-600 text-3xl mr-3"></i>
                        <span class="text-2xl font-bold text-gray-900">YieldLab</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="/dashboard" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                            Dashboard
                        </a>
                        <a href="/login" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                            Login
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="text-center">
                <h1 class="text-5xl font-extrabold text-gray-900 mb-6">
                    Gerencie seus investimentos com inteligência
                </h1>
                <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    Controle total sobre sua carteira de investimentos. Acompanhe rentabilidade, 
                    dividend yield, e evolução patrimonial em tempo real.
                </p>
                <div class="flex justify-center space-x-4">
                    <a href="/register" class="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition">
                        Começar Agora
                    </a>
                    <a href="/dashboard" class="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition">
                        Ver Demo
                    </a>
                </div>
            </div>

            <!-- Features Grid -->
            <div class="grid md:grid-cols-3 gap-8 mt-20">
                <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
                    <div class="text-indigo-600 text-4xl mb-4">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Múltiplos Portfólios</h3>
                    <p class="text-gray-600">Organize seus investimentos em carteiras separadas para melhor controle.</p>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
                    <div class="text-green-600 text-4xl mb-4">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Análise Completa</h3>
                    <p class="text-gray-600">Métricas detalhadas: custo médio, rentabilidade, dividend yield e mais.</p>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
                    <div class="text-purple-600 text-4xl mb-4">
                        <i class="fas fa-coins"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Controle de Proventos</h3>
                    <p class="text-gray-600">Acompanhe dividendos, JCP e evolução mensal de rendimentos.</p>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
                    <div class="text-red-600 text-4xl mb-4">
                        <i class="fas fa-file-csv"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Importação CSV</h3>
                    <p class="text-gray-600">Importe seus extratos e notas de corretagem em segundos.</p>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
                    <div class="text-yellow-600 text-4xl mb-4">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Agenda de Proventos</h3>
                    <p class="text-gray-600">Visualize pagamentos futuros e planeje seu fluxo de caixa.</p>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
                    <div class="text-blue-600 text-4xl mb-4">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">100% Seguro</h3>
                    <p class="text-gray-600">Seus dados protegidos com Firebase Authentication e Firestore.</p>
                </div>
            </div>

            <!-- CTA Section -->
            <div class="bg-indigo-600 rounded-2xl p-12 mt-20 text-center">
                <h2 class="text-3xl font-bold text-white mb-4">
                    Pronto para começar?
                </h2>
                <p class="text-indigo-100 text-lg mb-8">
                    Crie sua conta gratuitamente e comece a gerenciar seus investimentos hoje.
                </p>
                <a href="/register" class="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition inline-block">
                    Criar Conta Grátis
                </a>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-white mt-20 border-t">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="text-center text-gray-600">
                    <p>&copy; 2024 YieldLab. Powered by Hono + Firebase + Cloudflare Pages.</p>
                    <p class="mt-2 text-sm">
                        <a href="/api/health" class="text-indigo-600 hover:underline">API Status</a> | 
                        <a href="https://github.com" class="text-indigo-600 hover:underline ml-2">GitHub</a>
                    </p>
                </div>
            </div>
        </footer>
    </body>
    </html>
  `);
});

export default app;
