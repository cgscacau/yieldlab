// ============================================================================
// TRANSACTIONS API ROUTES
// ============================================================================

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { FirestoreService } from '../services/firebase';
import type { Transaction } from '../types';

const transactions = new Hono();

transactions.use('/*', authMiddleware);

/**
 * GET /api/transactions/:portfolioId - Lista transações de um portfólio
 */
transactions.get('/:portfolioId', async (c) => {
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

    const txs = await firestore.getTransactionsByPortfolioId(portfolioId);

    return c.json({ success: true, data: txs });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /api/transactions - Cria uma nova transação
 */
transactions.post('/', async (c) => {
  try {
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID';
    const body = await c.req.json();

    const { portfolioId, assetId, type, ticker, quantity, price, fees, date, notes } = body;

    if (!portfolioId || !assetId || !type || !ticker || !quantity || !price || !date) {
      return c.json({
        success: false,
        error: 'Campos obrigatórios: portfolioId, assetId, type, ticker, quantity, price, date'
      }, 400);
    }

    const firestore = new FirestoreService(token, projectId);
    const portfolio = await firestore.getPortfolioById(portfolioId);
    
    if (!portfolio || portfolio.userId !== user.uid) {
      return c.json({ success: false, error: 'Acesso negado' }, 403);
    }

    const total = quantity * price;

    const newTransaction: Omit<Transaction, 'id'> = {
      portfolioId,
      assetId,
      userId: user.uid,
      type,
      ticker: ticker.toUpperCase(),
      quantity,
      price,
      total,
      fees: fees || 0,
      date,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    const created = await firestore.createTransaction(newTransaction);

    return c.json({
      success: true,
      data: created,
      message: 'Transação criada com sucesso'
    }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * DELETE /api/transactions/:id - Deleta uma transação
 */
transactions.delete('/:id', async (c) => {
  try {
    const txId = c.req.param('id');
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID';
    const portfolioId = c.req.query('portfolioId');

    if (!portfolioId) {
      return c.json({ success: false, error: 'portfolioId é obrigatório' }, 400);
    }

    const firestore = new FirestoreService(token, projectId);
    const portfolio = await firestore.getPortfolioById(portfolioId);
    
    if (!portfolio || portfolio.userId !== user.uid) {
      return c.json({ success: false, error: 'Acesso negado' }, 403);
    }

    await firestore.deleteTransaction(txId);

    return c.json({ success: true, message: 'Transação deletada com sucesso' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default transactions;
