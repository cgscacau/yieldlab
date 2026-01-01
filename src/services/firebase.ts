// ============================================================================
// FIREBASE SERVICE - Backend Integration
// ============================================================================

import type { Portfolio, Asset, Transaction, Dividend } from '../types';

/**
 * Firebase Firestore REST API Service
 * Usa a REST API do Firestore para operações CRUD
 * Não requer bibliotecas Node.js, compatível com Cloudflare Workers
 */

const FIREBASE_PROJECT_ID = 'yieldlab-76d87'; // Substituir pela variável de ambiente
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

interface FirestoreDocument {
  name: string;
  fields: Record<string, any>;
  createTime: string;
  updateTime: string;
}

/**
 * Converte dados TypeScript para formato Firestore
 */
function toFirestoreFields(data: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      fields[key] = { doubleValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(v => ({ stringValue: String(v) }))
        }
      };
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: toFirestoreFields(value) } };
    }
  }
  
  return fields;
}

/**
 * Converte documento Firestore para objeto TypeScript
 */
function fromFirestoreDocument(doc: FirestoreDocument): any {
  const data: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(doc.fields)) {
    if ('stringValue' in value) {
      data[key] = value.stringValue;
    } else if ('doubleValue' in value) {
      data[key] = value.doubleValue;
    } else if ('integerValue' in value) {
      data[key] = parseInt(value.integerValue);
    } else if ('booleanValue' in value) {
      data[key] = value.booleanValue;
    } else if ('arrayValue' in value) {
      data[key] = value.arrayValue.values?.map((v: any) => v.stringValue || v.doubleValue) || [];
    } else if ('nullValue' in value) {
      data[key] = null;
    } else {
      // Log campos não reconhecidos para debug
      console.warn(`Campo Firestore não reconhecido: ${key}`, value);
      data[key] = undefined;
    }
  }
  
  // Extrai ID do documento
  const pathParts = doc.name.split('/');
  data.id = pathParts[pathParts.length - 1];
  
  // Log para debug
  console.log('Documento Firestore convertido:', { id: data.id, ticker: data.ticker, name: data.name });
  
  return data;
}

/**
 * Service class para operações Firestore
 */
export class FirestoreService {
  private baseUrl: string;
  private token: string;

  constructor(token: string, projectId: string = FIREBASE_PROJECT_ID) {
    this.token = token;
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Firestore error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // ========== PORTFOLIOS ==========
  
  async createPortfolio(portfolio: Omit<Portfolio, 'id'>): Promise<Portfolio> {
    const docId = `portfolio_${Date.now()}`;
    const fields = toFirestoreFields(portfolio);
    
    const result = await this.request(`/portfolios?documentId=${docId}`, {
      method: 'POST',
      body: JSON.stringify({ fields })
    });
    
    return fromFirestoreDocument(result);
  }

  async getPortfoliosByUserId(userId: string): Promise<Portfolio[]> {
    const result = await this.request(`/portfolios?pageSize=100`);
    
    if (!result.documents) return [];
    
    return result.documents
      .map((doc: FirestoreDocument) => fromFirestoreDocument(doc))
      .filter((p: Portfolio) => p.userId === userId);
  }

  async getPortfolioById(portfolioId: string): Promise<Portfolio | null> {
    try {
      const result = await this.request(`/portfolios/${portfolioId}`);
      return fromFirestoreDocument(result);
    } catch {
      return null;
    }
  }

  async updatePortfolio(portfolioId: string, data: Partial<Portfolio>): Promise<Portfolio> {
    const fields = toFirestoreFields(data);
    const result = await this.request(`/portfolios/${portfolioId}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields })
    });
    
    return fromFirestoreDocument(result);
  }

  async deletePortfolio(portfolioId: string): Promise<void> {
    await this.request(`/portfolios/${portfolioId}`, {
      method: 'DELETE'
    });
  }

  // ========== ASSETS ==========
  
  async createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
    const docId = `asset_${Date.now()}`;
    const fields = toFirestoreFields(asset);
    
    const result = await this.request(`/assets?documentId=${docId}`, {
      method: 'POST',
      body: JSON.stringify({ fields })
    });
    
    return fromFirestoreDocument(result);
  }

  async getAssetsByPortfolioId(portfolioId: string): Promise<Asset[]> {
    const result = await this.request(`/assets?pageSize=100`);
    
    if (!result.documents) return [];
    
    return result.documents
      .map((doc: FirestoreDocument) => fromFirestoreDocument(doc))
      .filter((a: Asset) => a.portfolioId === portfolioId);
  }

  async updateAsset(assetId: string, data: Partial<Asset>): Promise<Asset> {
    const fields = toFirestoreFields(data);
    const result = await this.request(`/assets/${assetId}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields })
    });
    
    return fromFirestoreDocument(result);
  }

  async deleteAsset(assetId: string): Promise<void> {
    await this.request(`/assets/${assetId}`, {
      method: 'DELETE'
    });
  }

  // ========== TRANSACTIONS ==========
  
  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const docId = `tx_${Date.now()}`;
    const fields = toFirestoreFields(transaction);
    
    const result = await this.request(`/transactions?documentId=${docId}`, {
      method: 'POST',
      body: JSON.stringify({ fields })
    });
    
    return fromFirestoreDocument(result);
  }

  async getTransactionsByPortfolioId(portfolioId: string): Promise<Transaction[]> {
    const result = await this.request(`/transactions?pageSize=200`);
    
    if (!result.documents) return [];
    
    return result.documents
      .map((doc: FirestoreDocument) => fromFirestoreDocument(doc))
      .filter((t: Transaction) => t.portfolioId === portfolioId)
      .sort((a: Transaction, b: Transaction) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    await this.request(`/transactions/${transactionId}`, {
      method: 'DELETE'
    });
  }

  // ========== DIVIDENDS ==========
  
  async createDividend(dividend: Omit<Dividend, 'id'>): Promise<Dividend> {
    const docId = `div_${Date.now()}`;
    const fields = toFirestoreFields(dividend);
    
    const result = await this.request(`/dividends?documentId=${docId}`, {
      method: 'POST',
      body: JSON.stringify({ fields })
    });
    
    return fromFirestoreDocument(result);
  }

  async getDividendsByPortfolioId(portfolioId: string): Promise<Dividend[]> {
    const result = await this.request(`/dividends?pageSize=200`);
    
    if (!result.documents) return [];
    
    return result.documents
      .map((doc: FirestoreDocument) => fromFirestoreDocument(doc))
      .filter((d: Dividend) => d.portfolioId === portfolioId)
      .sort((a: Dividend, b: Dividend) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
  }
}

export default FirestoreService;
