/**
 * @file upload.ts
 * @description Rota de upload de imagens JPG para cursos.
 * 
 * - POST /api/upload/imagem → upload de imagem JPG (máx 2MB)
 * 
 * As imagens são salvas em /uploads/cursos/ e ficam acessíveis publicamente.
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

/* ═══════════════════════════════════════════════════════════════
   Configuração do Multer (upload de imagens)
   ═══════════════════════════════════════════════════════════════ */

/** Diretório onde as imagens dos cursos serão salvas */
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'cursos');

// Cria a pasta se não existir
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/** Configuração de armazenamento do Multer */
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, UPLOADS_DIR),
  filename: (_req: any, _file: any, cb: any) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    cb(null, uniqueName);
  },
});

/** Instância do Multer configurada para imagens JPG */
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
  fileFilter: (_req: any, file: any, cb: any) => {
    const isJpg = file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg';
    if (isJpg) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPG são permitidas.'));
    }
  },
});

/* ═══════════════════════════════════════════════════════════════
   POST /api/upload/imagem
   ═══════════════════════════════════════════════════════════════ */

/**
 * Faz upload de uma imagem JPG para a pasta /uploads/cursos/
 * e retorna a URL pública da imagem.
 * 
 * @body FormData com campo "imagem"
 * @returns 200 com URL da imagem e mensagem de sucesso
 * @returns 400 se nenhuma imagem enviada, formato inválido ou arquivo muito grande
 */
router.post('/imagem', (req: any, res: any) => {
  upload.single('imagem')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ erro: 'Apenas imagens JPG são permitidas (máx 2MB).' });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
    }

    const url = `/uploads/cursos/${req.file.filename}`;

    res.json({ url, mensagem: 'Imagem enviada com sucesso!' });
  });
});

export default router;
