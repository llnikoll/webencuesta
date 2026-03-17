/**
 * Verifica credenciales del administrador
 */
export function verifyAdminCredentials(username: string, password: string): boolean {
  const ADMIN_USER = process.env.ADMIN_USER || 'nicolas';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '6454';

  return username === ADMIN_USER && password === ADMIN_PASSWORD;
}

/**
 * Obtiene o establece una cookie de sesión admin
 */
export function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(7);
  return `admin_${timestamp}_${random}`;
}

/**
 * Valida un token de sesión admin
 */
export function validateAdminSession(token: string): boolean {
  // En producción, usar JWT con expiración
  // Para este ejemplo, validar que tenga el formato correcto
  return token && token.startsWith('admin_');
}

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Middleware para requerir autenticación en API routes
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<null | { error: string }> {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies?.admin_token;
  
  if (!token || !validateAdminSession(token)) {
    res.status(401).json({ error: 'No autorizado' });
    return { error: 'No autorizado' };
  }
  
  return null;
}
