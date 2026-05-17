/**
 * @file usuarios.ts
 * @description Rotas de gerenciamento de perfil do usuário.
 * 
 * - PATCH /api/usuarios/:id → atualiza dados do usuário (autenticado).
 * - PATCH /api/usuarios/:id/senha → altera senha do usuário (autenticado).
 * - PATCH /api/usuarios/:id/avatar → atualiza avatar do usuário (autenticado).
 * 
 * Todas as rotas exigem token JWT válido.
 * Utiliza o helper prisma.ts para compatibilidade com SQLite (dev) e PostgreSQL (prod).
 * 
 * @see Middleware: src/middleware/auth.ts
 * @see Prisma Helper: src/lib/prisma.ts
 * @see Modelo User: prisma/schema.prisma
 */

import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { verificarToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';

// ... (resto do código permanece idêntico)

const router = Router();

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

/** Número de rounds para o bcrypt (salt) */
const SALT_ROUNDS = 10;

/* ═══════════════════════════════════════════════════════════════
   Middleware de autenticação para todas as rotas
   ═══════════════════════════════════════════════════════════════ */

router.use(verificarToken);

/* ═══════════════════════════════════════════════════════════════
   PATCH /api/usuarios/:id
   ═══════════════════════════════════════════════════════════════ */

/**
 * Atualiza dados do usuário autenticado.
 * O usuário só pode editar o próprio perfil.
 * 
 * @param id - ID do usuário (da URL)
 * @body { nome?: string } - Campos a serem atualizados
 * @returns 200 com dados atualizados do usuário
 * @returns 403 se tentar editar outro usuário
 * @returns 404 se usuário não encontrado
 * @returns 500 em caso de erro interno
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    const usuarioAutenticado = req.user;

    // Verifica se o token pertence ao usuário que está sendo editado
    if (!usuarioAutenticado || usuarioAutenticado.userId !== Number(id)) {
      res.status(403).json({ erro: 'Você só pode editar seu próprio perfil.' });
      return;
    }

    // Validação básica
    if (!nome || !nome.trim()) {
      res.status(400).json({ erro: 'O nome não pode ficar vazio.' });
      return;
    }

    // Verifica se usuário existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!usuarioExistente) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
      return;
    }

    // Atualiza usuário
    const usuarioAtualizado = await prisma.user.update({
      where: { id: Number(id) },
      data: { nome: nome.trim() },
    });

    // Retorna dados sem a senha
    res.json({
      mensagem: 'Perfil atualizado com sucesso!',
      usuario: {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        role: usuarioAtualizado.role,
        status: usuarioAtualizado.status,
        nivel: usuarioAtualizado.nivel,
        avatar: usuarioAtualizado.avatar,
        createdAt: usuarioAtualizado.createdAt,
      },
    });
  } catch (erro) {
    console.error('Erro ao atualizar usuário:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor ao atualizar perfil.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   PATCH /api/usuarios/:id/senha
   ═══════════════════════════════════════════════════════════════ */

/**
 * Altera a senha do usuário autenticado.
 * Exige senha atual para confirmar a identidade.
 * 
 * @param id - ID do usuário (da URL)
 * @body { senhaAtual: string, novaSenha: string }
 * @returns 200 com mensagem de sucesso
 * @returns 400 se campos obrigatórios ausentes ou senha curta
 * @returns 401 se senha atual incorreta
 * @returns 403 se tentar alterar senha de outro usuário
 * @returns 404 se usuário não encontrado
 * @returns 500 em caso de erro interno
 */
router.patch('/:id/senha', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;
    const usuarioAutenticado = req.user;

    // Verifica se o token pertence ao usuário
    if (!usuarioAutenticado || usuarioAutenticado.userId !== Number(id)) {
      res.status(403).json({ erro: 'Você só pode alterar sua própria senha.' });
      return;
    }

    // Validação de campos
    if (!senhaAtual || !novaSenha) {
      res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias.' });
      return;
    }

    if (novaSenha.length < 6) {
      res.status(400).json({ erro: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    // Busca usuário com a senha (hash)
    const usuario = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!usuario) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
      return;
    }

    // Verifica senha atual
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaCorreta) {
      res.status(401).json({ erro: 'Senha atual incorreta.' });
      return;
    }

    // Criptografa a nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);

    // Atualiza no banco
    await prisma.user.update({
      where: { id: Number(id) },
      data: { senha: novaSenhaHash },
    });

    res.json({ mensagem: 'Senha alterada com sucesso!' });
  } catch (erro) {
    console.error('Erro ao alterar senha:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor ao alterar senha.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   PATCH /api/usuarios/:id/avatar
   ═══════════════════════════════════════════════════════════════ */

/**
 * Atualiza o avatar do usuário (base64).
 * 
 * @param id - ID do usuário (da URL)
 * @body { avatar: string | null } - URL ou base64 da imagem
 * @returns 200 com dados atualizados do usuário
 * @returns 403 se tentar editar outro usuário
 * @returns 500 em caso de erro interno
 */
router.patch('/:id/avatar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { avatar } = req.body;
    const usuarioAutenticado = req.user;

    if (!usuarioAutenticado || usuarioAutenticado.userId !== Number(id)) {
      res.status(403).json({ erro: 'Você só pode editar seu próprio perfil.' });
      return;
    }

    const usuario = await prisma.user.update({
      where: { id: Number(id) },
      data: { avatar: avatar || null },
    });

    res.json({
      mensagem: 'Avatar atualizado!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        status: usuario.status,
        nivel: usuario.nivel,
        avatar: usuario.avatar,
        createdAt: usuario.createdAt,
      },
    });
  } catch (erro) {
    console.error('Erro ao atualizar avatar:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar avatar.' });
  }
});

export default router;
