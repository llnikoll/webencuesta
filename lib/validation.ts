/**
 * Sanitiza entrada de usuario para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valida que una entrada sea segura
 */
export function isValidInput(input: string, maxLength: number = 500): boolean {
  if (typeof input !== 'string' || input.length === 0) {
    return false;
  }

  if (input.length > maxLength) {
    return false;
  }

  // Rechazar si contiene caracteres sospechosos
  const suspiciousPatterns = /<script|javascript:|on\w+\s*=|eval\(|expression\(/gi;
  return !suspiciousPatterns.test(input);
}

/**
 * Genera un token CSRF
 */
export function generateCSRFToken(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}

/**
 * Valida un token CSRF
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false;
  }
  // Usar comparación timing-safe en producción
  return token === storedToken;
}
