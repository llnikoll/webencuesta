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
