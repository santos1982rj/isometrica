/**
 * @file aulas.ts
 * @description Rotas de acesso às aulas e progresso.
 * 
 * - GET  /api/aulas/:slug           → retorna detalhes da aula (busca por slug ou id)
 * - POST /api/aulas/:id/concluir    → marca aula como concluída
 * 
 * Utiliza o helper prisma.ts para compatibilidade com SQLite (dev) e PostgreSQL (prod).
 * 
 * @see Middleware: src/middleware/auth.ts
 * @see Prisma Helper: src/lib/prisma.ts
 */

import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { verificarToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

const JWT_SECRET = process.env.JWT_SECRET || 'no-na-armadura-secret-dev';

/* ═══════════════════════════════════════════════════════════════
   GET /api/aulas/:slug
   ═══════════════════════════════════════════════════════════════ */

/**
 * Retorna os detalhes de uma aula específica.
 * Busca por slug ou por id (fallback).
 * 
 * Se o usuário estiver autenticado e matriculado, inclui o progresso.
 * Aulas não gratuitas são bloqueadas para não matriculados.
 * 
 * @param slug - Slug ou ID da aula (na URL)
 * @returns 200 com dados da aula, curso, módulo e progresso
 * @returns 404 se aula não encontrada
 * @returns 500 em caso de erro interno
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as { slug: string };
    const isId = !isNaN(Number(slug));

    // Busca a aula com seu módulo e curso
    const aula = await prisma.aula.findFirst({
      where: isId ? { id: Number(slug) } : { slug },
      include: {
        modulo: {
          include: { curso: true },
        },
      },
    });

    if (!aula) {
      res.status(404).json({ erro: 'Aula não encontrada.' });
      return;
    }

    // Busca os módulos do curso separadamente
    const modulos = await prisma.modulo.findMany({
      where: { cursoId: aula.modulo.curso.id },
      orderBy: { ordem: 'asc' },
      include: {
        aulas: {
          orderBy: { ordem: 'asc' },
          select: {
            id: true,
            titulo: true,
            slug: true,
            duracao: true,
            gratuito: true,
            ordem: true,
          },
        },
      },
    });

    // Verifica matrícula e progresso (se houver token de autenticação)
    let progresso = null;
    let matriculado = false;

    const authHeader = req.headers.authorization;

    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        if (token) {
          const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

          // Verifica se o usuário está matriculado no curso
          const matricula = await prisma.matricula.findFirst({
            where: {
              userId: payload.userId,
              cursoId: aula.modulo.curso.id,
              status: 'ATIVO',
            },
          });
          matriculado = !!matricula;

          // Verifica progresso na aula específica
          if (matriculado) {
            const prog = await prisma.progressoAula.findUnique({
              where: {
                userId_aulaId: {
                  userId: payload.userId,
                  aulaId: aula.id,
                },
              },
            });
            progresso = prog;
          }
        }
      } catch {
        // Token inválido ou expirado: ignora silenciosamente
      }
    }

    // Se a aula não for gratuita e o usuário não estiver matriculado, bloqueia o conteúdo
    const bloqueada = !aula.gratuito && !matriculado;

    res.json({
      aula: {
        id: aula.id,
        titulo: aula.titulo,
        slug: aula.slug,
        descricao: aula.descricao,
        conteudo: bloqueada ? null : aula.conteudo,
        videoUrl: bloqueada ? null : aula.videoUrl,
        duracao: aula.duracao,
        ordem: aula.ordem,
        gratuito: aula.gratuito,
        bloqueada,
      },
      modulo: {
        id: aula.modulo.id,
        titulo: aula.modulo.titulo,
        ordem: aula.modulo.ordem,
      },
      curso: {
        id: aula.modulo.curso.id,
        titulo: aula.modulo.curso.titulo,
        slug: aula.modulo.curso.slug,
        modulos: modulos,
      },
      progresso,
      matriculado,
    });
  } catch (erro) {
    console.error('Erro ao buscar aula:', erro);
    res.status(500).json({ erro: 'Erro ao carregar aula.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   POST /api/aulas/:id/concluir
   ═══════════════════════════════════════════════════════════════ */

/**
 * Marca uma aula como concluída e atualiza o progresso do curso.
 * Concede 10 XP ao usuário.
 * Requer autenticação.
 * 
 * @param id - ID da aula (na URL)
 * @returns 200 com dados do progresso
 * @returns 403 se não estiver matriculado (exceto aulas gratuitas)
 * @returns 404 se aula não encontrada
 * @returns 500 em caso de erro interno
 */
router.post('/:id/concluir', verificarToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Busca a aula com seu módulo e curso
    const aula = await prisma.aula.findUnique({
      where: { id: Number(id) },
      include: { modulo: { include: { curso: true } } },
    });

    if (!aula) {
      res.status(404).json({ erro: 'Aula não encontrada.' });
      return;
    }

    // Verifica se o usuário está matriculado no curso
    const matricula = await prisma.matricula.findFirst({
      where: {
        userId,
        cursoId: aula.modulo.curso.id,
        status: 'ATIVO',
      },
    });

    // Aulas gratuitas podem ser concluídas sem matrícula
    if (!matricula && !aula.gratuito) {
      res.status(403).json({
        erro: 'Matricule-se no curso para marcar aulas como concluídas.',
      });
      return;
    }

    // Upsert: cria ou atualiza o progresso da aula
    await prisma.progressoAula.upsert({
      where: {
        userId_aulaId: { userId, aulaId: Number(id) },
      },
      update: {
        concluida: true,
        concluidaEm: new Date(),
      },
      create: {
        userId,
        aulaId: Number(id),
        concluida: true,
        concluidaEm: new Date(),
      },
    });

    // Atualiza o progresso geral do curso (se matriculado)
    if (matricula) {
      const totalAulas = await prisma.aula.count({
        where: { modulo: { cursoId: aula.modulo.curso.id } },
      });

      const concluidas = await prisma.progressoAula.count({
        where: {
          userId,
          concluida: true,
          aula: { modulo: { cursoId: aula.modulo.curso.id } },
        },
      });

      const percentual = totalAulas > 0 ? (concluidas / totalAulas) * 100 : 0;

      await prisma.matricula.update({
        where: { id: matricula.id },
        data: {
          progresso: percentual,
          concluido: percentual === 100,
          dataConclusao: percentual === 100 ? new Date() : null,
        },
      });
    }

    // Concede XP ao usuário
    await prisma.user.update({
      where: { id: userId },
      data: { xpTotal: { increment: 10 } },
    });

    res.json({
      mensagem: 'Aula concluída! +10 XP',
    });
  } catch (erro) {
    console.error('Erro ao concluir aula:', erro);
    res.status(500).json({ erro: 'Erro ao marcar aula como concluída.' });
  }
});

export default router;
