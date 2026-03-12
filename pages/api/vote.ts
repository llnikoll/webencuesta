import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { 
  hashIpAddress, 
  generateDeviceFingerprint, 
  validateNoDuplicateVote,
  extractClientIp 
} from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimit';
import { isValidInput } from '@/lib/validation';

type ResponseData = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { pollId, optionId, deviceFingerprint, userAgent } = req.body;

    // Validar inputs
    if (!pollId || !optionId) {
      return res.status(400).json({ error: 'Faltan parámetros' });
    }

    if (!isValidInput(pollId) || !isValidInput(optionId)) {
      return res.status(400).json({ error: 'Entrada inválida' });
    }

    // Obtener IP del cliente
    const clientIp = extractClientIp(req);
    const ipHash = hashIpAddress(clientIp);

    // Rate limiting por IP
    if (!checkRateLimit(ipHash, 3, 60000)) {
      return res.status(429).json({ error: 'Demasiados intentos. Intenta más tarde.' });
    }

    // Validar que la encuesta existe
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }

    // Validar que la opción existe y pertenece a esta encuesta
    const option = poll.options.find((opt) => opt.id === optionId);
    if (!option) {
      return res.status(400).json({ error: 'Opción inválida' });
    }

    // Generar ID de cookie
    const cookieId = req.cookies['vote_id'] || `vote_${Date.now()}_${Math.random()}`;

    // Validar que no hay voto duplicado
    const isValid = await validateNoDuplicateVote(
      prisma,
      pollId,
      ipHash,
      deviceFingerprint,
      cookieId
    );

    if (!isValid) {
      return res.status(409).json({ 
        error: 'Este dispositivo ya registró un voto' 
      });
    }

    // Registrar el voto
    await prisma.$transaction([
      prisma.vote.create({
        data: {
          pollId,
          optionId,
          ipHash,
          deviceFingerprint,
          userAgent: userAgent || req.headers['user-agent'] || 'unknown',
          cookieId,
        },
      }),
      prisma.option.update({
        where: { id: optionId },
        data: { votes: { increment: 1 } },
      }),
    ]);

    // Establecer cookie de votación
    res.setHeader('Set-Cookie', `vote_id=${cookieId}; Path=/; Max-Age=${365 * 24 * 60 * 60}; HttpOnly; SameSite=Strict`);

    res.status(200).json({ 
      success: true, 
      message: 'Tu voto fue registrado correctamente' 
    });
  } catch (error) {
    console.error('Error votando:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
