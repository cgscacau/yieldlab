// ============================================================================
// API CLIENT
// ============================================================================

class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Faz requisição HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = window.authService.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        // Token expirado ou inválido
        if (response.status === 401) {
          window.authService.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        throw new Error(data.error || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ========== PORTFOLIOS ==========

  async getPortfolios() {
    return this.request('/api/portfolios');
  }

  async getPortfolio(id) {
    return this.request(`/api/portfolios/${id}`);
  }

  async createPortfolio(data) {
    return this.request('/api/portfolios', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePortfolio(id, data) {
    return this.request(`/api/portfolios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deletePortfolio(id) {
    return this.request(`/api/portfolios/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== ASSETS ==========

  async getAssets(portfolioId) {
    return this.request(`/api/assets/${portfolioId}`);
  }

  async createAsset(data) {
    return this.request('/api/assets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateAsset(id, data) {
    return this.request(`/api/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteAsset(id, portfolioId) {
    return this.request(`/api/assets/${id}?portfolioId=${portfolioId}`, {
      method: 'DELETE'
    });
  }

  // ========== TRANSACTIONS ==========

  async getTransactions(portfolioId) {
    return this.request(`/api/transactions/${portfolioId}`);
  }

  async createTransaction(data) {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteTransaction(id, portfolioId) {
    return this.request(`/api/transactions/${id}?portfolioId=${portfolioId}`, {
      method: 'DELETE'
    });
  }

  // ========== DIVIDENDS ==========

  async getDividends(portfolioId) {
    return this.request(`/api/dividends/${portfolioId}`);
  }

  async createDividend(data) {
    return this.request('/api/dividends', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ========== METRICS ==========

  async getMetrics(portfolioId) {
    return this.request(`/api/metrics/${portfolioId}`);
  }

  // ========== IMPORT CSV ==========

  async importCSV(portfolioId, csvData) {
    return this.request('/api/import-csv', {
      method: 'POST',
      body: JSON.stringify({ portfolioId, csvData })
    });
  }

  // ========== HEALTH CHECK ==========

  async healthCheck() {
    return this.request('/api/health');
  }
}

// Instância global
window.apiClient = new ApiClient();
