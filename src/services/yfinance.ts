// ============================================================================
// BRAPI.DEV SERVICE (API Brasileira de Cotações)
// Serviço para buscar cotações em tempo real de ações brasileiras
// ============================================================================

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export class YFinanceService {
  private static readonly API_URL = 'https://brapi.dev/api/quote';
  
  /**
   * Busca cotação de um único ticker
   */
  static async getQuote(ticker: string): Promise<StockQuote | null> {
    try {
      // Remover sufixo .SA se tiver (Brapi não usa)
      const symbol = ticker.toUpperCase().replace('.SA', '');
      
      const response = await fetch(`${this.API_URL}/${symbol}?range=1d&interval=1d`);
      
      if (!response.ok) {
        console.error(`Brapi error for ${symbol}:`, response.status);
        return null;
      }
      
      const data = await response.json();
      const result = data.results?.[0];
      
      if (!result) return null;
      
      const price = result.regularMarketPrice || 0;
      const change = result.regularMarketChange || 0;
      const changePercent = result.regularMarketChangePercent || 0;
      
      return {
        symbol: symbol,
        price,
        change,
        changePercent,
        timestamp: result.regularMarketTime || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching quote for ${ticker}:`, error);
      return null;
    }
  }
  
  /**
   * Busca cotações de múltiplos tickers em uma única requisição
   */
  static async getQuotes(tickers: string[]): Promise<Map<string, StockQuote>> {
    const quotes = new Map<string, StockQuote>();
    
    if (tickers.length === 0) return quotes;
    
    try {
      // Remover sufixo .SA e juntar tickers com vírgula
      const symbols = tickers.map(t => t.toUpperCase().replace('.SA', '')).join(',');
      
      const response = await fetch(`${this.API_URL}/${symbols}?range=1d&interval=1d`);
      
      if (!response.ok) {
        console.error(`Brapi error for multiple tickers:`, response.status);
        return quotes;
      }
      
      const data = await response.json();
      const results = data.results || [];
      
      for (const result of results) {
        const symbol = result.symbol;
        const price = result.regularMarketPrice || 0;
        const change = result.regularMarketChange || 0;
        const changePercent = result.regularMarketChangePercent || 0;
        
        quotes.set(symbol, {
          symbol,
          price,
          change,
          changePercent,
          timestamp: result.regularMarketTime || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
    }
    
    return quotes;
  }
}
