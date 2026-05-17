/**
 * @file ia.ts
 * @description Rotas do assistente virtual de IA (G.A.M.A.).
 * 
 * Utiliza a API gratuita do Google Gemini para responder dúvidas
 * de engenharia no contexto das aulas e da NBR 6118:2023.
 * 
 * @route POST /api/ia/tutor
 */

import { Router, type Request, type Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

/* ═══════════════════════════════════════════════════════════════
   Configuração da IA
   ═══════════════════════════════════════════════════════════════ */

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY não configurada no .env');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

/** Modelo a ser utilizado (gratuito, até 1500 req/dia) */
const MODELO = 'gemini-2.0-flash';

/* ═══════════════════════════════════════════════════════════════
   POST /api/ia/tutor
   ═══════════════════════════════════════════════════════════════ */

/**
 * Recebe uma pergunta do aluno e retorna uma explicação no contexto
 * da aula atual e da NBR 6118:2023.
 * 
 * @body { pergunta: string, contextoAula?: string }
 * @returns 200 com { resposta: string }
 * @returns 400 se pergunta ausente
 * @returns 429 se cota excedida
 * @returns 500 em caso de erro interno
 */
router.post('/tutor', async (req: Request, res: Response) => {
  try {
    const { pergunta, contextoAula } = req.body as {
      pergunta: string;
      contextoAula?: string;
    };

    if (!pergunta || !pergunta.trim()) {
      res.status(400).json({ erro: 'Pergunta é obrigatória.' });
      return;
    }

    // Constrói o prompt do sistema (instruções para a IA)
    const systemPrompt = `
      Você é o "G.A.M.A." (Generative Armature Mentoring Assistant), um tutor especializado 
      em engenharia civil, especificamente em concreto armado e estruturas.
      
      Regras:
      - Responda de forma didática, como um professor explicando para um aluno.
      - Sempre que possível, cite itens da NBR 6118:2023.
      - Use exemplos práticos de dimensionamento.
      - Mantenha as respostas concisas (máximo 300 palavras).
      - Se a pergunta não for sobre engenharia civil, responda educadamente que seu foco é engenharia.
      - Utilize LaTeX inline ($...$) para fórmulas. NUNCA coloque espaços ou quebras de linha dentro dos delimitadores $...$.
      
      Contexto atual da aula que o aluno está assistindo:
      ${contextoAula || 'Nenhum contexto específico fornecido.'}
    `;

    // Obtém o modelo generativo
    const model = genAI.getGenerativeModel({ model: MODELO });

    // Gera o conteúdo com o prompt do sistema + pergunta do usuário
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido. Estou pronto para ajudar com dúvidas de engenharia civil e concreto armado, sempre citando a NBR 6118:2023 quando relevante.' }],
        },
      ],
    });

    const result = await chat.sendMessage(pergunta);
    const resposta = result.response.text();

    res.json({ resposta });
  } catch (erro: any) {
    console.error('Erro no tutor de IA:', erro);

    // Se a API key for inválida ou excedeu cota
    if (erro?.status === 429) {
      res.status(429).json({
        erro: 'Limite de requisições excedido. Tente novamente em alguns instantes.',
      });
      return;
    }

    if (erro?.status === 503) {
      res.status(503).json({
        erro: 'Serviço temporariamente indisponível. Tente novamente em alguns segundos.',
      });
      return;
    }

    if (erro?.message?.includes('API_KEY')) {
      res.status(500).json({
        erro: 'Configuração da IA incompleta. Contate o administrador.',
      });
      return;
    }

    res.status(500).json({ erro: 'Erro ao processar sua pergunta. Tente novamente.' });
  }
});

export default router;
