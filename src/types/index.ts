// ============================================================================
// TYPES & INTERFACES - YieldLab
// ============================================================================

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  portfolioId: string;
  userId: string;
  ticker: string;
  name: string;
  type: 'stock' | 'reit' | 'etf' | 'fii' | 'crypto' | 'other';
  quantity: number;
  averageCost: number;
  currentPrice: number;
  purchaseDate?: string; // Data de compra do ativo
  sector?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  assetId: string;
  userId: string;
  type: 'buy' | 'sell' | 'dividend' | 'jscp' | 'split' | 'bonification';
  ticker: string;
  quantity: number;
  price: number;
  total: number;
  fees: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Dividend {
  id: string;
  portfolioId: string;
  assetId: string;
  userId: string;
  ticker: string;
  type: 'dividend' | 'jscp' | 'income';
  amount: number;
  quantity: number;
  pricePerShare: number;
  paymentDate: string;
  exDate?: string;
  taxAmount: number;
  netAmount: number;
  createdAt: string;
}

export interface PortfolioMetrics {
  totalInvested: number;
  currentValue: number;
  totalGain: number;
  totalGainPercent: number;
  totalDividends: number;
  dividendYield: number;
  monthlyDividends: number;
  assetAllocation: AssetAllocation[];
  sectorAllocation: SectorAllocation[];
}

export interface AssetAllocation {
  ticker: string;
  name: string;
  value: number;
  percent: number;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percent: number;
}

export interface DividendCalendar {
  ticker: string;
  assetName: string;
  type: string;
  expectedAmount: number;
  paymentDate: string;
  exDate?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  fill?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface ImportCSVData {
  ticker: string;
  date: string;
  type: string;
  quantity: number;
  price: number;
  fees?: number;
}
