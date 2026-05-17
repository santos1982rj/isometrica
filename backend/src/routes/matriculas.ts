/**
 * @file matriculas.ts
 * @description Rotas de matrícula em cursos.
 * 
 * - POST /api/cursos/:cursoId/matricular → matricular-se em um curso
 * - GET  /api/meus-cursos               → listar cursos do usuário logado
 * 
 * Utiliza o helper prisma.ts para compatibilidade com SQLite (dev) e PostgreSQL (prod).
 * 
 * @see Middleware: src/middleware/auth.ts
 * @see Prisma Helper: src/lib/prisma.ts
 */

import { Router, type Request, type Response } from 'express';
import { verificarToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/* ═══════════════════════════════════════════════════════════════
   Middleware de autenticação para todas as rotas
   ═══════════════════════════════════════════════════════════════ */

router.use(verificarToken);

/* ═══════════════════════════════════════════════════════════════
   POST /api/cursos/:cursoId/matricular
   ═══════════════════════════════════════════════════════════════ */

/**
 * Matricula o usuário autenticado em um curso.
 * 
 * Cursos gratuitos: matrícula ativa automaticamente.
 * Cursos pagos: matrícula fica PENDENTE até confirmação do pagamento.
 * 
 * @param cursoId - ID do curso (na URL)
 * @returns 201 com dados da matrícula
 * @returns 404 se curso não encontrado
 * @returns 409 se já matriculado
 * @returns 500 em caso de erro interno
 */
router.post('/cursos/:cursoId/matricular', async (req: Request, res: Response) => {
  try {
    const { cursoId } = req.params;
    const userId = req.user!.userId;

    // Verifica se o curso existe
    const curso = await prisma.curso.findUnique({
      where: { id: Number(cursoId) },
    });

    if (!curso) {
      res.status(404).json({ erro: 'Curso não encontrado.' });
      return;
    }

    // Verifica se já está matriculado
    const matriculaExistente = await prisma.matricula.findUnique({
      where: {
        userId_cursoId: {
          userId,
          cursoId: Number(cursoId),
        },
      },
    });

    if (matriculaExistente) {
      res.status(409).json({
        erro: 'Você já está matriculado neste curso.',
        matricula: matriculaExistente,
      });
      return;
    }

    // Se o curso for pago, cria matrícula como PENDENTE
    if (curso.preco && curso.preco > 0) {
      const matricula = await prisma.matricula.create({
        data: {
          userId,
          cursoId: Number(cursoId),
          status: 'PENDENTE',
          valorPago: curso.preco,
        },
      });

      res.status(201).json({
        mensagem: 'Matrícula pendente de pagamento.',
        matricula: {
          id: matricula.id,
          userId: matricula.userId,
          cursoId: matricula.cursoId,
          status: matricula.status,
          progresso: matricula.progresso,
          concluido: matricula.concluido,
          createdAt: matricula.createdAt,
        },
        requerPagamento: true,
      });
      return;
    }

    // Curso gratuito: matrícula ativa automaticamente
    const matricula = await prisma.matricula.create({
      data: {
        userId,
        cursoId: Number(cursoId),
        status: 'ATIVO',
      },
    });

    // Concede XP pela matrícula
    await prisma.user.update({
      where: { id: userId },
      data: { xpTotal: { increment: 5 } },
    });

    res.status(201).json({
      mensagem: 'Matrícula realizada com sucesso!',
      matricula: {
        id: matricula.id,
        userId: matricula.userId,
        cursoId: matricula.cursoId,
        status: matricula.status,
        progresso: matricula.progresso,
        concluido: matricula.concluido,
        createdAt: matricula.createdAt,
      },
      requerPagamento: false,
    });
  } catch (erro) {
    console.error('Erro ao matricular:', erro);
    res.status(500).json({ erro: 'Erro ao realizar matrícula.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   GET /api/meus-cursos
   ═══════════════════════════════════════════════════════════════ */

/**
 * Lista os cursos em que o usuário autenticado está matriculado.
 * 
 * Retorna dados resumidos com progresso e status.
 * 
 * @returns 200 com array de cursos do usuário
 * @returns 500 em caso de erro interno
 */
router.get('/meus-cursos', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const matriculas = await prisma.matricula.findMany({
      where: { userId },
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                aulas: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const cursos = matriculas.map((m) => {
      const totalAulas = m.curso.modulos.reduce(
        (acc, mod) => acc + mod.aulas.length,
        0
      );

      return {
        id: m.curso.id,
        titulo: m.curso.titulo,
        slug: m.curso.slug,
        imagem: m.curso.imagem,
        status: m.status,
        progresso: m.progresso,
        concluido: m.concluido,
        totalAulas,
        matriculaId: m.id,
      };
    });

    res.json({ cursos });
  } catch (erro) {
    console.error('Erro ao listar meus cursos:', erro);
    res.status(500).json({ erro: 'Erro ao carregar seus cursos.' });
  }
});

export default router;
