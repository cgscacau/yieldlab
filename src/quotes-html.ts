export const QUOTES_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotações - Brapi API</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <i class="fas fa-chart-line text-indigo-600 text-3xl mr-3"></i>
                    <span class="text-2xl font-bold text-gray-900">YieldLab</span>
                    <span class="ml-4 text-gray-500">|</span>
                    <span class="ml-4 text-lg text-gray-700">Cotações Brapi</span>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/" class="text-gray-700 hover:text-indigo-600">Home</a>
                    <a href="/dashboard" class="text-gray-700 hover:text-indigo-600">Dashboard</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
                <i class="fas fa-chart-bar text-indigo-600 mr-2"></i>
                Cotações em Tempo Real
            </h1>
            <p class="text-gray-600">Dados fornecidos por Brapi.dev - API Brasileira de Ações</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-white rounded-lg shadow p-4">
                <div class="text-sm text-gray-500 mb-1">Total de Ações</div>
                <div id="totalStocks" class="text-2xl font-bold text-gray-900">-</div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
                <div class="text-sm text-gray-500 mb-1">Em Alta</div>
                <div id="totalUp" class="text-2xl font-bold text-green-600">-</div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
                <div class="text-sm text-gray-500 mb-1">Em Baixa</div>
                <div id="totalDown" class="text-2xl font-bold text-red-600">-</div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
                <div class="text-sm text-gray-500 mb-1">Estáveis</div>
                <div id="totalStable" class="text-2xl font-bold text-gray-600">-</div>
            </div>
        </div>

        <!-- Search and Filter -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                    <input 
                        type="text" 
                        id="searchInput" 
                        placeholder="Buscar por ticker ou nome (ex: PETR4, Petrobras)..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                </div>
                <select id="filterType" class="px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="all">Todos</option>
                    <option value="up">Em Alta</option>
                    <option value="down">Em Baixa</option>
                    <option value="stable">Estáveis</option>
                </select>
                <button 
                    onclick="loadQuotes()" 
                    class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                    <i class="fas fa-sync-alt"></i>
                    Atualizar
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div id="loading" class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
            <p class="text-gray-600">Carregando cotações...</p>
        </div>

        <!-- Quotes Table -->
        <div id="quotesContainer" class="bg-white rounded-lg shadow overflow-hidden hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ticker
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Preço
                            </th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variação
                            </th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variação %
                            </th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Volume
                            </th>
                        </tr>
                    </thead>
                    <tbody id="quotesTable" class="bg-white divide-y divide-gray-200">
                        <!-- Quotes will be inserted here -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Error State -->
        <div id="errorContainer" class="hidden bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
            <p class="text-red-800 font-semibold mb-2">Erro ao carregar cotações</p>
            <p class="text-red-600" id="errorMessage"></p>
            <button 
                onclick="loadQuotes()" 
                class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
                Tentar Novamente
            </button>
        </div>
    </div>

    <script>
        let allQuotes = [];
        let filteredQuotes = [];

        // Carregar cotações ao iniciar
        window.addEventListener('DOMContentLoaded', () => {
            loadQuotes();
            
            // Filtros em tempo real
            document.getElementById('searchInput').addEventListener('input', filterQuotes);
            document.getElementById('filterType').addEventListener('change', filterQuotes);
        });

        async function loadQuotes() {
            const loading = document.getElementById('loading');
            const container = document.getElementById('quotesContainer');
            const errorContainer = document.getElementById('errorContainer');

            // Mostrar loading
            loading.classList.remove('hidden');
            container.classList.add('hidden');
            errorContainer.classList.add('hidden');

            try {
                console.log('📡 Buscando cotações...');
                
                // Buscar lista de tickers disponíveis
                const tickersResponse = await fetch('https://brapi.dev/api/available?token=neCCcmX2AynTnvLpiH25TY');
                const tickersData = await tickersResponse.json();
                
                console.log('📋 Tickers disponíveis:', tickersData);
                
                // Pegar os primeiros 50 tickers mais líquidos (ações com volume)
                const tickers = tickersData.stocks.slice(0, 50).join(',');
                
                console.log('📊 Buscando cotações de:', tickers);
                
                // Buscar cotações
                const quotesResponse = await fetch(\`https://brapi.dev/api/quote/\${tickers}?token=neCCcmX2AynTnvLpiH25TY\`);
                const quotesData = await quotesResponse.json();
                
                console.log('✅ Cotações recebidas:', quotesData);
                
                allQuotes = quotesData.results || [];
                filteredQuotes = [...allQuotes];
                
                // Atualizar stats
                updateStats();
                
                // Renderizar tabela
                renderQuotes();
                
                // Mostrar container
                loading.classList.add('hidden');
                container.classList.remove('hidden');
                
            } catch (error) {
                console.error('❌ Erro ao carregar cotações:', error);
                loading.classList.add('hidden');
                errorContainer.classList.remove('hidden');
                document.getElementById('errorMessage').textContent = error.message;
            }
        }

        function updateStats() {
            const total = allQuotes.length;
            const up = allQuotes.filter(q => q.regularMarketChangePercent > 0).length;
            const down = allQuotes.filter(q => q.regularMarketChangePercent < 0).length;
            const stable = allQuotes.filter(q => q.regularMarketChangePercent === 0).length;

            document.getElementById('totalStocks').textContent = total;
            document.getElementById('totalUp').textContent = up;
            document.getElementById('totalDown').textContent = down;
            document.getElementById('totalStable').textContent = stable;
        }

        function filterQuotes() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const filterType = document.getElementById('filterType').value;

            filteredQuotes = allQuotes.filter(quote => {
                // Filtro de busca
                const matchesSearch = !searchTerm || 
                    quote.symbol.toLowerCase().includes(searchTerm) ||
                    quote.longName?.toLowerCase().includes(searchTerm) ||
                    quote.shortName?.toLowerCase().includes(searchTerm);

                // Filtro de tipo
                let matchesType = true;
                if (filterType === 'up') {
                    matchesType = quote.regularMarketChangePercent > 0;
                } else if (filterType === 'down') {
                    matchesType = quote.regularMarketChangePercent < 0;
                } else if (filterType === 'stable') {
                    matchesType = quote.regularMarketChangePercent === 0;
                }

                return matchesSearch && matchesType;
            });

            renderQuotes();
        }

        function renderQuotes() {
            const tbody = document.getElementById('quotesTable');
            tbody.innerHTML = '';

            if (filteredQuotes.length === 0) {
                tbody.innerHTML = \`
                    <tr>
                        <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                            <i class="fas fa-search text-4xl mb-2"></i>
                            <p>Nenhuma cotação encontrada</p>
                        </td>
                    </tr>
                \`;
                return;
            }

            filteredQuotes.forEach(quote => {
                const change = quote.regularMarketChange || 0;
                const changePercent = quote.regularMarketChangePercent || 0;
                const price = quote.regularMarketPrice || 0;
                const volume = quote.regularMarketVolume || 0;
                
                const isUp = changePercent > 0;
                const isDown = changePercent < 0;
                const colorClass = isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-gray-600';
                const icon = isUp ? 'fa-arrow-up' : isDown ? 'fa-arrow-down' : 'fa-minus';

                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                row.innerHTML = \`
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="font-semibold text-gray-900">\${quote.symbol}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-900">\${quote.shortName || quote.longName || '-'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                        <div class="text-sm font-semibold text-gray-900">
                            R$ \${price.toFixed(2)}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right \${colorClass}">
                        <i class="fas \${icon} mr-1"></i>
                        R$ \${Math.abs(change).toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right \${colorClass}">
                        <span class="font-semibold">\${changePercent > 0 ? '+' : ''}\${changePercent.toFixed(2)}%</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        \${formatVolume(volume)}
                    </td>
                \`;
                tbody.appendChild(row);
            });
        }

        function formatVolume(volume) {
            if (volume >= 1000000) {
                return (volume / 1000000).toFixed(1) + 'M';
            } else if (volume >= 1000) {
                return (volume / 1000).toFixed(1) + 'K';
            }
            return volume.toString();
        }

        // Auto-refresh a cada 60 segundos
        setInterval(loadQuotes, 60000);
    </script>
</body>
</html>
`;