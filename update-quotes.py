#!/usr/bin/env python3
"""
Script para atualizar cotações diretamente no Firestore
Uso: python3 update-quotes.py <FIREBASE_TOKEN> <PORTFOLIO_ID>
"""

import sys
import json
import urllib.request
import urllib.error

BRAPI_TOKEN = 'neCCcmX2AynTnvLpiH25TY'
FIREBASE_PROJECT_ID = 'yieldlab-76d87'
PORTFOLIO_ID = 'portfolio_1767275777126'  # Seu portfolio ID

def http_request(url, method='GET', headers=None, data=None):
    """Faz requisição HTTP"""
    req = urllib.request.Request(url, method=method, headers=headers or {})
    if data:
        req.data = json.dumps(data).encode('utf-8')
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f'❌ HTTP Error {e.code}: {e.read().decode()}')
        raise

def update_quotes(firebase_token):
    print('🚀 Iniciando atualização de cotações...\n')

    # 1. Buscar ativos do Firestore
    print('📊 Buscando ativos do Firestore...')
    firestore_url = f'https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/assets?pageSize=100'
    
    assets_data = http_request(firestore_url, headers={
        'Authorization': f'Bearer {firebase_token}'
    })

    if 'documents' not in assets_data:
        print('❌ Nenhum ativo encontrado!')
        return

    # Filtrar ativos do portfólio
    assets = []
    for doc in assets_data['documents']:
        portfolio_id_field = doc['fields'].get('portfolioId', {}).get('stringValue')
        if portfolio_id_field == PORTFOLIO_ID:
            path_parts = doc['name'].split('/')
            assets.append({
                'id': path_parts[-1],
                'ticker': doc['fields'].get('ticker', {}).get('stringValue'),
                'averageCost': doc['fields'].get('averageCost', {}).get('doubleValue', 0),
                'currentPrice': doc['fields'].get('currentPrice', {}).get('doubleValue', 0),
                'quantity': doc['fields'].get('quantity', {}).get('doubleValue', 0)
            })

    print(f'✅ Encontrados {len(assets)} ativos\n')

    # 2. Buscar cotações da Brapi
    tickers = ','.join([a['ticker'] for a in assets])
    print(f'📈 Buscando cotações para: {tickers}')
    
    brapi_url = f'https://brapi.dev/api/quote/{tickers}?token={BRAPI_TOKEN}'
    brapi_data = http_request(brapi_url)

    if 'results' not in brapi_data:
        print('❌ Erro ao buscar cotações da Brapi!')
        return

    print(f'✅ Cotações recebidas: {len(brapi_data["results"])}\n')

    # 3. Atualizar cada ativo
    updated = 0
    for asset in assets:
        quote = next((q for q in brapi_data['results'] if q['symbol'] == asset['ticker']), None)
        
        if not quote:
            print(f'⚠️  {asset["ticker"]}: Cotação não encontrada')
            continue

        new_price = quote['regularMarketPrice']
        old_price = asset['currentPrice'] or asset['averageCost']

        print(f'💰 {asset["ticker"]}: R$ {old_price:.2f} → R$ {new_price:.2f}')

        # Atualizar no Firestore
        update_url = f'https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/assets/{asset["id"]}'
        
        update_data = {
            'fields': {
                'currentPrice': {'doubleValue': new_price},
                'updatedAt': {'stringValue': '2026-01-01T14:30:00.000Z'}
            }
        }

        http_request(update_url, method='PATCH', headers={
            'Authorization': f'Bearer {firebase_token}',
            'Content-Type': 'application/json'
        }, data=update_data)

        print(f'   ✅ Atualizado no Firestore!')
        updated += 1

    print(f'\n🎉 {updated} cotação(ões) atualizada(s) com sucesso!')

    # Calcular valores totais
    total_invested = sum(a['averageCost'] * a['quantity'] for a in assets)
    total_value = 0
    for asset in assets:
        quote = next((q for q in brapi_data['results'] if q['symbol'] == asset['ticker']), None)
        price = quote['regularMarketPrice'] if quote else asset['averageCost']
        total_value += price * asset['quantity']
    
    profit = total_value - total_invested
    profit_percent = (profit / total_invested * 100) if total_invested > 0 else 0

    print('\n📊 RESUMO DA CARTEIRA:')
    print(f'   Investido: R$ {total_invested:.2f}')
    print(f'   Valor Atual: R$ {total_value:.2f}')
    print(f'   Rentabilidade: R$ {profit:.2f} ({profit_percent:.2f}%)')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('❌ Uso: python3 update-quotes.py <FIREBASE_TOKEN>')
        sys.exit(1)
    
    firebase_token = sys.argv[1]
    update_quotes(firebase_token)
