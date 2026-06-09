export const APP_NAME = 'Isométrica';
export const APP_DESCRIPTION = 'Plataforma inteligente de evolução acadêmica para Engenharia';

export const API_ROUTES = {
  AUTH: {
    CADASTRO: '/auth/cadastro',
    LOGIN: '/auth/login',
    ESQUECEU_SENHA: '/auth/esqueceu-senha',
    RECUPERAR_SENHA: '/auth/recuperar-senha',
    PERFIL: '/auth/perfil',
  },
  COURSES: {
    LIST: '/courses',
    DETAIL: (id: string) => `/courses/${id}`,
    SEARCH: (q: string) => `/courses/search/${encodeURIComponent(q)}`,
  },
  LEARNING: {
    ENROLL: '/learning/enroll',
    PROGRESS: '/learning/progress',
    NEXT_LESSONS: (userId: string) => `/learning/next-lessons/${userId}`,
    ATTEMPTS: '/learning/attempts',
    CERTIFICATES: '/learning/certificates',
    ERROR: (userId: string) => `/learning/errors/${userId}`,
  },
  QUESTIONS: {
    LIST: '/questions',
    TREE: '/questions/tree',
    TAGS: '/questions/tags',
    EXAMS: '/questions/exams',
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  LEADERBOARD_LIMIT: 50,
  REVIEW_LIMIT: 20,
} as const;
