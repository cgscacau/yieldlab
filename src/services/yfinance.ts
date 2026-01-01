// ============================================================================
// YAHOO FINANCE SERVICE
// Serviço para buscar cotações em tempo real
// ============================================================================

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export class YFinanceService {
  private static readonly API_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
  
  /**
   * Busca cotação de um único ticker
   */
  static async getQuote(ticker: string): Promise<StockQuote | null> {
    try {
      // Adicionar sufixo .SA para ações brasileiras se não tiver
      const symbol = ticker.toUpperCase().includes('.SA') ? ticker : `${ticker}.SA`;
      
      const response = await fetch(`${this.API_URL}/${symbol}?interval=1d&range=1d`);
      
      if (!response.ok) {
        console.error(`Yahoo Finance error for ${symbol}:`, response.status);
        return null;
      }
      
      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) return null;
      
      const meta = result.meta;
      const price = meta.regularMarketPrice || 0;
      const previousClose = meta.chartPreviousClose || meta.previousClose || price;
      const change = price - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
      
      return {
        symbol: ticker.toUpperCase(),
        price,
        change,
        changePercent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching quote for ${ticker}:`, error);
      return null;
    }
  }
  
  /**
   * Busca cotações de múltiplos tickers
   */
  static async getQuotes(tickers: string[]): Promise<Map<string, StockQuote>> {
    const quotes = new Map<string, StockQuote>();
    
    // Buscar em paralelo com limite de 5 por vez para não sobrecarregar
    const batchSize = 5;
    for (let i = 0; i < tickers.length; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(ticker => this.getQuote(ticker))
      );
      
      results.forEach((quote, index) => {
        if (quote) {
          quotes.set(batch[index].toUpperCase(), quote);
        }
      });
    }
    
    return quotes;
  }
}
