/**
 * Rate limiting simple en memoria
 * En producción, usar Redis
 */
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 3,
  windowMs: number = 60000 // 1 minuto
): boolean {
  const now = Date.now();
  const record = rateLimitStore[identifier];

  if (!record || now > record.resetTime) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + windowMs
    };
    return true;
  }

  if (record.count < maxRequests) {
    record.count++;
    return true;
  }

  return false;
}

/**
 * Limpia los registros expirados de rate limiting
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  }
}

// Ejecutar limpieza cada 5 minutos
setInterval(cleanupRateLimit, 5 * 60 * 1000);
