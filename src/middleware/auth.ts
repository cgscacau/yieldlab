// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

import { Context, Next } from 'hono';

/**
 * Middleware para validar token Firebase
 * O token deve vir no header Authorization: Bearer <token>
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Token de autenticação não fornecido' }, 401);
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  try {
    // Valida token usando Firebase Auth REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${c.env?.FIREBASE_API_KEY || 'YOUR_API_KEY'}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token })
      }
    );

    if (!response.ok) {
      return c.json({ success: false, error: 'Token inválido ou expirado' }, 401);
    }

    const data = await response.json();
    
    if (!data.users || data.users.length === 0) {
      return c.json({ success: false, error: 'Usuário não encontrado' }, 401);
    }

    // Armazena dados do usuário no contexto
    c.set('user', {
      uid: data.users[0].localId,
      email: data.users[0].email,
      emailVerified: data.users[0].emailVerified
    });

    // Armazena token para uso nos serviços
    c.set('firebaseToken', token);

    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ success: false, error: 'Erro ao validar token' }, 401);
  }
}

/**
 * Middleware opcional - permite requests sem autenticação
 */
export async function optionalAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${c.env?.FIREBASE_API_KEY || 'YOUR_API_KEY'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.users && data.users.length > 0) {
          c.set('user', {
            uid: data.users[0].localId,
            email: data.users[0].email,
            emailVerified: data.users[0].emailVerified
          });
          c.set('firebaseToken', token);
        }
      }
    } catch (error) {
      // Ignora erros em auth opcional
      console.warn('Optional auth failed:', error);
    }
  }

  await next();
}
