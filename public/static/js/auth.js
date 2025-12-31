// ============================================================================
// AUTHENTICATION MODULE
// ============================================================================

class AuthService {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.loadFromStorage();
  }

  /**
   * Carrega dados do usuário do localStorage
   */
  loadFromStorage() {
    const userData = localStorage.getItem('investfolio_user');
    const token = localStorage.getItem('investfolio_token');
    
    if (userData && token) {
      this.currentUser = JSON.parse(userData);
      this.token = token;
    }
  }

  /**
   * Salva dados do usuário no localStorage
   */
  saveToStorage(user, token) {
    localStorage.setItem('investfolio_user', JSON.stringify(user));
    localStorage.setItem('investfolio_token', token);
    this.currentUser = user;
    this.token = token;
  }

  /**
   * Remove dados do localStorage
   */
  clearStorage() {
    localStorage.removeItem('investfolio_user');
    localStorage.removeItem('investfolio_token');
    this.currentUser = null;
    this.token = null;
  }

  /**
   * Registra novo usuário
   */
  async register(email, password, displayName) {
    if (!window.IS_FIREBASE_CONFIGURED) {
      throw new Error('Firebase não está configurado. Veja firebase-config.js');
    }

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${window.FIREBASE_CONFIG.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao registrar usuário');
      }

      // Atualiza nome do usuário
      if (displayName) {
        await this.updateProfile(data.idToken, displayName);
      }

      const user = {
        uid: data.localId,
        email: data.email,
        displayName: displayName || email.split('@')[0]
      };

      this.saveToStorage(user, data.idToken);
      return user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  /**
   * Faz login
   */
  async login(email, password) {
    if (!window.IS_FIREBASE_CONFIGURED) {
      throw new Error('Firebase não está configurado. Veja firebase-config.js');
    }

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${window.FIREBASE_CONFIG.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao fazer login');
      }

      const user = {
        uid: data.localId,
        email: data.email,
        displayName: data.displayName || email.split('@')[0]
      };

      this.saveToStorage(user, data.idToken);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(token, displayName, photoUrl = '') {
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${window.FIREBASE_CONFIG.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: token,
            displayName,
            photoUrl,
            returnSecureToken: true
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao atualizar perfil');
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  logout() {
    this.clearStorage();
    window.location.href = '/login';
  }

  /**
   * Verifica se está autenticado
   */
  isAuthenticated() {
    return this.token !== null && this.currentUser !== null;
  }

  /**
   * Obtém token de autenticação
   */
  getToken() {
    return this.token;
  }

  /**
   * Obtém usuário atual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Requer autenticação (redireciona se não autenticado)
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }
}

// Instância global
window.authService = new AuthService();
