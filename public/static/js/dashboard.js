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
      const response = await fetch(`/api/assets?portfolioId=${portfolioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar ativos');

      const data = await response.json();
      this.assets = data.data || data.assets || [];
      
      console.log('✅ Ativos carregados:', this.assets.length);
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
      await this.loadPortfolios();
      this.closeModal('addAssetModal');
      
      console.log('✅ Ativo adicionado:', result);
    } catch (error) {
      console.error('❌ Erro ao adicionar ativo:', error);
      this.showNotification('Erro ao adicionar ativo', 'error');
    }
  }

  showPortfolioDetails() {
    // TODO: Implementar modal/página de detalhes do portfólio com lista de ativos
    console.log('📊 Mostrando detalhes do portfólio:', this.selectedPortfolio);
    console.log('📈 Ativos:', this.assets);
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
    const modal = document.getElementById('addAssetModal');
    if (modal) {
      document.getElementById('assetPortfolioId').value = portfolioId;
      modal.classList.remove('hidden');
      document.getElementById('assetTicker').focus();
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      // Reset form
      const form = modal.querySelector('form');
      if (form) form.reset();
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
        const data = {
          portfolioId: document.getElementById('assetPortfolioId').value,
          ticker: document.getElementById('assetTicker').value.toUpperCase(),
          type: document.getElementById('assetType').value,
          quantity: parseFloat(document.getElementById('assetQuantity').value),
          averagePrice: parseFloat(document.getElementById('assetPrice').value)
        };
        this.addAsset(data);
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
