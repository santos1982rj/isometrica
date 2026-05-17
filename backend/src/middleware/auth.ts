import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'no-na-armadura-secret-dev';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function verificarToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) { res.status(401).json({ erro: 'Token não fornecido.' }); return; }
  const token = authHeader.split(' ')[1];
  if (!token) { res.status(401).json({ erro: 'Token mal formatado.' }); return; }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch { res.status(401).json({ erro: 'Token inválido ou expirado.' }); }
}

export function autorizar(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) { res.status(401).json({ erro: 'Autenticação necessária.' }); return; }
    const usuario = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { role: true } });
    if (!usuario || !roles.includes(usuario.role)) { res.status(403).json({ erro: 'Acesso negado.' }); return; }
    next();
  };
}
