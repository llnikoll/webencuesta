import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type ResponseData = {
  id?: string;
  title?: string;
  options?: Array<{ 
    id: string; 
    text: string; 
    votes: number;
    name?: string;
    party?: string;
    image?: string;
  }>;
  createdAt?: string;
  revealAt?: string;
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
          select: { 
            id: true, 
            text: true, 
            votes: true,
            name: true,
            party: true,
            image: true,
          },
        },
      },
    });

    if (!poll) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }

    res.status(200).json({
      id: poll.id,
      title: poll.title,
      options: poll.options,
      createdAt: poll.createdAt.toISOString(),
      revealAt: poll.revealAt.toISOString(),
    });
  } catch (error) {
    console.error('Error obteniendo encuesta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
