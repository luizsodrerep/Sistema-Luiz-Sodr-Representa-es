
// pages/api/auth/login.ts
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { User } from '@/app/types/system';
import type { NextApiRequest, NextApiResponse } from 'next';

// Dados mockados - substituir por consulta ao banco de dados
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@system.com',
    role: 'admin',
    permissions: ['all'],
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMy.MH/rW9sWYp.EiwT6QOteN5LwQ1L1K.C' // "admin123"
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    const user = mockUsers.find(u => u.email === username);

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const passwordMatch = await compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Remove a senha antes de retornar os dados do usuário
    const { passwordHash, ...userData } = user;

    // Cria token JWT (em produção, use variáveis de ambiente para o secret)
    const token = sign(
      { userId: user.id, role: user.role },
      'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}