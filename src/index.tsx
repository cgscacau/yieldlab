// ============================================================================
// INVESTFOLIO - Main Application
// Sistema de Gestão de Investimentos
// ============================================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';

// Routes
import portfolios from './routes/portfolios';
import assets from './routes/assets';
import transactions from './routes/transactions';
import dividends from './routes/dividends';

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

// Servir arquivos estáticos
app.use('/static/*', serveStatic({ root: './public' }));

// ============================================================================
// API ROUTES
// ============================================================================

app.route('/api/portfolios', portfolios);
app.route('/api/assets', assets);
app.route('/api/transactions', transactions);
app.route('/api/dividends', dividends);

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
    service: 'InvestFolio API'
  });
});

// ============================================================================
// FRONTEND - Landing Page
// ============================================================================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InvestFolio - Gestão de Investimentos</title>
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
                        <span class="text-2xl font-bold text-gray-900">InvestFolio</span>
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
                    <p>&copy; 2024 InvestFolio. Powered by Hono + Firebase + Cloudflare Pages.</p>
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
