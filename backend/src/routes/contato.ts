/**
 * @file contato.ts
 * @description Rota de contato do site.
 * 
 * - POST /api/contato → envia mensagem de contato
 */

import { Router, type Request, type Response } from 'express';

const router = Router();

/* ═══════════════════════════════════════════════════════════════
   POST /api/contato
   ═══════════════════════════════════════════════════════════════ */

/**
 * Recebe uma mensagem de contato do formulário do site.
 * Por enquanto, apenas registra no console. Futuro: enviar email.
 * 
 * @body { nome: string, email: string, assunto?: string, mensagem: string }
 * @returns 200 com mensagem de confirmação
 * @returns 400 se campos obrigatórios ausentes
 * @returns 500 em caso de erro interno
 */
router.post('/contato', async (req: Request, res: Response) => {
  try {
    const { nome, email, assunto, mensagem } = req.body;

    if (!nome || !email || !mensagem) {
      res.status(400).json({ erro: 'Nome, email e mensagem são obrigatórios.' });
      return;
    }

    // Registra a mensagem no console (futuro: integrar com serviço de email)
    console.log('📬 Nova mensagem de contato:');
    console.log(`   Nome: ${nome}`);
    console.log(`   Email: ${email}`);
    console.log(`   Assunto: ${assunto || 'Contato pelo site'}`);
    console.log(`   Mensagem: ${mensagem}`);

    res.json({
      mensagem: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
    });
  } catch (erro) {
    console.error('Erro ao processar contato:', erro);
    res.status(500).json({ erro: 'Erro ao enviar mensagem.' });
  }
});

export default router;
