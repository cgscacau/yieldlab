# 🧪 TESTE DO DASHBOARD

## 1. Abra o Console (F12)

### No dashboard (https://a3714220.yieldlab.pages.dev/dashboard)

Cole estes comandos um por um:

```javascript
// 1. Verificar se está autenticado
console.log('Autenticado:', window.authService?.isAuthenticated());

// 2. Ver usuário atual
console.log('Usuário:', window.authService?.getCurrentUser());

// 3. Ver token
console.log('Token:', window.authService?.getToken());

// 4. Verificar localStorage
console.log('LocalStorage User:', localStorage.getItem('yieldlab_user'));
console.log('LocalStorage Token:', localStorage.getItem('yieldlab_token'));

// 5. Testar API manualmente
const token = window.authService?.getToken();
if (token) {
  fetch('/api/portfolios', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(r => r.json())
  .then(data => console.log('✅ API Response:', data))
  .catch(e => console.error('❌ API Error:', e));
} else {
  console.error('❌ Sem token! Faça login novamente');
}
```

---

## 2. POSSÍVEIS PROBLEMAS E SOLUÇÕES

### **Problema 1: Sem Token**
**Sintoma:** `Token: null` ou `undefined`

**Solução:** Faça logout e login novamente
```javascript
// Cole no console:
window.authService.logout();
// Depois vá para /login e faça login novamente
```

### **Problema 2: Token Expirado**
**Sintoma:** API retorna erro 401

**Solução:** Token do Firebase expira após 1 hora. Faça login novamente.

### **Problema 3: Erro de CORS**
**Sintoma:** Erro de CORS no console

**Solução:** Já está configurado no backend, mas verifique se a URL está correta

### **Problema 4: Firebase não inicializado**
**Sintoma:** `authService is undefined`

**Solução:** Recarregue a página (F5)

---

## 3. TESTE CRIAR PORTFÓLIO MANUALMENTE

Cole no console:

```javascript
async function testarCriarPortfolio() {
  const token = window.authService?.getToken();
  
  if (!token) {
    console.error('❌ Sem token! Faça login');
    return;
  }
  
  const response = await fetch('/api/portfolios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Teste Portfolio',
      description: 'Teste via console',
      currency: 'BRL'
    })
  });
  
  const data = await response.json();
  console.log('Resposta:', data);
  
  if (response.ok) {
    console.log('✅ Portfólio criado!', data);
    // Recarregar lista
    dashboard.loadPortfolios();
  } else {
    console.error('❌ Erro:', data);
  }
}

testarCriarPortfolio();
```

---

## 4. FORÇAR RECARREGAR PORTFÓLIOS

Cole no console:

```javascript
dashboard.loadPortfolios();
```

---

## 5. VERIFICAR ERROS

Cole no console:

```javascript
// Ver todos os logs do dashboard
console.log('Dashboard:', dashboard);
console.log('Portfolios:', dashboard.portfolios);
console.log('Auth Service:', window.authService);
```

---

## 📊 RESULTADOS ESPERADOS

### ✅ **Tudo OK:**
```
Autenticado: true
Usuário: {uid: "...", email: "..."}
Token: "eyJhbGciOiJ..."
✅ API Response: {portfolios: []}
```

### ❌ **Problema de Auth:**
```
Autenticado: false
Usuário: null
Token: null
```
**Solução:** Fazer login novamente

### ❌ **Problema de API:**
```
❌ API Error: 401 Unauthorized
```
**Solução:** Token expirado, fazer login novamente

---

## 🔧 SOLUÇÃO RÁPIDA

Se nada funcionar, faça:

```javascript
// 1. Limpar tudo
localStorage.clear();

// 2. Recarregar página
location.reload();

// 3. Fazer login novamente
location.href = '/login';
```

---

## 📝 ME ENVIE O RESULTADO

Depois de colar os comandos, me envie o que apareceu no console:

1. Status de autenticação
2. Se tem token
3. Resultado da API
4. Qualquer mensagem de erro
