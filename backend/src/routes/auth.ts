/**
 * @file auth.ts
 * @description Rotas de autenticação (registro, login, recuperação de senha).
 * 
 * Inclui validação de status do usuário (bloqueado/ativo).
 * Utiliza o helper prisma.ts para compatibilidade com SQLite (dev) e PostgreSQL (prod).
 * 
 * @see Middleware: src/middleware/auth.ts
 * @see Prisma Helper: src/lib/prisma.ts
 * @see Modelo User: prisma/schema.prisma
 */

import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// ... (resto do código permanece idêntico)

const router = Router();

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

/** Chave secreta para assinar tokens JWT */
const JWT_SECRET = process.env.JWT_SECRET || 'no-na-armadura-secret-dev';

/** Número de rounds para o bcrypt (salt) – 10 é seguro e performático */
const SALT_ROUNDS = 10;

/* ═══════════════════════════════════════════════════════════════
   POST /api/auth/registro
   ═══════════════════════════════════════════════════════════════ */

/**
 * Cria um novo usuário no banco de dados com senha criptografada.
 * Retorna token JWT para login automático após registro.
 * 
 * @body { nome: string, email: string, senha: string }
 * @returns 201 com dados do usuário (sem senha) + token JWT
 * @returns 400 se campos obrigatórios ausentes ou senha curta
 * @returns 409 se email já estiver em uso
 * @returns 500 em caso de erro interno
 */
router.post('/registro', async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body;

    // Validação de campos obrigatórios
    if (!nome || !email || !senha) {
      res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
      return;
    }

    // Validação de tamanho mínimo da senha
    if (senha.length < 6) {
      res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    // Verifica se email já está cadastrado
    const usuarioExistente = await prisma.user.findUnique({ where: { email } });
    if (usuarioExistente) {
      res.status(409).json({ erro: 'Este email já está cadastrado.' });
      return;
    }

    // Criptografa a senha antes de armazenar (nunca salvamos senha pura)
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    // Cria usuário no banco com status ATIVO por padrão
    const usuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        role: 'ALUNO',
        status: 'ATIVO',
      },
    });

    // Gera token JWT para login automático após registro
    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retorna dados do usuário (sem a senha) + token
    res.status(201).json({
      mensagem: 'Conta criada com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        status: usuario.status,
        avatar: usuario.avatar,
        createdAt: usuario.createdAt,
      },
      token,
    });
  } catch (erro) {
    console.error('Erro ao registrar usuário:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor ao criar conta.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   POST /api/auth/login
   ═══════════════════════════════════════════════════════════════ */

/**
 * Autentica um usuário com email e senha.
 * Retorna token JWT para ser usado em requisições autenticadas.
 * Bloqueia login se o usuário estiver com status BLOQUEADO.
 * 
 * @body { email: string, senha: string }
 * @returns 200 com dados do usuário (sem senha) + token JWT
 * @returns 400 se campos obrigatórios ausentes
 * @returns 401 se credenciais forem inválidas
 * @returns 403 se conta estiver bloqueada
 * @returns 500 em caso de erro interno
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    // Validação de campos obrigatórios
    if (!email || !senha) {
      res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
      return;
    }

    // Busca usuário pelo email
    const usuario = await prisma.user.findUnique({ where: { email } });

    // Mensagem genérica por segurança: não revela se email existe
    if (!usuario) {
      res.status(401).json({ erro: 'Email ou senha inválidos.' });
      return;
    }

    // Verifica se a conta está bloqueada
    if (usuario.status === 'BLOQUEADO') {
      res.status(403).json({
        erro: 'Sua conta foi bloqueada. Entre em contato com o administrador.',
      });
      return;
    }

    // Compara senha fornecida com o hash armazenado
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      res.status(401).json({ erro: 'Email ou senha inválidos.' });
      return;
    }

    // Gera token JWT
    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retorna dados do usuário (sem a senha) + token
    res.json({
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        status: usuario.status,
        avatar: usuario.avatar,
        createdAt: usuario.createdAt,
      },
      token,
    });
  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor ao fazer login.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   POST /api/auth/esqueci-senha
   ═══════════════════════════════════════════════════════════════ */

/**
 * Envia um token de recuperação para o email do usuário.
 * Por segurança, sempre retorna sucesso mesmo se o email não existir.
 * 
 * @body { email: string }
 * @returns 200 com mensagem (e token no ambiente de desenvolvimento)
 * @returns 400 se email não fornecida
 * @returns 500 em caso de erro interno
 */
router.post('/esqueci-senha', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ erro: 'Email é obrigatório.' });
      return;
    }

    const usuario = await prisma.user.findUnique({ where: { email } });

    // Por segurança, sempre retorna sucesso mesmo se o email não existir
    if (!usuario) {
      res.json({
        mensagem: 'Se o email existir, um link de recuperação será enviado.',
      });
      return;
    }

    // Gera token de recuperação (válido por 1 hora)
    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email, tipo: 'recuperacao' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Em produção: enviar email com o link
    // Por enquanto, retorna o token no console e na resposta (apenas para teste)
    console.log(
      `🔑 Link de recuperação: http://localhost:5173/redefinir-senha?token=${token}`
    );

    res.json({
      mensagem: 'Se o email existir, um link de recuperação será enviado.',
      token,
      link: `http://localhost:5173/redefinir-senha?token=${token}`,
    });
  } catch (erro) {
    console.error('Erro ao processar recuperação:', erro);
    res.status(500).json({ erro: 'Erro ao processar solicitação.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   POST /api/auth/redefinir-senha
   ═══════════════════════════════════════════════════════════════ */

/**
 * Redefine a senha do usuário usando o token de recuperação.
 * 
 * @body { token: string, novaSenha: string }
 * @returns 200 com mensagem de sucesso
 * @returns 400 se token ou senha ausentes, ou token inválido/expirado
 * @returns 500 em caso de erro interno
 */
router.post('/redefinir-senha', async (req: Request, res: Response) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      res.status(400).json({ erro: 'Token e nova senha são obrigatórios.' });
      return;
    }

    if (novaSenha.length < 6) {
      res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    // Verifica o token
    let decoded: { userId: number; tipo: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: number; tipo: string };
    } catch {
      res.status(400).json({
        erro: 'Token inválido ou expirado. Solicite um novo link.',
      });
      return;
    }

    if (decoded.tipo !== 'recuperacao') {
      res.status(400).json({ erro: 'Token inválido.' });
      return;
    }

    // Atualiza a senha
    const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { senha: senhaHash },
    });

    res.json({
      mensagem: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
    });
  } catch (erro) {
    console.error('Erro ao redefinir senha:', erro);
    res.status(500).json({ erro: 'Erro ao redefinir senha.' });
  }
});

export default router;
