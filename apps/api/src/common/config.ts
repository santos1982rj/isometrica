export const CONFIG = {
  groq: {
    baseUrl: process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1',
    model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  },
  jwt: {
    expiration: process.env.JWT_EXPIRATION ?? '7d',
  },
  bcrypt: {
    saltRounds: 10,
  },
  bkt: {
    prior: 0.5,
    guess: 0.15,
    slip: 0.1,
    learnRate: 0.3,
    timeBonus: 0.05,
    hintPenalty: 0.1,
  },
  xp: {
    lesson: 50,
    question: 10,
  },
  pagination: {
    maxPerPage: 100,
  },
  ai: {
    maxHistoryMessages: 20,
    maxTokens: 600,
  },
  port: parseInt(process.env.PORT ?? '3001', 10),
  email: {
    from: process.env.EMAIL_FROM ?? 'Isométrica <noreply@isometrica.eng.br>',
  },
} as const
