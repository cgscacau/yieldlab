// ============================================================================
// YIELDLAB - Dashboard JavaScript
// Gerenciamento de Portfólios e Ativos
// ============================================================================

class DashboardManager {
  constructor() {
    this.portfolios = [];
    this.selectedPortfolio = null;
    this.assets = [];
    this.init();
  }

  async init() {
    console.log('🚀 Dashboard Manager iniciado');
    
    // Verificar autenticação
    if (!window.authService || !window.authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    // Carregar dados iniciais
    await this.loadPortfolios();
    
    // Atualizar cotações de todos os portfólios ao carregar
    await this.updateAllQuotes();
    
    this.setupEventListeners();
  }

  // ============================================================================
  // PORTFOLIOS
  // ============================================================================

  async loadPortfolios() {
    try {
      const token = window.authService.getToken();
      const response = await fetch('/api/portfolios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar portfólios');

      const data = await response.json();
      this.portfolios = data.data || data.portfolios || [];
      
      this.renderPortfolios();
      this.updateStats();
      
      console.log('✅ Portfólios carregados:', this.portfolios.length);
    } catch (error) {
      console.error('❌ Erro ao carregar portfólios:', error);
      this.showNotification('Erro ao carregar portfólios', 'error');
    }
  }

  renderPortfolios() {
    const container = document.getElementById('portfoliosList');
    if (!container) return;

    if (this.portfolios.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum portfólio criado</h3>
          <p class="text-gray-600 mb-6">Comece criando seu primeiro portfólio de investimentos</p>
          <button onclick="dashboard.openCreatePortfolioModal()" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700">
            <i class="fas fa-plus mr-2"></i>Criar Primeiro Portfólio
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.portfolios.map(portfolio => this.renderPortfolioCard(portfolio)).join('')}
      </div>
    `;
  }

  renderPortfolioCard(portfolio) {
    const totalValue = portfolio.totalValue || 0;
    const profitLoss = portfolio.profitLoss || 0;
    const profitLossPercent = portfolio.profitLossPercent || 0;

    return `
      <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer" onclick="dashboard.selectPortfolio('${portfolio.id}')">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">${portfolio.name}</h3>
            <p class="text-sm text-gray-500">${portfolio.description || 'Sem descrição'}</p>
          </div>
          <button onclick="event.stopPropagation(); dashboard.deletePortfolio('${portfolio.id}')" class="text-red-600 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Valor Total:</span>
            <span class="text-lg font-bold text-gray-900">R$ ${this.formatMoney(totalValue)}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Rentabilidade:</span>
            <span class="text-sm font-semibold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}">
              ${profitLoss >= 0 ? '+' : ''}R$ ${this.formatMoney(profitLoss)} (${profitLossPercent.toFixed(2)}%)
            </span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Ativos:</span>
            <span class="text-sm font-semibold text-gray-900">${portfolio.assetsCount || 0}</span>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t">
          <button onclick="event.stopPropagation(); dashboard.openAddAssetModal('${portfolio.id}')" class="w-full bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
            <i class="fas fa-plus mr-2"></i>Adicionar Ativo
          </button>
        </div>
      </div>
    `;
  }

  async selectPortfolio(portfolioId) {
    this.selectedPortfolio = this.portfolios.find(p => p.id === portfolioId);
    if (!this.selectedPortfolio) return;

    await this.loadAssets(portfolioId);
    this.showPortfolioDetails();
  }

  async createPortfolio(data) {
    try {
      const token = window.authService.getToken();
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Erro ao criar portfólio');

      const result = await response.json();
      this.showNotification('Portfólio criado com sucesso!', 'success');
      await this.loadPortfolios();
      this.closeModal('createPortfolioModal');
      
      console.log('✅ Portfólio criado:', result);
    } catch (error) {
      console.error('❌ Erro ao criar portfólio:', error);
      this.showNotification('Erro ao criar portfólio', 'error');
    }
  }

  async deletePortfolio(portfolioId) {
    if (!confirm('Tem certeza que deseja excluir este portfólio?')) return;

    try {
      const token = window.authService.getToken();
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao excluir portfólio');

      this.showNotification('Portfólio excluído com sucesso!', 'success');
      await this.loadPortfolios();
      
      console.log('✅ Portfólio excluído');
    } catch (error) {
      console.error('❌ Erro ao excluir portfólio:', error);
      this.showNotification('Erro ao excluir portfólio', 'error');
    }
  }

  // ============================================================================
  // ASSETS
  // ============================================================================

  async loadAssets(portfolioId) {
    try {
      const token = window.authService.getToken();
      console.log('📡 Carregando ativos do portfólio:', portfolioId);
      
      const response = await fetch(`/api/assets/${portfolioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao carregar ativos');
      }

      const data = await response.json();
      this.assets = data.data || data.assets || [];
      
      console.log('✅ Ativos carregados:', this.assets.length, this.assets);
    } catch (error) {
      console.error('❌ Erro ao carregar ativos:', error);
      this.showNotification('Erro ao carregar ativos', 'error');
    }
  }

  async addAsset(data) {
    try {
      const token = window.authService.getToken();
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Erro ao adicionar ativo');

      const result = await response.json();
      this.showNotification('Ativo adicionado com sucesso!', 'success');
      
      // Se estiver no modal de detalhes, atualizar
      if (this.selectedPortfolio && this.selectedPortfolio.id === data.portfolioId) {
        await this.loadAssets(data.portfolioId);
        this.showPortfolioDetails();
      } else {
        await this.loadPortfolios();
      }
      
      this.closeModal('addAssetModal');
      
      console.log('✅ Ativo adicionado:', result);
    } catch (error) {
      console.error('❌ Erro ao adicionar ativo:', error);
      this.showNotification('Erro ao adicionar ativo', 'error');
    }
  }

  showPortfolioDetails() {
    console.log('📊 Mostrando detalhes do portfólio:', this.selectedPortfolio);
    console.log('📈 Ativos:', this.assets);
    
    // Abrir modal de detalhes
    const modal = document.getElementById('portfolioDetailsModal');
    if (!modal) return;
    
    // Preencher informações do portfólio
    document.getElementById('portfolioDetailsTitle').textContent = this.selectedPortfolio.name;
    document.getElementById('portfolioDetailsDescription').textContent = this.selectedPortfolio.description || 'Sem descrição';
    
    // Calcular valores
    const totalInvested = this.assets.reduce((sum, a) => sum + ((a.averageCost || 0) * (a.quantity || 0)), 0);
    const totalValue = this.assets.reduce((sum, a) => sum + ((a.currentPrice || a.averageCost || 0) * (a.quantity || 0)), 0);
    const profitLoss = totalValue - totalInvested;
    
    document.getElementById('portfolioDetailsTotalValue').textContent = `R$ ${this.formatMoney(totalValue)}`;
    document.getElementById('portfolioDetailsInvested').textContent = `R$ ${this.formatMoney(totalInvested)}`;
    document.getElementById('portfolioDetailsProfitLoss').textContent = `R$ ${this.formatMoney(profitLoss)}`;
    document.getElementById('portfolioDetailsAssetsCount').textContent = this.assets.length;
    
    // Renderizar tabela de ativos
    this.renderAssetsTable();
    
    // Renderizar gráficos
    this.renderCharts();
    
    // Mostrar modal
    modal.classList.remove('hidden');
  }

  renderAssetsTable() {
    const tbody = document.getElementById('assetsTableBody');
    const emptyMessage = document.getElementById('emptyAssetsMessage');
    
    if (!tbody) return;
    
    if (this.assets.length === 0) {
      tbody.innerHTML = '';
      if (emptyMessage) emptyMessage.classList.remove('hidden');
      return;
    }
    
    if (emptyMessage) emptyMessage.classList.add('hidden');
    
    tbody.innerHTML = this.assets.map(asset => {
      const totalValue = (asset.averageCost || 0) * (asset.quantity || 0);
      const typeLabels = {
        'stock': 'Ação',
        'fii': 'FII',
        'etf': 'ETF',
        'crypto': 'Cripto',
        'other': 'Outro'
      };
      
      return `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <span class="text-sm font-bold text-gray-900">${asset.ticker}</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              ${typeLabels[asset.type] || asset.type}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
            ${asset.quantity || 0}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
            R$ ${this.formatMoney(asset.averageCost || 0)}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
            R$ ${this.formatMoney(totalValue)}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
            <button onclick="dashboard.openEditAssetModal('${asset.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="dashboard.deleteAsset('${asset.id}')" class="text-red-600 hover:text-red-900">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderCharts() {
    // Aguardar o DOM estar pronto
    setTimeout(() => {
      this.renderAssetChart();
      this.renderTypeChart();
    }, 100);
  }

  renderAssetChart() {
    const assetChartCanvas = document.getElementById('assetDistributionChart');
    if (!assetChartCanvas || this.assets.length === 0) return;
    
    // Destruir gráfico anterior se existir
    if (window.assetChart) {
      window.assetChart.destroy();
      window.assetChart = null;
    }
    
    const ctx = assetChartCanvas.getContext('2d');
    const data = this.assets.map(a => ({
      label: a.ticker,
      value: (a.averageCost || 0) * (a.quantity || 0)
    }));
    
    window.assetChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percent = ((value / total) * 100).toFixed(1);
                return `${context.label}: R$ ${this.formatMoney(value)} (${percent}%)`;
              }
            }
          }
        }
      }
    });
  }
    
  renderTypeChart() {
    const typeChartCanvas = document.getElementById('typeDistributionChart');
    if (!typeChartCanvas || this.assets.length === 0) return;
    
    // Destruir gráfico anterior se existir
    if (window.typeChart) {
      window.typeChart.destroy();
      window.typeChart = null;
    }
    
    const ctx = typeChartCanvas.getContext('2d');
    const typeData = {};
    this.assets.forEach(a => {
      const value = (a.averageCost || 0) * (a.quantity || 0);
      typeData[a.type] = (typeData[a.type] || 0) + value;
    });
    
    const typeLabels = {
      'stock': 'Ações',
      'fii': 'FIIs',
      'etf': 'ETFs',
      'crypto': 'Criptos',
      'other': 'Outros'
    };
    
    window.typeChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(typeData).map(k => typeLabels[k] || k),
        datasets: [{
          data: Object.values(typeData),
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percent = ((value / total) * 100).toFixed(1);
                return `${context.label}: R$ ${this.formatMoney(value)} (${percent}%)`;
              }
            }
          }
        }
      }
    });
  }

  // ============================================================================
  // MODALS
  // ============================================================================

  openCreatePortfolioModal() {
    const modal = document.getElementById('createPortfolioModal');
    if (modal) {
      modal.classList.remove('hidden');
      document.getElementById('portfolioName').focus();
    }
  }

  openAddAssetModal(portfolioId) {
    const pid = portfolioId || this.selectedPortfolio?.id;
    const modal = document.getElementById('addAssetModal');
    if (modal && pid) {
      document.getElementById('assetPortfolioId').value = pid;
      modal.classList.remove('hidden');
      document.getElementById('assetTicker').focus();
    }
  }

  openEditAssetModal(assetId) {
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset) return;
    
    const modal = document.getElementById('editAssetModal');
    if (!modal) return;
    
    // Preencher formulário
    document.getElementById('editAssetId').value = asset.id;
    document.getElementById('editAssetPortfolioId').value = asset.portfolioId;
    document.getElementById('editAssetTicker').value = asset.ticker;
    document.getElementById('editAssetType').value = asset.type;
    document.getElementById('editAssetQuantity').value = asset.quantity || 0;
    document.getElementById('editAssetPrice').value = asset.averageCost || 0;
    
    modal.classList.remove('hidden');
    document.getElementById('editAssetQuantity').focus();
  }

  async updateAsset(assetId, data) {
    try {
      const token = window.authService.getToken();
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Erro ao atualizar ativo');

      const result = await response.json();
      this.showNotification('Ativo atualizado com sucesso!', 'success');
      await this.loadAssets(this.selectedPortfolio.id);
      this.showPortfolioDetails();
      this.closeModal('editAssetModal');
      
      console.log('✅ Ativo atualizado:', result);
    } catch (error) {
      console.error('❌ Erro ao atualizar ativo:', error);
      this.showNotification('Erro ao atualizar ativo', 'error');
    }
  }

  async deleteAsset(assetId) {
    if (!confirm('Tem certeza que deseja excluir este ativo?')) return;
    
    try {
      const token = window.authService.getToken();
      const portfolioId = this.selectedPortfolio.id;
      const response = await fetch(`/api/assets/${assetId}?portfolioId=${portfolioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao excluir ativo');

      this.showNotification('Ativo excluído com sucesso!', 'success');
      await this.loadAssets(portfolioId);
      this.showPortfolioDetails();
      
      console.log('✅ Ativo excluído');
    } catch (error) {
      console.error('❌ Erro ao excluir ativo:', error);
      this.showNotification('Erro ao excluir ativo', 'error');
    }
  }

  async updateQuotes() {
    if (!this.selectedPortfolio) return;
    
    try {
      const token = window.authService.getToken();
      const portfolioId = this.selectedPortfolio.id;
      
      this.showNotification('Atualizando cotações...', 'info');
      console.log('🔄 Atualizando cotações do portfólio:', portfolioId);
      
      const response = await fetch(`/api/quotes/update-portfolio/${portfolioId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao atualizar cotações');

      const result = await response.json();
      
      if (result.updated > 0) {
        this.showNotification(`${result.updated} cotação(ões) atualizada(s)!`, 'success');
        console.log('✅ Cotações atualizadas:', result.updates);
        
        // Recarregar ativos e atualizar interface
        await this.loadAssets(portfolioId);
        await this.loadPortfolios();
        this.showPortfolioDetails();
      } else {
        this.showNotification('Nenhuma cotação atualizada', 'info');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar cotações:', error);
      this.showNotification('Erro ao atualizar cotações', 'error');
    }
  }

  async updateAllQuotes() {
    if (this.portfolios.length === 0) return;
    
    try {
      const token = window.authService.getToken();
      console.log('🔄 Atualizando cotações de todos os portfólios...');
      
      let totalUpdated = 0;
      
      for (const portfolio of this.portfolios) {
        try {
          const response = await fetch(`/api/quotes/update-portfolio/${portfolio.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            totalUpdated += result.updated || 0;
            console.log(`✅ Portfólio ${portfolio.name}: ${result.updated} cotação(ões) atualizada(s)`);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao atualizar portfólio ${portfolio.name}:`, error);
        }
      }
      
      if (totalUpdated > 0) {
        console.log(`✅ Total: ${totalUpdated} cotação(ões) atualizada(s)`);
        // Recarregar portfólios para pegar valores atualizados
        await this.loadPortfolios();
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar cotações:', error);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      
      // Reset form
      const form = modal.querySelector('form');
      if (form) form.reset();
      
      // Destruir gráficos ao fechar modal de detalhes
      if (modalId === 'portfolioDetailsModal') {
        if (window.assetChart) {
          window.assetChart.destroy();
          window.assetChart = null;
        }
        if (window.typeChart) {
          window.typeChart.destroy();
          window.typeChart = null;
        }
      }
    }
  }

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  updateStats() {
    const totalInvested = this.portfolios.reduce((sum, p) => sum + (p.totalInvested || 0), 0);
    const totalValue = this.portfolios.reduce((sum, p) => sum + (p.totalValue || 0), 0);
    const profitLoss = totalValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    // Update cards
    this.updateStatCard('statTotalInvested', totalInvested);
    this.updateStatCard('statProfitLoss', profitLoss, profitLossPercent);
    
    console.log('📊 Stats atualizados:', { totalInvested, totalValue, profitLoss });
  }

  updateStatCard(elementId, value, percent = null) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = `R$ ${this.formatMoney(Math.abs(value))}`;
    
    if (percent !== null) {
      const parentCard = element.closest('.bg-white');
      const percentElement = parentCard?.querySelector('.text-sm.font-semibold');
      if (percentElement) {
        percentElement.textContent = `${value >= 0 ? '+' : ''}${percent.toFixed(2)}% de retorno`;
        percentElement.className = `text-sm font-semibold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`;
      }
    }
  }

  showNotification(message, type = 'info') {
    const colors = {
      success: 'bg-green-100 text-green-800 border-green-300',
      error: 'bg-red-100 text-red-800 border-red-300',
      info: 'bg-blue-100 text-blue-800 border-blue-300'
    };

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      info: 'fa-info-circle'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} border px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3`;
    notification.innerHTML = `
      <i class="fas ${icons[type]} text-xl"></i>
      <span class="font-medium">${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  formatMoney(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  setupEventListeners() {
    // Criar Portfólio
    const createPortfolioBtn = document.getElementById('createPortfolioBtn');
    if (createPortfolioBtn) {
      createPortfolioBtn.addEventListener('click', () => this.openCreatePortfolioModal());
    }

    // Form de Criar Portfólio
    const createPortfolioForm = document.getElementById('createPortfolioForm');
    if (createPortfolioForm) {
      createPortfolioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          name: document.getElementById('portfolioName').value,
          description: document.getElementById('portfolioDescription').value,
          currency: document.getElementById('portfolioCurrency').value
        };
        this.createPortfolio(data);
      });
    }

    // Form de Adicionar Ativo
    const addAssetForm = document.getElementById('addAssetForm');
    if (addAssetForm) {
      addAssetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ticker = document.getElementById('assetTicker').value.toUpperCase();
        const data = {
          portfolioId: document.getElementById('assetPortfolioId').value,
          ticker: ticker,
          name: ticker, // Nome do ativo (obrigatório)
          type: document.getElementById('assetType').value,
          quantity: parseFloat(document.getElementById('assetQuantity').value) || 0,
          averageCost: parseFloat(document.getElementById('assetPrice').value) || 0,
          currentPrice: parseFloat(document.getElementById('assetPrice').value) || 0
        };
        console.log('📤 Enviando dados do ativo:', data);
        this.addAsset(data);
      });
    }

    // Form de Editar Ativo
    const editAssetForm = document.getElementById('editAssetForm');
    if (editAssetForm) {
      editAssetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const assetId = document.getElementById('editAssetId').value;
        const data = {
          portfolioId: document.getElementById('editAssetPortfolioId').value,
          type: document.getElementById('editAssetType').value,
          quantity: parseFloat(document.getElementById('editAssetQuantity').value) || 0,
          averageCost: parseFloat(document.getElementById('editAssetPrice').value) || 0,
          currentPrice: parseFloat(document.getElementById('editAssetPrice').value) || 0
        };
        console.log('📤 Atualizando ativo:', assetId, data);
        this.updateAsset(assetId, data);
      });
    }

    // Botões de fechar modals
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal-close');
        this.closeModal(modalId);
      });
    });

    console.log('✅ Event listeners configurados');
  }
}

// Inicializar quando o DOM estiver pronto
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
  dashboard = new DashboardManager();
});
