import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

type ResponseData = {
  success?: boolean;
  poll?: any;
  polls?: any[];
  error?: string;
};

// GET /api/admin/polls - Listar todas las encuestas
// POST /api/admin/polls - Crear nueva encuesta
// PUT /api/admin/polls - Actualizar encuesta
// DELETE /api/admin/polls - Eliminar encuesta

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Verificar autenticación
  const authError = await requireAuth(req, res);
  if (authError) return;

  try {
    switch (req.method) {
      case 'GET':
        return await getPolls(req, res);
      case 'POST':
        return await createPoll(req, res);
      case 'PUT':
        return await updatePoll(req, res);
      case 'DELETE':
        return await deletePoll(req, res);
      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en polls API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getPolls(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { pollId } = req.query;
  
  if (pollId && typeof pollId === 'string') {
    // Obtener una encuesta específica con todas sus opciones
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });
    
    if (!poll) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }
    
    return res.status(200).json({ poll });
  }
  
  // Obtener todas las encuestas
  const polls = await prisma.poll.findMany({
    include: { options: true },
    orderBy: { createdAt: 'desc' },
  });
  
  return res.status(200).json({ polls });
}

async function createPoll(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { title, options, revealAt } = req.body;
  
  if (!title || !options || !Array.isArray(options) || options.length === 0) {
    return res.status(400).json({ error: 'Título y opciones son requeridos' });
  }
  
  // Calcular fecha de revelación (default: 72 horas)
  const revealDate = revealAt 
    ? new Date(revealAt) 
    : new Date(Date.now() + 72 * 60 * 60 * 1000);
  
  const poll = await prisma.poll.create({
    data: {
      title,
      revealAt: revealDate,
      options: {
        create: options.map((opt: any) => ({
          text: opt.text,
          name: opt.name || null,
          party: opt.party || null,
          image: opt.image || null,
        })),
      },
    },
    include: { options: true },
  });
  
  return res.status(201).json({ success: true, poll });
}

async function updatePoll(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { pollId, title, options, revealAt } = req.body;
  
  if (!pollId) {
    return res.status(400).json({ error: 'ID de encuesta requerido' });
  }
  
  // Verificar que la encuesta existe
  const existingPoll = await prisma.poll.findUnique({
    where: { id: pollId },
  });
  
  if (!existingPoll) {
    return res.status(404).json({ error: 'Encuesta no encontrada' });
  }
  
  const updateData: any = {};
  if (title) updateData.title = title;
  if (revealAt) updateData.revealAt = new Date(revealAt);
  
  // Si se envían opciones, eliminar las existentes y crear nuevas
  if (options && Array.isArray(options)) {
    // Eliminar opciones existentes
    await prisma.option.deleteMany({
      where: { pollId },
    });
    
    // Crear nuevas opciones
    updateData.options = {
      create: options.map((opt: any) => ({
        text: opt.text,
        name: opt.name || null,
        party: opt.party || null,
        image: opt.image || null,
      })),
    };
  }
  
  const poll = await prisma.poll.update({
    where: { id: pollId },
    data: updateData,
    include: { options: true },
  });
  
  return res.status(200).json({ success: true, poll });
}

async function deletePoll(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { pollId } = req.query;
  
  if (!pollId || typeof pollId !== 'string') {
    return res.status(400).json({ error: 'ID de encuesta requerido' });
  }
  
  // Verificar que la encuesta existe
  const existingPoll = await prisma.poll.findUnique({
    where: { id: pollId },
  });
  
  if (!existingPoll) {
    return res.status(404).json({ error: 'Encuesta no encontrada' });
  }
  
  // Eliminar encuesta y todo lo relacionado (cascada)
  await prisma.poll.delete({
    where: { id: pollId },
  });
  
  return res.status(200).json({ success: true });
}
