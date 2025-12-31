// ============================================================================
// CALCULATIONS UTILITY - YieldLab
// ============================================================================

import type { Asset, Transaction, Dividend, PortfolioMetrics, AssetAllocation, SectorAllocation } from '../types';

/**
 * Calcula o custo médio de um ativo baseado nas transações
 */
export function calculateAverageCost(transactions: Transaction[]): number {
  let totalCost = 0;
  let totalQuantity = 0;

  const buyTransactions = transactions.filter(t => t.type === 'buy');
  
  for (const tx of buyTransactions) {
    totalCost += (tx.price * tx.quantity) + tx.fees;
    totalQuantity += tx.quantity;
  }

  return totalQuantity > 0 ? totalCost / totalQuantity : 0;
}

/**
 * Calcula a quantidade atual de um ativo considerando compras e vendas
 */
export function calculateCurrentQuantity(transactions: Transaction[]): number {
  let quantity = 0;

  for (const tx of transactions) {
    if (tx.type === 'buy' || tx.type === 'bonification') {
      quantity += tx.quantity;
    } else if (tx.type === 'sell') {
      quantity -= tx.quantity;
    } else if (tx.type === 'split') {
      // Exemplo: split 2:1 dobra a quantidade
      quantity *= tx.quantity;
    }
  }

  return quantity;
}

/**
 * Calcula o total investido em um ativo
 */
export function calculateTotalInvested(transactions: Transaction[]): number {
  let total = 0;

  for (const tx of transactions) {
    if (tx.type === 'buy') {
      total += tx.total + tx.fees;
    } else if (tx.type === 'sell') {
      total -= tx.total - tx.fees;
    }
  }

  return total;
}

/**
 * Calcula o valor atual de mercado de um ativo
 */
export function calculateCurrentValue(asset: Asset): number {
  return asset.quantity * asset.currentPrice;
}

/**
 * Calcula o ganho/perda de um ativo
 */
export function calculateGain(asset: Asset, totalInvested: number): { amount: number; percent: number } {
  const currentValue = calculateCurrentValue(asset);
  const gain = currentValue - totalInvested;
  const percent = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

  return { amount: gain, percent };
}

/**
 * Calcula o dividend yield de um ativo
 */
export function calculateDividendYield(
  dividends: Dividend[], 
  asset: Asset, 
  periodMonths: number = 12
): number {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - periodMonths);

  const recentDividends = dividends.filter(d => 
    d.assetId === asset.id && new Date(d.paymentDate) >= cutoffDate
  );

  const totalDividends = recentDividends.reduce((sum, d) => sum + d.netAmount, 0);
  const currentValue = calculateCurrentValue(asset);

  return currentValue > 0 ? (totalDividends / currentValue) * 100 : 0;
}

/**
 * Calcula métricas completas de um portfólio
 */
export function calculatePortfolioMetrics(
  assets: Asset[],
  transactions: Transaction[],
  dividends: Dividend[]
): PortfolioMetrics {
  let totalInvested = 0;
  let currentValue = 0;
  let totalDividends = 0;

  const assetAllocation: AssetAllocation[] = [];
  const sectorMap = new Map<string, number>();

  for (const asset of assets) {
    const assetTransactions = transactions.filter(t => t.assetId === asset.id);
    const invested = calculateTotalInvested(assetTransactions);
    const value = calculateCurrentValue(asset);

    totalInvested += invested;
    currentValue += value;

    // Asset allocation
    assetAllocation.push({
      ticker: asset.ticker,
      name: asset.name,
      value,
      percent: 0 // Será calculado depois
    });

    // Sector allocation
    const sector = asset.sector || 'Outros';
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + value);
  }

  // Calcula porcentagens
  assetAllocation.forEach(a => {
    a.percent = currentValue > 0 ? (a.value / currentValue) * 100 : 0;
  });

  const sectorAllocation: SectorAllocation[] = Array.from(sectorMap.entries()).map(([sector, value]) => ({
    sector,
    value,
    percent: currentValue > 0 ? (value / currentValue) * 100 : 0
  }));

  // Total de dividendos
  totalDividends = dividends.reduce((sum, d) => sum + d.netAmount, 0);

  // Dividendos mensais (últimos 12 meses)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const recentDividends = dividends.filter(d => new Date(d.paymentDate) >= oneYearAgo);
  const monthlyDividends = recentDividends.reduce((sum, d) => sum + d.netAmount, 0) / 12;

  // Dividend yield do portfólio
  const dividendYield = currentValue > 0 ? (totalDividends / currentValue) * 100 : 0;

  const totalGain = currentValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalGain,
    totalGainPercent,
    totalDividends,
    dividendYield,
    monthlyDividends,
    assetAllocation: assetAllocation.sort((a, b) => b.value - a.value),
    sectorAllocation: sectorAllocation.sort((a, b) => b.value - a.value)
  };
}

/**
 * Calcula IR sobre ganho de capital
 */
export function calculateCapitalGainsTax(profit: number): number {
  if (profit <= 0) return 0;
  
  // Alíquota de 15% sobre lucro em ações (Brasil)
  return profit * 0.15;
}

/**
 * Calcula IR sobre dividendos (JSCP)
 */
export function calculateDividendTax(amount: number, type: 'dividend' | 'jscp'): number {
  if (type === 'dividend') return 0; // Dividendos isentos no Brasil
  if (type === 'jscp') return amount * 0.15; // JSCP tem 15% de IR na fonte
  return 0;
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata porcentagem
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

/**
 * Calcula evolução patrimonial mês a mês
 */
export function calculatePatrimonyEvolution(
  transactions: Transaction[],
  assets: Asset[]
): { month: string; value: number }[] {
  const monthlyData = new Map<string, number>();

  // Ordena transações por data
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningTotal = 0;

  for (const tx of sortedTransactions) {
    const monthKey = tx.date.substring(0, 7); // YYYY-MM
    
    if (tx.type === 'buy') {
      runningTotal += tx.total + tx.fees;
    } else if (tx.type === 'sell') {
      runningTotal -= tx.total - tx.fees;
    }

    monthlyData.set(monthKey, runningTotal);
  }

  return Array.from(monthlyData.entries())
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Calcula evolução de proventos mês a mês
 */
export function calculateDividendsEvolution(dividends: Dividend[]): { month: string; value: number }[] {
  const monthlyData = new Map<string, number>();

  for (const div of dividends) {
    const monthKey = div.paymentDate.substring(0, 7); // YYYY-MM
    monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + div.netAmount);
  }

  return Array.from(monthlyData.entries())
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
