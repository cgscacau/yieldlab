// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

/**
 * INSTRUÇÕES DE CONFIGURAÇÃO:
 * 
 * 1. Acesse https://console.firebase.google.com/
 * 2. Crie um novo projeto ou selecione um existente
 * 3. Vá em "Project Settings" (ícone de engrenagem)
 * 4. Role até "Your apps" e clique em "Web app" (</>)
 * 5. Registre seu app e copie as credenciais
 * 6. Cole as credenciais abaixo
 * 
 * 7. Ative Firestore:
 *    - No menu lateral, vá em "Firestore Database"
 *    - Clique em "Create database"
 *    - Escolha "Start in test mode" (ou production mode com regras)
 *    - Selecione uma localização (us-central, southamerica-east1, etc.)
 * 
 * 8. Ative Authentication:
 *    - No menu lateral, vá em "Authentication"
 *    - Clique em "Get started"
 *    - Na aba "Sign-in method", ative:
 *      - Email/Password
 *      - Google (opcional)
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Validação de configuração
function isFirebaseConfigured() {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" && 
         firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

// Exporta configuração
window.FIREBASE_CONFIG = firebaseConfig;
window.IS_FIREBASE_CONFIGURED = isFirebaseConfigured();

// Mensagem de aviso se não configurado
if (!isFirebaseConfigured()) {
  console.warn(`
    ⚠️ FIREBASE NÃO CONFIGURADO!
    
    Por favor, edite o arquivo /public/static/js/firebase-config.js
    e adicione suas credenciais do Firebase.
    
    Veja as instruções no topo do arquivo.
  `);
}
