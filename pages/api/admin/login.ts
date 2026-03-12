import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { verifyAdminCredentials, generateAdminToken } from '@/lib/auth';

type ResponseData = {
  success?: boolean;
  token?: string;
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
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    if (!verifyAdminCredentials(username, password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateAdminToken();

    // Establecer cookie de sesión
    res.setHeader(
      'Set-Cookie',
      `admin_token=${token}; Path=/; Max-Age=${60 * 60 * 24}; HttpOnly; SameSite=Strict`
    );

    res.status(200).json({
      success: true,
      token,
      message: 'Autenticación exitosa',
    });
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
