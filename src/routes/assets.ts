// ============================================================================
// ASSETS API ROUTES
// ============================================================================

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { FirestoreService } from '../services/firebase';
import type { Asset } from '../types';

const assets = new Hono();

assets.use('/*', authMiddleware);

/**
 * GET /api/assets/:portfolioId - Lista ativos de um portfólio
 */
assets.get('/:portfolioId', async (c) => {
  try {
    const portfolioId = c.req.param('portfolioId');
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'yieldlab-76d87';
    
    const firestore = new FirestoreService(token, projectId);
    
    // Verifica se o portfólio pertence ao usuário
    const portfolio = await firestore.getPortfolioById(portfolioId);
    if (!portfolio || portfolio.userId !== user.uid) {
      return c.json({
        success: false,
        error: 'Portfólio não encontrado ou acesso negado'
      }, 403);
    }

    const portfolioAssets = await firestore.getAssetsByPortfolioId(portfolioId);

    return c.json({
      success: true,
      data: portfolioAssets
    });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao buscar ativos'
    }, 500);
  }
});

/**
 * POST /api/assets - Cria um novo ativo
 */
assets.post('/', async (c) => {
  try {
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'yieldlab-76d87';
    const body = await c.req.json();

    const { portfolioId, ticker, name, type, quantity, averageCost, currentPrice, sector, purchaseDate } = body;

    if (!portfolioId || !ticker || !name || !type) {
      return c.json({
        success: false,
        error: 'Campos obrigatórios: portfolioId, ticker, name, type'
      }, 400);
    }

    const firestore = new FirestoreService(token, projectId);
    
    // Verifica permissão
    const portfolio = await firestore.getPortfolioById(portfolioId);
    if (!portfolio || portfolio.userId !== user.uid) {
      return c.json({
        success: false,
        error: 'Portfólio não encontrado ou acesso negado'
      }, 403);
    }

    const newAsset: Omit<Asset, 'id'> = {
      portfolioId,
      userId: user.uid,
      ticker: ticker.toUpperCase(),
      name,
      type,
      quantity: quantity || 0,
      averageCost: averageCost || 0,
      currentPrice: currentPrice || 0,
      sector: sector || 'Outros',
      purchaseDate: purchaseDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await firestore.createAsset(newAsset);

    return c.json({
      success: true,
      data: created,
      message: 'Ativo criado com sucesso'
    }, 201);
  } catch (error: any) {
    console.error('Error creating asset:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao criar ativo'
    }, 500);
  }
});

/**
 * PATCH /api/assets/:id - Atualiza um ativo
 */
assets.patch('/:id', async (c) => {
  try {
    const assetId = c.req.param('id');
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'yieldlab-76d87';
    const body = await c.req.json();

    const firestore = new FirestoreService(token, projectId);
    
    // Busca o ativo para verificar permissão
    const assets = await firestore.getAssetsByPortfolioId(body.portfolioId || '');
    const asset = assets.find(a => a.id === assetId);

    if (!asset || asset.userId !== user.uid) {
      return c.json({
        success: false,
        error: 'Ativo não encontrado ou acesso negado'
      }, 403);
    }

    const updates: Partial<Asset> = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    const updated = await firestore.updateAsset(assetId, updates);

    return c.json({
      success: true,
      data: updated,
      message: 'Ativo atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating asset:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao atualizar ativo'
    }, 500);
  }
});

/**
 * DELETE /api/assets/:id - Deleta um ativo
 */
assets.delete('/:id', async (c) => {
  try {
    const assetId = c.req.param('id');
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'yieldlab-76d87';
    const portfolioId = c.req.query('portfolioId');

    if (!portfolioId) {
      return c.json({
        success: false,
        error: 'portfolioId é obrigatório'
      }, 400);
    }

    const firestore = new FirestoreService(token, projectId);
    const assets = await firestore.getAssetsByPortfolioId(portfolioId);
    const asset = assets.find(a => a.id === assetId);

    if (!asset || asset.userId !== user.uid) {
      return c.json({
        success: false,
        error: 'Ativo não encontrado ou acesso negado'
      }, 403);
    }

    await firestore.deleteAsset(assetId);

    return c.json({
      success: true,
      message: 'Ativo deletado com sucesso'
    });
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao deletar ativo'
    }, 500);
  }
});

export default assets;
