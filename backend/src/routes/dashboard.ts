/**
 * @file dashboard.ts
 * @description Rotas do dashboard com dados agregados, atividades e notificações.
 * 
 * - GET /api/dashboard               → dados para o dashboard principal
 * - GET /api/dashboard/atividades     → últimas atividades do usuário
 * - GET /api/dashboard/notificacoes   → notificações do usuário
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
   GET /api/dashboard
   ═══════════════════════════════════════════════════════════════ */

/**
 * Retorna dados agregados para o dashboard do usuário autenticado.
 * 
 * Inclui: total de usuários, cálculos, exercícios, horas de estudo,
 * pontuação e dias ativo na plataforma.
 * 
 * @returns 200 com objeto de estatísticas
 * @returns 500 em caso de erro interno
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Total de usuários na plataforma
    const totalUsuarios = await prisma.user.count();

    // Total de cálculos (placeholder – será real quando o modelo existir)
    const totalCalculos = 0;

    // Total de exercícios resolvidos
    const totalExercicios = 0;

    // Dias desde o cadastro
    const usuario = await prisma.user.findUnique({ where: { id: userId } });
    const diasAtivo = usuario
      ? Math.ceil((Date.now() - new Date(usuario.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Horas estimadas de estudo (placeholder)
    const horasEstudo = Math.floor(diasAtivo * 0.5);

    // Pontuação (placeholder – será integrado com gamificação)
    const pontuacao = 1250;

    res.json({
      estatisticas: {
        usuariosAtivos: totalUsuarios,
        calculosRealizados: totalCalculos,
        exerciciosResolvidos: totalExercicios,
        horasEstudo,
        pontuacao,
        diasAtivo,
      },
    });
  } catch (erro) {
    console.error('Erro ao buscar dados do dashboard:', erro);
    res.status(500).json({ erro: 'Erro ao carregar dashboard.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   GET /api/dashboard/atividades
   ═══════════════════════════════════════════════════════════════ */

/**
 * Retorna as últimas atividades do usuário (placeholder com dados simulados).
 * Futuro: buscar de uma tabela de log de atividades.
 * 
 * @returns 200 com array de atividades
 * @returns 500 em caso de erro interno
 */
router.get('/atividades', async (_req: Request, res: Response) => {
  try {
    const agora = new Date();
    const atividades = [
      {
        id: 1,
        tipo: 'login',
        descricao: 'Login realizado',
        data: new Date(agora.getTime() - 10 * 60000).toISOString(),
      },
      {
        id: 2,
        tipo: 'perfil',
        descricao: 'Perfil atualizado',
        data: new Date(agora.getTime() - 45 * 60000).toISOString(),
      },
      {
        id: 3,
        tipo: 'calculo',
        descricao: 'Cálculo de viga V101 concluído',
        data: new Date(agora.getTime() - 120 * 60000).toISOString(),
      },
      {
        id: 4,
        tipo: 'exercicio',
        descricao: 'Exercício de flexão simples resolvido',
        data: new Date(agora.getTime() - 180 * 60000).toISOString(),
      },
      {
        id: 5,
        tipo: 'curso',
        descricao: 'Iniciou o módulo "Fundamentos"',
        data: new Date(agora.getTime() - 360 * 60000).toISOString(),
      },
    ];

    res.json({ atividades });
  } catch (erro) {
    console.error('Erro ao buscar atividades:', erro);
    res.status(500).json({ erro: 'Erro ao carregar atividades.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   GET /api/dashboard/notificacoes
   ═══════════════════════════════════════════════════════════════ */

/**
 * Retorna notificações do usuário (placeholder com dados simulados).
 * Futuro: buscar de uma tabela de notificações.
 * 
 * @returns 200 com array de notificações
 * @returns 500 em caso de erro interno
 */
router.get('/notificacoes', async (_req: Request, res: Response) => {
  try {
    const agora = new Date();
    const notificacoes = [
      {
        id: 1,
        titulo: 'Bem-vindo à plataforma!',
        mensagem: 'Explore os módulos de dimensionamento.',
        lida: true,
        tipo: 'info',
        data: new Date(agora.getTime() - 86400000).toISOString(),
      },
      {
        id: 2,
        titulo: 'Nova conquista!',
        mensagem: 'Você completou seu primeiro cálculo.',
        lida: false,
        tipo: 'conquista',
        data: new Date(agora.getTime() - 3600000).toISOString(),
      },
      {
        id: 3,
        titulo: 'Atualização disponível',
        mensagem: 'Nova versão da NBR 6118 disponível.',
        lida: false,
        tipo: 'sistema',
        data: new Date(agora.getTime() - 7200000).toISOString(),
      },
      {
        id: 4,
        titulo: 'Lembrete',
        mensagem: 'Continue de onde parou no módulo de Vigas.',
        lida: false,
        tipo: 'lembrete',
        data: new Date(agora.getTime() - 14400000).toISOString(),
      },
    ];

    res.json({ notificacoes });
  } catch (erro) {
    console.error('Erro ao buscar notificações:', erro);
    res.status(500).json({ erro: 'Erro ao carregar notificações.' });
  }
});

export default router;
