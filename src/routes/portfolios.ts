// ============================================================================
// PORTFOLIOS API ROUTES
// ============================================================================

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { FirestoreService } from '../services/firebase';
import type { Portfolio } from '../types';

const portfolios = new Hono();

// Todas as rotas requerem autenticação
portfolios.use('/*', authMiddleware);

/**
 * GET /api/portfolios - Lista todos os portfólios do usuário
 */
portfolios.get('/', async (c) => {
  try {
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'yieldlab-76d87';
    
    const firestore = new FirestoreService(token, projectId);
    const userPortfolios = await firestore.getPortfoliosByUserId(user.uid);

    // Calcular valores de cada portfólio
    const portfoliosWithMetrics = await Promise.all(
      userPortfolios.map(async (portfolio) => {
        try {
          const assets = await firestore.getAssetsByPortfolioId(portfolio.id);
          
          const totalInvested = assets.reduce((sum, a) => 
            sum + ((a.averageCost || 0) * (a.quantity || 0)), 0
          );
          
          const totalValue = assets.reduce((sum, a) => 
            sum + ((a.currentPrice || a.averageCost || 0) * (a.quantity || 0)), 0
          );
          
          const profitLoss = totalValue - totalInvested;
          const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
          
          return {
            ...portfolio,
            totalInvested,
            totalValue,
            profitLoss,
            profitLossPercent,
            assetsCount: assets.length
          };
        } catch (assetError) {
          console.error(`Error loading assets for portfolio ${portfolio.id}:`, assetError);
          // Retornar portfólio sem métricas em caso de erro
          return {
            ...portfolio,
            totalInvested: 0,
            totalValue: 0,
            profitLoss: 0,
            profitLossPercent: 0,
            assetsCount: 0
          };
        }
      })
    );

    return c.json({
      success: true,
      data: portfoliosWithMetrics
    });
  } catch (error: any) {
    console.error('Error fetching portfolios:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao buscar portfólios'
    }, 500);
  }
});

/**
 * GET /api/portfolios/:id - Busca um portfólio específico
 */
portfolios.get('/:id', async (c) => {
  try {
    const portfolioId = c.req.param('id');
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'yieldlab-76d87';
    
    const firestore = new FirestoreService(token, projectId);
    const portfolio = await firestore.getPortfolioById(portfolioId);

    if (!portfolio) {
      return c.json({
        success: false,
        error: 'Portfólio não encontrado'
      }, 404);
    }

    // Verifica se o portfólio pertence ao usuário
    if (portfolio.userId !== user.uid) {
      return c.json({
        success: false,
        error: 'Acesso negado'
      }, 403);
    }

    return c.json({
      success: true,
      data: portfolio
    });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao buscar portfólio'
    }, 500);
  }
});

/**
 * POST /api/portfolios - Cria um novo portfólio
 */
portfolios.post('/', async (c) => {
  try {
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'yieldlab-76d87';
    const body = await c.req.json();

    const { name, description } = body;

    if (!name || name.trim() === '') {
      return c.json({
        success: false,
        error: 'Nome do portfólio é obrigatório'
      }, 400);
    }

    const newPortfolio: Omit<Portfolio, 'id'> = {
      userId: user.uid,
      name: name.trim(),
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const firestore = new FirestoreService(token, projectId);
    const created = await firestore.createPortfolio(newPortfolio);

    return c.json({
      success: true,
      data: created,
      message: 'Portfólio criado com sucesso'
    }, 201);
  } catch (error: any) {
    console.error('Error creating portfolio:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao criar portfólio'
    }, 500);
  }
});

/**
 * PATCH /api/portfolios/:id - Atualiza um portfólio
 */
portfolios.patch('/:id', async (c) => {
  try {
    const portfolioId = c.req.param('id');
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'yieldlab-76d87';
    const body = await c.req.json();

    const firestore = new FirestoreService(token, projectId);
    const portfolio = await firestore.getPortfolioById(portfolioId);

    if (!portfolio) {
      return c.json({
        success: false,
        error: 'Portfólio não encontrado'
      }, 404);
    }

    if (portfolio.userId !== user.uid) {
      return c.json({
        success: false,
        error: 'Acesso negado'
      }, 403);
    }

    const updates: Partial<Portfolio> = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    const updated = await firestore.updatePortfolio(portfolioId, updates);

    return c.json({
      success: true,
      data: updated,
      message: 'Portfólio atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating portfolio:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao atualizar portfólio'
    }, 500);
  }
});

/**
 * DELETE /api/portfolios/:id - Deleta um portfólio
 */
portfolios.delete('/:id', async (c) => {
  try {
    const portfolioId = c.req.param('id');
    const user = c.get('user');
    const token = c.get('firebaseToken');
    const projectId = c.env?.FIREBASE_PROJECT_ID || 'yieldlab-76d87';

    const firestore = new FirestoreService(token, projectId);
    const portfolio = await firestore.getPortfolioById(portfolioId);

    if (!portfolio) {
      return c.json({
        success: false,
        error: 'Portfólio não encontrado'
      }, 404);
    }

    if (portfolio.userId !== user.uid) {
      return c.json({
        success: false,
        error: 'Acesso negado'
      }, 403);
    }

    await firestore.deletePortfolio(portfolioId);

    return c.json({
      success: true,
      message: 'Portfólio deletado com sucesso'
    });
  } catch (error: any) {
    console.error('Error deleting portfolio:', error);
    return c.json({
      success: false,
      error: error.message || 'Erro ao deletar portfólio'
    }, 500);
  }
});

export default portfolios;
