// ============================================================================
// QUOTES API ROUTES
// Rotas para buscar e atualizar cotações de ativos
// ============================================================================

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { FirestoreService } from '../services/firebase';
import { YFinanceService } from '../services/yfinance';

const quotes = new Hono();

quotes.use('/*', authMiddleware);

/**
 * POST /api/quotes/update-portfolio/:portfolioId
 * Atualiza cotações de todos os ativos do portfólio
 */
quotes.post('/update-portfolio/:portfolioId', async (c) => {
  try {
    const portfolioId = c.req.param('portfolioId');
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'yieldlab-76d87';
    
    const firestore = new FirestoreService(token, projectId);
    
    // Verificar permissão
    const portfolio = await firestore.getPortfolioById(portfolioId);
    if (!portfolio || portfolio.userId !== user.uid) {
      return c.json({
        success: false,
        error: 'Portfólio não encontrado ou acesso negado'
      }, 403);
    }
    
    // Buscar ativos
    const assets = await firestore.getAssetsByPortfolioId(portfolioId);
    
    if (assets.length === 0) {
      return c.json({
        success: true,
        message: 'Nenhum ativo para atualizar',
        updated: 0
      });
    }
    
    // Buscar cotações
    const tickers = assets.map(a => a.ticker);
    const apiToken = c.env?.BRAPI_API_TOKEN;
    console.log(`📊 Buscando cotações para: ${tickers.join(', ')}${apiToken ? ' (com token PRO)' : ' (sem token)'}`);
    
    const quotes = await YFinanceService.getQuotes(tickers, apiToken);
    console.log(`📈 Cotações retornadas:`, Array.from(quotes.entries()));
    
    // Atualizar cada ativo
    let updated = 0;
    const updates = [];
    
    for (const asset of assets) {
      const quote = quotes.get(asset.ticker.toUpperCase());
      console.log(`🔍 Ativo ${asset.ticker}:`, { quote, hasQuote: !!quote, price: quote?.price });
      
      if (quote && quote.price > 0) {
        await firestore.updateAsset(asset.id, {
          currentPrice: quote.price,
          lastUpdate: new Date().toISOString()
        });
        
        updates.push({
          ticker: asset.ticker,
          oldPrice: asset.currentPrice || asset.averageCost,
          newPrice: quote.price,
          change: quote.change,
          changePercent: quote.changePercent
        });
        
        updated++;
        console.log(`✅ Atualizado ${asset.ticker}: R$ ${asset.currentPrice || asset.averageCost} → R$ ${quote.price}`);
      } else {
        console.warn(`⚠️ Sem cotação para ${asset.ticker}`);
      }
    }
    
    return c.json({
      success: true,
      message: `${updated} ativo(s) atualizado(s)`,
      updated,
      total: assets.length,
      updates
    });
  } catch (error: any) {
    console.error('Error updating quotes:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao atualizar cotações'
    }, 500);
  }
});

/**
 * GET /api/quotes/:ticker
 * Busca cotação de um ticker específico
 */
quotes.get('/:ticker', async (c) => {
  try {
    const ticker = c.req.param('ticker');
    const apiToken = c.env?.BRAPI_API_TOKEN;
    const quote = await YFinanceService.getQuote(ticker, apiToken);
    
    if (!quote) {
      return c.json({
        success: false,
        error: 'Cotação não encontrada'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: quote
    });
  } catch (error: any) {
    console.error('Error fetching quote:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao buscar cotação'
    }, 500);
  }
});

export default quotes;
