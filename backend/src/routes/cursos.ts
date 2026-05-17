/**
 * @file cursos.ts
 * @description Rotas de gerenciamento de cursos, módulos e aulas.
 * 
 * Rotas públicas:
 * - GET /api/cursos              → listar cursos públicos
 * - GET /api/cursos/:slug        → detalhes de um curso (aceita slug ou ID)
 * 
 * Rotas protegidas (PROFESSOR/ADMIN):
 * - POST   /api/cursos              → criar curso
 * - PUT    /api/cursos/:id          → atualizar curso
 * 
 * Rotas protegidas (ADMIN):
 * - DELETE /api/cursos/:id          → deletar curso
 * 
 * Rotas de módulos e aulas (PROFESSOR/ADMIN):
 * - POST   /api/cursos/:cursoId/modulos                  → criar módulo
 * - PUT    /api/cursos/:cursoId/modulos/:moduloId         → atualizar módulo
 * - DELETE /api/cursos/:cursoId/modulos/:moduloId         → deletar módulo (ADMIN)
 * - POST   /api/cursos/:cursoId/modulos/:moduloId/aulas   → criar aula
 * - PUT    /api/cursos/:cursoId/modulos/:moduloId/aulas/:aulaId → atualizar aula
 * - DELETE /api/cursos/:cursoId/modulos/:moduloId/aulas/:aulaId → deletar aula (ADMIN)
 * 
 * Utiliza o helper prisma.ts para compatibilidade com SQLite (dev) e PostgreSQL (prod).
 * 
 * @see Middleware: src/middleware/auth.ts
 * @see Prisma Helper: src/lib/prisma.ts
 */

import { Router, type Request, type Response } from 'express';
import { verificarToken, autorizar } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/* ═══════════════════════════════════════════════════════════════
   ROTAS PÚBLICAS
   ═══════════════════════════════════════════════════════════════ */

/**
 * GET /api/cursos
 * Lista todos os cursos públicos com seus módulos e aulas.
 * 
 * @returns 200 com array de cursos
 * @returns 500 em caso de erro interno
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const cursos = await prisma.curso.findMany({
      where: { publico: true },
      include: {
        modulos: {
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
        },
        _count: { select: { matriculas: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ cursos });
  } catch (erro) {
    console.error('Erro ao listar cursos:', erro);
    res.status(500).json({ erro: 'Erro ao carregar cursos.' });
  }
});

/**
 * GET /api/cursos/:slug
 * Retorna detalhes de um curso. Aceita tanto slug quanto ID numérico.
 * 
 * @param slug - Slug do curso ou ID numérico
 * @returns 200 com dados completos do curso
 * @returns 404 se curso não encontrado
 * @returns 500 em caso de erro interno
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as { slug: string };
    const isId = !isNaN(Number(slug));

    // Busca por ID ou slug dependendo do formato do parâmetro
    const curso = isId
      ? await prisma.curso.findUnique({
          where: { id: Number(slug) },
          include: {
            modulos: {
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
            },
            _count: { select: { matriculas: true } },
          },
        })
      : await prisma.curso.findUnique({
          where: { slug },
          include: {
            modulos: {
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
            },
            _count: { select: { matriculas: true } },
          },
        });

    if (!curso) {
      res.status(404).json({ erro: 'Curso não encontrado.' });
      return;
    }

    res.json({ curso });
  } catch (erro) {
    console.error('Erro ao buscar curso:', erro);
    res.status(500).json({ erro: 'Erro ao carregar curso.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   ROTAS PROTEGIDAS - CRUD DE CURSOS
   ═══════════════════════════════════════════════════════════════ */

/**
 * POST /api/cursos
 * Cria um novo curso (PROFESSOR ou ADMIN).
 * 
 * @body { titulo: string, descricao: string, resumo?, imagem?, preco?, cargaHoraria?, nivel?, categoria? }
 * @returns 201 com dados do curso criado
 * @returns 400 se campos obrigatórios ausentes
 * @returns 500 em caso de erro interno
 */
router.post(
  '/',
  verificarToken,
  autorizar(['PROFESSOR', 'ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const {
        titulo,
        descricao,
        resumo,
        imagem,
        preco,
        cargaHoraria,
        nivel,
        categoria,
      } = req.body;

      // Validação de campos obrigatórios
      if (!titulo || !descricao) {
        res.status(400).json({ erro: 'Título e descrição são obrigatórios.' });
        return;
      }

      // Gera slug automaticamente a partir do título
      const slug = titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const curso = await prisma.curso.create({
        data: {
          titulo,
          slug,
          descricao,
          resumo: resumo || null,
          imagem: imagem || null,
          preco: preco || null,
          cargaHoraria: cargaHoraria || null,
          nivel: nivel || 'INICIANTE',
          categoria: categoria || null,
          criadoPorId: req.user!.userId,
        },
      });

      res.status(201).json({ mensagem: 'Curso criado com sucesso!', curso });
    } catch (erro) {
      console.error('Erro ao criar curso:', erro);
      res.status(500).json({ erro: 'Erro ao criar curso.' });
    }
  }
);

/**
 * PUT /api/cursos/:id
 * Atualiza um curso existente (PROFESSOR ou ADMIN).
 * 
 * @param id - ID do curso
 * @body Campos opcionais a serem atualizados
 * @returns 200 com dados do curso atualizado
 * @returns 404 se curso não encontrado
 * @returns 500 em caso de erro interno
 */
router.put(
  '/:id',
  verificarToken,
  autorizar(['PROFESSOR', 'ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        titulo,
        descricao,
        resumo,
        imagem,
        preco,
        cargaHoraria,
        nivel,
        categoria,
      } = req.body;

      // Verifica se o curso existe
      const cursoExistente = await prisma.curso.findUnique({
        where: { id: Number(id) },
      });

      if (!cursoExistente) {
        res.status(404).json({ erro: 'Curso não encontrado.' });
        return;
      }

      const curso = await prisma.curso.update({
        where: { id: Number(id) },
        data: {
          ...(titulo && { titulo }),
          ...(descricao && { descricao }),
          ...(resumo !== undefined && { resumo }),
          ...(imagem !== undefined && { imagem }),
          ...(preco !== undefined && { preco: preco ? Number(preco) : null }),
          ...(cargaHoraria !== undefined && {
            cargaHoraria: cargaHoraria ? Number(cargaHoraria) : null,
          }),
          ...(nivel && { nivel }),
          ...(categoria !== undefined && { categoria }),
        },
      });

      res.json({ mensagem: 'Curso atualizado com sucesso!', curso });
    } catch (erro) {
      console.error('Erro ao atualizar curso:', erro);
      res.status(500).json({ erro: 'Erro ao atualizar curso.' });
    }
  }
);

/**
 * DELETE /api/cursos/:id
 * Exclui um curso (apenas ADMIN).
 * 
 * @param id - ID do curso
 * @returns 200 com mensagem de sucesso
 * @returns 404 se curso não encontrado
 * @returns 500 em caso de erro interno
 */
router.delete(
  '/:id',
  verificarToken,
  autorizar(['ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const cursoExistente = await prisma.curso.findUnique({
        where: { id: Number(id) },
      });

      if (!cursoExistente) {
        res.status(404).json({ erro: 'Curso não encontrado.' });
        return;
      }

      await prisma.curso.delete({ where: { id: Number(id) } });

      res.json({ mensagem: 'Curso excluído com sucesso!' });
    } catch (erro) {
      console.error('Erro ao excluir curso:', erro);
      res.status(500).json({ erro: 'Erro ao excluir curso.' });
    }
  }
);

/* ═══════════════════════════════════════════════════════════════
   ROTAS DE MÓDULOS (PROFESSOR/ADMIN)
   ═══════════════════════════════════════════════════════════════ */

/**
 * POST /api/cursos/:cursoId/modulos
 * Adiciona um novo módulo ao curso.
 * 
 * @param cursoId - ID do curso
 * @body { titulo: string, descricao?: string }
 * @returns 201 com dados do módulo criado
 * @returns 400 se título ausente
 * @returns 404 se curso não encontrado
 * @returns 500 em caso de erro interno
 */
router.post(
  '/:cursoId/modulos',
  verificarToken,
  autorizar(['PROFESSOR', 'ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { cursoId } = req.params;
      const { titulo, descricao } = req.body;

      if (!titulo) {
        res.status(400).json({ erro: 'Título do módulo é obrigatório.' });
        return;
      }

      // Verifica se o curso existe
      const curso = await prisma.curso.findUnique({
        where: { id: Number(cursoId) },
      });

      if (!curso) {
        res.status(404).json({ erro: 'Curso não encontrado.' });
        return;
      }

      // Calcula a próxima ordem
      const ultimoModulo = await prisma.modulo.findFirst({
        where: { cursoId: Number(cursoId) },
        orderBy: { ordem: 'desc' },
      });
      const proximaOrdem = ultimoModulo ? ultimoModulo.ordem + 1 : 1;

      const modulo = await prisma.modulo.create({
        data: {
          titulo,
          descricao: descricao || null,
          ordem: proximaOrdem,
          cursoId: Number(cursoId),
        },
      });

      res.status(201).json({ mensagem: 'Módulo criado com sucesso!', modulo });
    } catch (erro) {
      console.error('Erro ao criar módulo:', erro);
      res.status(500).json({ erro: 'Erro ao criar módulo.' });
    }
  }
);

/**
 * PUT /api/cursos/:cursoId/modulos/:moduloId
 * Atualiza um módulo existente.
 * 
 * @param cursoId - ID do curso
 * @param moduloId - ID do módulo
 * @body { titulo?: string, descricao?: string, ordem?: number }
 * @returns 200 com dados do módulo atualizado
 * @returns 500 em caso de erro interno
 */
router.put(
  '/:cursoId/modulos/:moduloId',
  verificarToken,
  autorizar(['PROFESSOR', 'ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { moduloId } = req.params;
      const { titulo, descricao, ordem } = req.body;

      const modulo = await prisma.modulo.update({
        where: { id: Number(moduloId) },
        data: {
          ...(titulo && { titulo }),
          ...(descricao !== undefined && { descricao }),
          ...(ordem && { ordem: Number(ordem) }),
        },
      });

      res.json({ mensagem: 'Módulo atualizado com sucesso!', modulo });
    } catch (erro) {
      console.error('Erro ao atualizar módulo:', erro);
      res.status(500).json({ erro: 'Erro ao atualizar módulo.' });
    }
  }
);

/**
 * DELETE /api/cursos/:cursoId/modulos/:moduloId
 * Remove um módulo e suas aulas (apenas ADMIN).
 * 
 * @param cursoId - ID do curso
 * @param moduloId - ID do módulo
 * @returns 200 com mensagem de sucesso
 * @returns 500 em caso de erro interno
 */
router.delete(
  '/:cursoId/modulos/:moduloId',
  verificarToken,
  autorizar(['ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { moduloId } = req.params;

      await prisma.modulo.delete({ where: { id: Number(moduloId) } });

      res.json({ mensagem: 'Módulo excluído com sucesso!' });
    } catch (erro) {
      console.error('Erro ao excluir módulo:', erro);
      res.status(500).json({ erro: 'Erro ao excluir módulo.' });
    }
  }
);

/* ═══════════════════════════════════════════════════════════════
   ROTAS DE AULAS (PROFESSOR/ADMIN)
   ═══════════════════════════════════════════════════════════════ */

/**
 * POST /api/cursos/:cursoId/modulos/:moduloId/aulas
 * Adiciona uma nova aula ao módulo.
 * 
 * @param cursoId - ID do curso
 * @param moduloId - ID do módulo
 * @body { titulo: string, descricao?, conteudo?, videoUrl?, duracao?, gratuito? }
 * @returns 201 com dados da aula criada
 * @returns 400 se título ausente
 * @returns 500 em caso de erro interno
 */
router.post(
  '/:cursoId/modulos/:moduloId/aulas',
  verificarToken,
  autorizar(['PROFESSOR', 'ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { moduloId } = req.params;
      const { titulo, descricao, conteudo, videoUrl, duracao, gratuito } = req.body;

      if (!titulo) {
        res.status(400).json({ erro: 'Título da aula é obrigatório.' });
        return;
      }

      // Gera slug automaticamente
      const slug = titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Calcula a próxima ordem
      const ultimaAula = await prisma.aula.findFirst({
        where: { moduloId: Number(moduloId) },
        orderBy: { ordem: 'desc' },
      });
      const proximaOrdem = ultimaAula ? ultimaAula.ordem + 1 : 1;

      const aula = await prisma.aula.create({
        data: {
          titulo,
          slug,
          descricao: descricao || null,
          conteudo: conteudo || null,
          videoUrl: videoUrl || null,
          duracao: duracao ? Number(duracao) : null,
          gratuito: gratuito || false,
          ordem: proximaOrdem,
          moduloId: Number(moduloId),
        },
      });

      res.status(201).json({ mensagem: 'Aula criada com sucesso!', aula });
    } catch (erro) {
      console.error('Erro ao criar aula:', erro);
      res.status(500).json({ erro: 'Erro ao criar aula.' });
    }
  }
);

/**
 * PUT /api/cursos/:cursoId/modulos/:moduloId/aulas/:aulaId
 * Atualiza uma aula existente.
 * 
 * @param cursoId - ID do curso
 * @param moduloId - ID do módulo
 * @param aulaId - ID da aula
 * @body Campos opcionais a serem atualizados
 * @returns 200 com dados da aula atualizada
 * @returns 500 em caso de erro interno
 */
router.put(
  '/:cursoId/modulos/:moduloId/aulas/:aulaId',
  verificarToken,
  autorizar(['PROFESSOR', 'ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { aulaId } = req.params;
      const { titulo, descricao, conteudo, videoUrl, duracao, gratuito, ordem } = req.body;

      const aula = await prisma.aula.update({
        where: { id: Number(aulaId) },
        data: {
          ...(titulo && { titulo }),
          ...(descricao !== undefined && { descricao }),
          ...(conteudo !== undefined && { conteudo }),
          ...(videoUrl !== undefined && { videoUrl }),
          ...(duracao !== undefined && { duracao: Number(duracao) }),
          ...(gratuito !== undefined && { gratuito }),
          ...(ordem && { ordem: Number(ordem) }),
        },
      });

      res.json({ mensagem: 'Aula atualizada com sucesso!', aula });
    } catch (erro) {
      console.error('Erro ao atualizar aula:', erro);
      res.status(500).json({ erro: 'Erro ao atualizar aula.' });
    }
  }
);

/**
 * DELETE /api/cursos/:cursoId/modulos/:moduloId/aulas/:aulaId
 * Remove uma aula (apenas ADMIN).
 * 
 * @param cursoId - ID do curso
 * @param moduloId - ID do módulo
 * @param aulaId - ID da aula
 * @returns 200 com mensagem de sucesso
 * @returns 500 em caso de erro interno
 */
router.delete(
  '/:cursoId/modulos/:moduloId/aulas/:aulaId',
  verificarToken,
  autorizar(['ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { aulaId } = req.params;

      await prisma.aula.delete({ where: { id: Number(aulaId) } });

      res.json({ mensagem: 'Aula excluída com sucesso!' });
    } catch (erro) {
      console.error('Erro ao excluir aula:', erro);
      res.status(500).json({ erro: 'Erro ao excluir aula.' });
    }
  }
);

export default router;
