/**
 * @file admin.ts
 * @description Rotas administrativas protegidas por role ADMIN.
 * 
 * CRUD completo de usuários: listar, criar, editar, alterar status e excluir.
 * Utiliza o helper prisma.ts para compatibilidade com SQLite (dev) e PostgreSQL (prod).
 * 
 * @see Middleware: src/middleware/auth.ts
 * @see Prisma Helper: src/lib/prisma.ts
 * @see Modelo User: prisma/schema.prisma
 */

import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { verificarToken, autorizar } from '../middleware/auth';
import { prisma } from '../lib/prisma';

// ... (resto do código permanece idêntico)

const router = Router();

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

/** Número de rounds para o bcrypt (salt) */
const SALT_ROUNDS = 10;

/** Roles permitidas no sistema */
const ROLES_VALIDAS = ['ALUNO', 'PROFESSOR', 'ADMIN'];

/** Status permitidos */
const STATUS_VALIDOS = ['ATIVO', 'BLOQUEADO'];

/* ═══════════════════════════════════════════════════════════════
   Middleware de autenticação e autorização
   Todas as rotas exigem token JWT + role ADMIN
   ═══════════════════════════════════════════════════════════════ */

router.use(verificarToken);
router.use(autorizar(['ADMIN']));

/* ═══════════════════════════════════════════════════════════════
   GET /api/admin/usuarios
   ═══════════════════════════════════════════════════════════════ */

/**
 * Lista todos os usuários da plataforma.
 * Acesso restrito a ADMIN.
 * 
 * @returns 200 com array de usuários (sem senha)
 * @returns 401 se não autenticado
 * @returns 403 se não for ADMIN
 * @returns 500 em caso de erro interno
 */
router.get('/usuarios', async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        nivel: true,
        xpTotal: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ usuarios });
  } catch (erro) {
    console.error('Erro ao listar usuários:', erro);
    res.status(500).json({ erro: 'Erro ao listar usuários.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   POST /api/admin/usuarios
   ═══════════════════════════════════════════════════════════════ */

/**
 * Cria um novo usuário (apenas ADMIN).
 * 
 * @body { nome: string, email: string, senha: string, role?: string, status?: string }
 * @returns 201 com dados do usuário criado
 * @returns 400 se campos obrigatórios ausentes
 * @returns 409 se email já existir
 * @returns 500 em caso de erro interno
 */
router.post('/usuarios', async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, role, status } = req.body;

    // Validação de campos obrigatórios
    if (!nome || !email || !senha) {
      res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
      return;
    }

    // Validação de senha
    if (senha.length < 6) {
      res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    // Validação de role (se fornecida)
    if (role && !ROLES_VALIDAS.includes(role)) {
      res.status(400).json({
        erro: `Role inválida. Use: ${ROLES_VALIDAS.join(', ')}.`,
      });
      return;
    }

    // Validação de status (se fornecido)
    if (status && !STATUS_VALIDOS.includes(status)) {
      res.status(400).json({
        erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.`,
      });
      return;
    }

    // Verifica se email já existe
    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) {
      res.status(409).json({ erro: 'Este email já está cadastrado.' });
      return;
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    // Cria o usuário
    const usuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        role: role || 'ALUNO',
        status: status || 'ATIVO',
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        nivel: true,
        xpTotal: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso!',
      usuario,
    });
  } catch (erro) {
    console.error('Erro ao criar usuário:', erro);
    res.status(500).json({ erro: 'Erro ao criar usuário.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   PUT /api/admin/usuarios/:id
   ═══════════════════════════════════════════════════════════════ */

/**
 * Edita dados de um usuário (nome, email, role, status).
 * Apenas ADMIN.
 * 
 * @param id - ID do usuário
 * @body Campos opcionais a serem atualizados
 * @returns 200 com dados atualizados
 * @returns 404 se usuário não encontrado
 * @returns 500 em caso de erro interno
 */
router.put('/usuarios/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email, role, status } = req.body;

    // Verifica se o usuário existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!usuarioExistente) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
      return;
    }

    // Validação de role (se fornecida)
    if (role && !ROLES_VALIDAS.includes(role)) {
      res.status(400).json({
        erro: `Role inválida. Use: ${ROLES_VALIDAS.join(', ')}.`,
      });
      return;
    }

    // Validação de status (se fornecido)
    if (status && !STATUS_VALIDOS.includes(status)) {
      res.status(400).json({
        erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.`,
      });
      return;
    }

    // Atualiza o usuário
    const usuario = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(nome && { nome }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        nivel: true,
        xpTotal: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json({
      mensagem: 'Usuário atualizado com sucesso!',
      usuario,
    });
  } catch (erro) {
    console.error('Erro ao editar usuário:', erro);
    res.status(500).json({ erro: 'Erro ao editar usuário.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   PATCH /api/admin/usuarios/:id/status
   ═══════════════════════════════════════════════════════════════ */

/**
 * Altera o status de um usuário (ATIVO / BLOQUEADO).
 * Apenas ADMIN.
 * 
 * @param id - ID do usuário
 * @body { status: 'ATIVO' | 'BLOQUEADO' }
 * @returns 200 com mensagem de sucesso
 * @returns 400 se status inválido
 * @returns 404 se usuário não encontrado
 * @returns 500 em caso de erro interno
 */
router.patch('/usuarios/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validação do status
    if (!status || !STATUS_VALIDOS.includes(status)) {
      res.status(400).json({
        erro: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.`,
      });
      return;
    }

    // Verifica se o usuário existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!usuarioExistente) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
      return;
    }

    // Atualiza o status
    await prisma.user.update({
      where: { id: Number(id) },
      data: { status },
    });

    const acao = status === 'ATIVO' ? 'desbloqueado' : 'bloqueado';
    res.json({
      mensagem: `Usuário ${acao} com sucesso.`,
    });
  } catch (erro) {
    console.error('Erro ao alterar status:', erro);
    res.status(500).json({ erro: 'Erro ao alterar status do usuário.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   DELETE /api/admin/usuarios/:id
   ═══════════════════════════════════════════════════════════════ */

/**
 * Exclui um usuário permanentemente.
 * Apenas ADMIN.
 * 
 * @param id - ID do usuário
 * @returns 200 com mensagem de sucesso
 * @returns 404 se usuário não encontrado
 * @returns 500 em caso de erro interno
 */
router.delete('/usuarios/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se o usuário existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!usuarioExistente) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
      return;
    }

    // Exclui o usuário
    await prisma.user.delete({ where: { id: Number(id) } });

    res.json({ mensagem: 'Usuário excluído com sucesso!' });
  } catch (erro) {
    console.error('Erro ao excluir usuário:', erro);
    res.status(500).json({ erro: 'Erro ao excluir usuário.' });
  }
});

export default router;
