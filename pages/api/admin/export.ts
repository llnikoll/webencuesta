import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { validateAdminSession } from '@/lib/auth';

function checkAdminAuth(req: NextApiRequest): boolean {
  const token = req.cookies.admin_token;
  return token ? validateAdminSession(token) : false;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const { pollId } = req.query;

    if (!pollId || typeof pollId !== 'string') {
      return res.status(400).json({ error: 'ID de encuesta inválida' });
    }

    const votes = await prisma.vote.findMany({
      where: { pollId },
      include: { option: { select: { text: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Generar CSV
    let csv = 'Opción,IP Hash,Device Fingerprint,User Agent,Fecha\n';
    
    votes.forEach((vote: any) => {
      const row = [
        vote.option.text,
        vote.ipHash.substring(0, 16),
        vote.deviceFingerprint.substring(0, 16),
        vote.userAgent.substring(0, 50).replace(/,/g, ' '),
        new Date(vote.createdAt).toLocaleString(),
      ];
      csv += `"${row.join('","')}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="votos.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exportando CSV:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
