#!/usr/bin/env node

/**
 * Script para atualizar cotações diretamente no Firestore
 * Uso: node update-quotes.js <FIREBASE_TOKEN> <USER_ID> <PORTFOLIO_ID>
 */

const https = require('https');

const BRAPI_TOKEN = 'neCCcmX2AynTnvLpiH25TY';
const FIREBASE_PROJECT_ID = 'yieldlab-76d87';

// Argumentos
const [,, firebaseToken, userId, portfolioId] = process.argv;

if (!firebaseToken || !userId || !portfolioId) {
  console.error('❌ Uso: node update-quotes.js <FIREBASE_TOKEN> <USER_ID> <PORTFOLIO_ID>');
  process.exit(1);
}

// Função para fazer requisições HTTPS
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function updateQuotes() {
  console.log('🚀 Iniciando atualização de cotações...\n');

  // 1. Buscar ativos do Firestore
  console.log('📊 Buscando ativos do Firestore...');
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/assets?pageSize=100`;
  
  const assetsData = await httpsRequest(firestoreUrl, {
    headers: {
      'Authorization': `Bearer ${firebaseToken}`
    }
  });

  if (!assetsData.documents) {
    console.error('❌ Nenhum ativo encontrado!');
    return;
  }

  // Filtrar ativos do portfólio
  const assets = assetsData.documents
    .filter(doc => {
      const portfolioIdField = doc.fields.portfolioId?.stringValue;
      return portfolioIdField === portfolioId;
    })
    .map(doc => {
      const pathParts = doc.name.split('/');
      return {
        id: pathParts[pathParts.length - 1],
        ticker: doc.fields.ticker?.stringValue,
        averageCost: doc.fields.averageCost?.doubleValue || 0,
        currentPrice: doc.fields.currentPrice?.doubleValue || 0,
        quantity: doc.fields.quantity?.doubleValue || 0
      };
    });

  console.log(`✅ Encontrados ${assets.length} ativos\n`);

  // 2. Buscar cotações da Brapi
  const tickers = assets.map(a => a.ticker).join(',');
  console.log(`📈 Buscando cotações para: ${tickers}`);
  
  const brapiUrl = `https://brapi.dev/api/quote/${tickers}?token=${BRAPI_TOKEN}`;
  const brapiData = await httpsRequest(brapiUrl);

  if (!brapiData.results) {
    console.error('❌ Erro ao buscar cotações da Brapi!');
    return;
  }

  console.log(`✅ Cotações recebidas: ${brapiData.results.length}\n`);

  // 3. Atualizar cada ativo
  let updated = 0;
  for (const asset of assets) {
    const quote = brapiData.results.find(q => q.symbol === asset.ticker);
    
    if (!quote) {
      console.log(`⚠️  ${asset.ticker}: Cotação não encontrada`);
      continue;
    }

    const newPrice = quote.regularMarketPrice;
    const oldPrice = asset.currentPrice || asset.averageCost;

    console.log(`💰 ${asset.ticker}: R$ ${oldPrice.toFixed(2)} → R$ ${newPrice.toFixed(2)}`);

    // Atualizar no Firestore
    const updateUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/assets/${asset.id}`;
    
    const updateData = {
      fields: {
        currentPrice: { doubleValue: newPrice },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    };

    await httpsRequest(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    console.log(`   ✅ Atualizado no Firestore!`);
    updated++;
  }

  console.log(`\n🎉 ${updated} cotação(ões) atualizada(s) com sucesso!`);

  // Calcular valores totais
  const totalInvested = assets.reduce((sum, a) => sum + (a.averageCost * a.quantity), 0);
  const totalValue = assets.reduce((sum, a) => {
    const quote = brapiData.results.find(q => q.symbol === a.ticker);
    const price = quote ? quote.regularMarketPrice : a.averageCost;
    return sum + (price * a.quantity);
  }, 0);
  const profit = totalValue - totalInvested;
  const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  console.log('\n📊 RESUMO DA CARTEIRA:');
  console.log(`   Investido: R$ ${totalInvested.toFixed(2)}`);
  console.log(`   Valor Atual: R$ ${totalValue.toFixed(2)}`);
  console.log(`   Rentabilidade: R$ ${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`);
}

updateQuotes().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
