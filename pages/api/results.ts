import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { shouldRevealResults } from '@/lib/time';

type ResponseData = {
  revealed?: boolean;
  totalVotes?: number;
  options?: Array<{ id: string; text: string; votes: number }>;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { pollId } = req.query;

    if (!pollId || typeof pollId !== 'string') {
      return res.status(400).json({ error: 'ID de encuesta inválida' });
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          select: { id: true, text: true, votes: true },
        },
      },
    });

    if (!poll) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }

    const isRevealed = shouldRevealResults(poll.revealAt);
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    if (!isRevealed) {
      return res.status(200).json({
        revealed: false,
        totalVotes: 0,
        options: [],
      });
    }

    res.status(200).json({
      revealed: true,
      totalVotes,
      options: poll.options,
    });
  } catch (error) {
    console.error('Error obteniendo resultados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
