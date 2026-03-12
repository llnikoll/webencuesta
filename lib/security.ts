import crypto from 'crypto';

/**
 * Genera un hash SHA256 de la IP del usuario
 */
export function hashIpAddress(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Extrae la IP real del usuario considerando proxies
 */
export function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress;
  return ip || 'unknown';
}

/**
 * Genera un device fingerprint basado en user agent y otros datos
 */
export function generateDeviceFingerprint(userAgent: string, acceptLanguage?: string): string {
  const combined = `${userAgent}${acceptLanguage || ''}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Genera una cookie ID única
 */
export function generateCookieId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Valida que el voto no sea un intento duplicado
 */
export async function validateNoDuplicateVote(
  prisma: any,
  pollId: string,
  ipHash: string,
  deviceFingerprint: string,
  cookieId: string
): Promise<boolean> {
  const existingVote = await prisma.vote.findFirst({
    where: {
      pollId,
      OR: [
        { ipHash },
        { deviceFingerprint },
        { cookieId }
      ]
    }
  });

  return !existingVote;
}

/**
 * Obtiene la IP del cliente desde la request
 */
export function extractClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}
