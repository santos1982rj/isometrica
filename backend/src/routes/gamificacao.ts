/**
 * @file gamificacao.ts
 * @description Rotas do sistema de gamificação: níveis, XP, ranking e conquistas.
 * 
 * - GET /api/gamificacao       → dados de gamificação do usuário
 * - GET /api/gamificacao/ranking → ranking geral de usuários
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
   Constantes
   ═══════════════════════════════════════════════════════════════ */

/**
 * Calcula o XP necessário para atingir o próximo nível.
 * Fórmula: nível * 100
 * 
 * @param nivel - Nível atual do usuário
 * @returns XP necessário para o próximo nível
 */
function xpParaProximoNivel(nivel: number): number {
  return nivel * 100;
}

/**
 * Retorna o título honorífico baseado no nível do usuário.
 * 
 * @param nivel - Nível atual do usuário
 * @returns Título correspondente ao nível
 */
function tituloPorNivel(nivel: number): string {
  if (nivel >= 50) return 'Lenda da Engenharia';
  if (nivel >= 30) return 'Mestre Estrutural';
  if (nivel >= 20) return 'Especialista';
  if (nivel >= 10) return 'Engenheiro Pleno';
  if (nivel >= 5) return 'Engenheiro Júnior';
  return 'Estudante';
}

/* ═══════════════════════════════════════════════════════════════
   GET /api/gamificacao
   ═══════════════════════════════════════════════════════════════ */

/**
 * Retorna os dados de gamificação do usuário autenticado.
 * 
 * Inclui: nível, XP total, XP atual, XP para próximo nível,
 * streak de dias, título, conquistas e progresso diário.
 * 
 * @returns 200 com dados de gamificação
 * @returns 404 se usuário não encontrado
 * @returns 500 em caso de erro interno
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        conquistas: { include: { conquista: true } },
        progresso: { orderBy: { data: 'desc' }, take: 7 },
      },
    });

    if (!usuario) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
      return;
    }

    const proximoNivelXp = xpParaProximoNivel(usuario.nivel);
    const xpAtual = usuario.xpTotal % proximoNivelXp;

    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        nivel: usuario.nivel,
        xpTotal: usuario.xpTotal,
        xpAtual,
        xpProximoNivel: proximoNivelXp,
        streak: usuario.streak,
        titulo: tituloPorNivel(usuario.nivel),
      },
      conquistas: usuario.conquistas.map((uc) => ({
        id: uc.conquista.id,
        titulo: uc.conquista.titulo,
        descricao: uc.conquista.descricao,
        icone: uc.conquista.icone,
        cor: uc.conquista.cor,
        desbloqueada: true,
        desbloqueadaEm: uc.desbloqueadaEm,
      })),
      progresso: usuario.progresso.map((p) => ({
        data: p.data,
        xpGanho: p.xpGanho,
        calculos: p.calculos,
        exercicios: p.exercicios,
      })),
    });
  } catch (erro) {
    console.error('Erro ao buscar gamificação:', erro);
    res.status(500).json({ erro: 'Erro ao carregar dados de gamificação.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   GET /api/gamificacao/ranking
   ═══════════════════════════════════════════════════════════════ */

/**
 * Retorna o ranking geral de usuários por XP.
 * Inclui a posição do usuário autenticado.
 * 
 * @returns 200 com array dos top 20 usuários e posição do usuário atual
 * @returns 500 em caso de erro interno
 */
router.get('/ranking', async (req: Request, res: Response) => {
  try {
    // Top 20 usuários por XP
    const topUsuarios = await prisma.user.findMany({
      orderBy: { xpTotal: 'desc' },
      take: 20,
      select: {
        id: true,
        nome: true,
        nivel: true,
        xpTotal: true,
        streak: true,
        avatar: true,
      },
    });

    // Calcula a posição do usuário atual
    const userId = req.user!.userId;
    const usuarioAtual = await prisma.user.findUnique({
      where: { id: userId },
      select: { xpTotal: true },
    });

    const minhaPosicao = usuarioAtual
      ? (await prisma.user.count({
          where: { xpTotal: { gt: usuarioAtual.xpTotal } },
        })) + 1
      : 0;

    res.json({
      ranking: topUsuarios.map((u, i) => ({
        posicao: i + 1,
        ...u,
      })),
      minhaPosicao,
    });
  } catch (erro) {
    console.error('Erro ao buscar ranking:', erro);
    res.status(500).json({ erro: 'Erro ao carregar ranking.' });
  }
});

export default router;
