// ============================================================================
// DIVIDENDS API ROUTES
// ============================================================================

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { FirestoreService } from '../services/firebase';
import type { Dividend } from '../types';

const dividends = new Hono();

dividends.use('/*', authMiddleware);

/**
 * GET /api/dividends/:portfolioId - Lista dividendos de um portfólio
 */
dividends.get('/:portfolioId', async (c) => {
  try {
    const portfolioId = c.req.param('portfolioId');
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID';
    
    const firestore = new FirestoreService(token, projectId);
    const portfolio = await firestore.getPortfolioById(portfolioId);
    
    if (!portfolio || portfolio.userId !== user.uid) {
      return c.json({ success: false, error: 'Acesso negado' }, 403);
    }

    const divs = await firestore.getDividendsByPortfolioId(portfolioId);

    return c.json({ success: true, data: divs });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/dividends - Registra um novo dividendo
 */
dividends.post('/', async (c) => {
  try {
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID';
    const body = await c.req.json();

    const { portfolioId, assetId, ticker, type, amount, quantity, paymentDate, exDate } = body;

    if (!portfolioId || !assetId || !ticker || !type || !amount || !quantity || !paymentDate) {
      return c.json({
        success: false,
        error: 'Campos obrigatórios: portfolioId, assetId, ticker, type, amount, quantity, paymentDate'
      }, 400);
    }

    const firestore = new FirestoreService(token, projectId);
    const portfolio = await firestore.getPortfolioById(portfolioId);
    
    if (!portfolio || portfolio.userId !== user.uid) {
      return c.json({ success: false, error: 'Acesso negado' }, 403);
    }

    const pricePerShare = amount / quantity;
    const taxAmount = type === 'jscp' ? amount * 0.15 : 0;
    const netAmount = amount - taxAmount;

    const newDividend: Omit<Dividend, 'id'> = {
      portfolioId,
      assetId,
      userId: user.uid,
      ticker: ticker.toUpperCase(),
      type,
      amount,
      quantity,
      pricePerShare,
      paymentDate,
      exDate: exDate || '',
      taxAmount,
      netAmount,
      createdAt: new Date().toISOString()
    };

    const created = await firestore.createDividend(newDividend);

    return c.json({
      success: true,
      data: created,
      message: 'Dividendo registrado com sucesso'
    }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default dividends;
