import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { validateAdminSession } from '@/lib/auth';

type ResponseData = {
  totalVotes?: number;
  totalOptions?: number;
  options?: Array<{ 
    text: string; 
    votes: number;
    name?: string;
    party?: string;
    image?: string;
  }>;
  votes?: Array<any>;
  error?: string;
};

function checkAdminAuth(req: NextApiRequest): boolean {
  const token = req.cookies.admin_token;
  return token ? validateAdminSession(token) : false;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
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
        votes: {
          include: { option: { select: { text: true } } },
        },
      },
    });

    if (!poll) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }

    const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);

    res.status(200).json({
      totalVotes,
      totalOptions: poll.options.length,
      options: poll.options,
      votes: poll.votes,
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
