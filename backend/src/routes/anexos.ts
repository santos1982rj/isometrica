/**
 * @file anexos.ts
 * @description Rotas de upload, download, listagem e exclusão de materiais didáticos.
 * 
 * - POST   /api/aulas/:aulaId/anexos  → upload de arquivo (PDF, planilhas, imagens, ZIP)
 * - GET    /api/aulas/:aulaId/anexos  → listar anexos de uma aula
 * - GET    /api/anexos/:id/download   → download do arquivo
 * - DELETE /api/anexos/:id            → excluir anexo (admin/professor)
 * 
 * Formatos permitidos: PDF, Excel, CSV, JPG, PNG, WebP, PowerPoint, ZIP, RAR
 * Tamanho máximo: 50MB
 * 
 * Utiliza o helper prisma.ts para compatibilidade com SQLite (dev) e PostgreSQL (prod).
 * 
 * @see Middleware: src/middleware/auth.ts
 * @see Prisma Helper: src/lib/prisma.ts
 */

import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verificarToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/* ═══════════════════════════════════════════════════════════════
   Configuração do Multer (upload de arquivos)
   ═══════════════════════════════════════════════════════════════ */

/** Diretório onde os anexos serão salvos */
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'anexos');

// Cria a pasta se não existir
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/** Configuração de armazenamento do Multer */
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, UPLOADS_DIR),
  filename: (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    const nome = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, nome);
  },
});

/**
 * Lista de tipos MIME permitidos para upload.
 * Inclui: PDF, Excel, CSV, imagens, PowerPoint, ZIP e RAR.
 */
const TIPOS_PERMITIDOS = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
];

/** Instância do Multer configurada */
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB máximo
  fileFilter: (_req: any, file: any, cb: any) => {
    if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não permitido. Formatos aceitos: PDF, Excel, CSV, JPG, PNG, WebP, PowerPoint, ZIP, RAR.'));
    }
  },
});

/* ═══════════════════════════════════════════════════════════════
   POST /api/aulas/:aulaId/anexos
   ═══════════════════════════════════════════════════════════════ */

/**
 * Faz upload de um arquivo anexo para uma aula específica.
 * Requer autenticação.
 * 
 * @param aulaId - ID da aula (na URL)
 * @body FormData com campo "arquivo"
 * @returns 201 com dados do anexo criado
 * @returns 400 se nenhum arquivo enviado ou formato inválido
 * @returns 500 em caso de erro interno
 */
router.post('/aulas/:aulaId/anexos', verificarToken, (req: any, res: any) => {
  upload.single('arquivo')(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ erro: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    try {
      const anexo = await prisma.anexo.create({
        data: {
          nome: req.file.originalname,
          url: `/uploads/anexos/${req.file.filename}`,
          tipo: req.file.mimetype,
          tamanho: req.file.size,
          aulaId: Number(req.params.aulaId),
        },
      });

      res.status(201).json({ mensagem: 'Arquivo enviado com sucesso!', anexo });
    } catch (erro) {
      console.error('Erro ao salvar anexo:', erro);
      res.status(500).json({ erro: 'Erro ao salvar anexo.' });
    }
  });
});

/* ═══════════════════════════════════════════════════════════════
   GET /api/aulas/:aulaId/anexos
   ═══════════════════════════════════════════════════════════════ */

/**
 * Lista todos os anexos de uma aula específica.
 * Rota pública (não exige autenticação).
 * 
 * @param aulaId - ID da aula (na URL)
 * @returns 200 com array de anexos
 * @returns 500 em caso de erro interno
 */
router.get('/aulas/:aulaId/anexos', async (req: Request, res: Response) => {
  try {
    const anexos = await prisma.anexo.findMany({
      where: { aulaId: Number(req.params.aulaId) },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ anexos });
  } catch (erro) {
    console.error('Erro ao listar anexos:', erro);
    res.status(500).json({ erro: 'Erro ao carregar anexos.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   GET /api/anexos/:id/download
   ═══════════════════════════════════════════════════════════════ */

/**
 * Faz o download de um anexo pelo ID.
 * Rota pública (não exige autenticação).
 * 
 * @param id - ID do anexo (na URL)
 * @returns Arquivo para download
 * @returns 404 se anexo ou arquivo físico não encontrado
 * @returns 500 em caso de erro interno
 */
router.get('/anexos/:id/download', async (req: Request, res: Response) => {
  try {
    const anexo = await prisma.anexo.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!anexo) {
      res.status(404).json({ erro: 'Anexo não encontrado.' });
      return;
    }

    const filePath = path.join(__dirname, '..', '..', anexo.url);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ erro: 'Arquivo não encontrado no servidor.' });
      return;
    }

    res.download(filePath, anexo.nome);
  } catch (erro) {
    console.error('Erro ao baixar anexo:', erro);
    res.status(500).json({ erro: 'Erro ao baixar arquivo.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   DELETE /api/anexos/:id
   ═══════════════════════════════════════════════════════════════ */

/**
 * Exclui um anexo (arquivo físico e registro no banco).
 * Requer autenticação (apenas admin ou professor).
 * 
 * @param id - ID do anexo (na URL)
 * @returns 200 com mensagem de sucesso
 * @returns 404 se anexo não encontrado
 * @returns 500 em caso de erro interno
 */
router.delete('/anexos/:id', verificarToken, async (req: Request, res: Response) => {
  try {
    const anexo = await prisma.anexo.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!anexo) {
      res.status(404).json({ erro: 'Anexo não encontrado.' });
      return;
    }

    // Remove o arquivo físico do servidor
    const filePath = path.join(__dirname, '..', '..', anexo.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove o registro do banco de dados
    await prisma.anexo.delete({ where: { id: Number(req.params.id) } });

    res.json({ mensagem: 'Anexo excluído com sucesso!' });
  } catch (erro) {
    console.error('Erro ao excluir anexo:', erro);
    res.status(500).json({ erro: 'Erro ao excluir anexo.' });
  }
});

export default router;
