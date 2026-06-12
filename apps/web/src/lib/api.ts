import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/entrar')) {
      window.location.href = '/entrar';
    }
    throw new ApiError('Sessão expirada. Faça login novamente.', 401);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro na requisição', statusCode: res.status }));
    const message = error.message || error.statusCode || `Erro ${res.status}`;
    if (res.status >= 500) {
      console.error(`[API] ${res.status} ${path}:`, error);
    }
    throw new ApiError(message, res.status);
  }

  return res.json();
}

import type {
  Curso, Modulo, Aula, Questao, PerfilGameficacao, Conversa, Mensagem, Usuario,
  ProfessorAnalytics, AdminFinanceiro, UsuarioAdmin, Matricula,
  Certificado, Plano, Assinatura, NextLessonsResponse, ProgressoCurso,
  NotaResponse, Recomendacao, Enrollment,
  Diagnostic, WeekPlan, LeaderboardEntry, ProfileResponse, PublicProfileResponse,
  StudentAnalytics, EventLog, QuestionTreeItem, QuestionTag,
  ExamListResponse, ExamBoard, QuestionStats, TopicMastery,
  SimuladoResponse, PurchaseResponse, ImportQuestionsInput,
} from './types';

export interface ExamListItem {
  id: string
  title: string
  description: string | null
  board: string
  year: string | null
  questionCount: number
  createdAt: string
  difficulty: string | null
  area: string | null
  timeLimit: number | null
}

export interface ExamDetailResponse {
  id: string
  name: string
  board: string | null
  year: number | null
  difficulty: string | null
  area: string | null
  timeLimit: number | null
  questionCount: number
  questions?: {
    id: string
    text: string
    difficulty: string
    bloomLevel: string
    topic: { id: string; name: string; subject: { id: string; name: string } } | null
    alternatives: { id: string; text: string; isCorrect: boolean }[]
  }[]
}

export interface SimuladoStartResponse {
  sessionId: string
  exam: { id: string; name: string; timeLimit: number | null }
  totalQuestions: number
  questions: {
    questionId: string
    text: string
    difficulty: string
    topic: string
    alternatives: { id: string; text: string }[]
  }[]
  startedAt: string
}

export interface SimuladoResultResponse {
  sessionId: string
  examId: string
  score: number | null
  totalCorrect: number | null
  totalQuestions: number | null
  status: string
  startedAt: Date
  finishedAt: Date | null
  questions: {
    questionId: string
    text: string
    explanation: string | null
    difficulty: string
    topic: string | null
    subject: string | null
    alternatives: { id: string; text: string; isCorrect: boolean }[]
    selectedId: string | null
    correct: boolean | null
    timeSpent: number | null
  }[]
}

export const api = {
  auth: {
    cadastro: (data: { email: string; senha: string; nome?: string }) =>
      request<{ access_token: string; usuario: { id: string; email: string } }>('/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; senha: string }) =>
      request<{ access_token: string; usuario: { id: string; email: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    esqueceuSenha: (email: string) =>
      request<{ mensagem: string }>('/auth/esqueceu-senha', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    recuperarSenha: (token: string, novaSenha: string) =>
      request<{ mensagem: string }>('/auth/recuperar-senha', {
        method: 'POST',
        body: JSON.stringify({ token, novaSenha }),
      }),

    perfil: () => request<Usuario>('/auth/perfil'),

    logout: () => request<{ mensagem: string }>('/auth/logout', { method: 'POST' }),
  },

  courses: {
    listar: () => request<Curso[]>('/courses'),
    detalhe: (id: string) => request<Curso>(`/courses/${id}`),
    criar: (data: { name: string; description: string; category?: string; imageUrl?: string; color?: string; estimatedHours?: number; level?: string; premium?: boolean; certificateEnabled?: boolean; price?: number }) =>
      request<Curso>('/courses', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id: string, data: { name?: string; description?: string; imageUrl?: string; category?: string }) =>
      request<Curso>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remover: (id: string) => request<{ message: string }>(`/courses/${id}`, { method: 'DELETE' }),
    criarModulo: (courseId: string, data: { name: string; order: number }) =>
      request<Modulo>(`/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify(data) }),
    atualizarModulo: (id: string, data: { name?: string; order?: number }) =>
      request<Modulo>(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    removerModulo: (id: string) => request<{ message: string }>(`/modules/${id}`, { method: 'DELETE' }),
    criarAula: (moduleId: string, data: { title: string; type: string; order: number; content?: string; contentUrl?: string; free?: boolean }) =>
      request<Aula>(`/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
    atualizarAula: (id: string, data: { title?: string; content?: string; contentUrl?: string }) =>
      request<Aula>(`/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    removerAula: (id: string) => request<{ message: string }>(`/lessons/${id}`, { method: 'DELETE' }),

    comprar: (courseId: string) => request<PurchaseResponse>(`/courses/${courseId}/purchase`, { method: 'POST' }),

    verificarAcesso: (courseId: string) =>
      request<{ hasAccess: boolean; needsPurchase: boolean; price: number; premium: boolean; certificateEnabled: boolean }>(`/courses/${courseId}/access`),
  },

  knowledge: {
    subjects: () => request<{ id: string; name: string; description?: string }[]>('/knowledge/subjects'),
    listarTopicos: () => request<{ id: string; name: string; subjectId: string; subject?: { id: string; name: string } }[]>('/knowledge/topics'),
  },

  learning: {
    modelo: (userId: string) => request<{ id: string; userId: string; topicId: string; proficiency: number; topic?: { id: string; name: string; subject?: { id: string; name: string } } }[]>(`/learning/model/${userId}`),
    diagnosticos: (userId: string) => request<Diagnostic[]>(`/learning/diagnostics/${userId}`),
    criarDiagnostico: (userId: string) => request<Diagnostic>(`/learning/diagnostics/${userId}`, { method: 'POST' }),
    matricular: (userId: string, courseId: string) =>
      request<Enrollment>('/learning/enroll', { method: 'POST', body: JSON.stringify({ userId, courseId }) }),
    verificarMatricula: (userId: string, courseId: string) =>
      request<Matricula>(`/learning/enrolled/${userId}/${courseId}`),
    matriculas: (userId: string) => request<Enrollment[]>(`/learning/enrollments/${userId}`),
    enviarTentativa: (data: { userId: string; questionId: string; selectedId: string; correct: boolean }) =>
      request<{ id: string }>('/learning/attempts', { method: 'POST', body: JSON.stringify(data) }),
    erros: (userId: string) => request<Questao[]>(`/learning/errors/${userId}`),
    limparErros: (userId: string) => request<{ message: string }>(`/learning/errors/${userId}/clear`, { method: 'POST' }),
    proximasAulas: (userId: string) => request<NextLessonsResponse>(`/learning/next-lessons/${userId}`),
    planoSemanal: (userId: string) => request<WeekPlan>(`/learning/week-plan/${userId}`),
    salvarAnotacao: (userId: string, lessonId: string, notes: string) =>
      request<NotaResponse>('/learning/notes', { method: 'POST', body: JSON.stringify({ userId, lessonId, notes }) }),
    anotacao: (userId: string, lessonId: string) =>
      request<NotaResponse>(`/learning/notes/${userId}/${lessonId}`),
    marcarProgresso: (userId: string, lessonId: string, completed: boolean) =>
      request<{ id: string; completed: boolean }>('/learning/progress', { method: 'POST', body: JSON.stringify({ userId, lessonId, completed }) }),
    progressoCurso: (userId: string, courseId: string) =>
      request<ProgressoCurso>(`/learning/progress/${userId}/${courseId}`),
    gerarCertificado: (courseId: string) =>
      request<Certificado>(`/learning/certificate/${courseId}`, { method: 'POST' }),
    certificados: () => request<Certificado[]>(`/learning/certificates`),
  },

  conteudo: {
    aula: (id: string) => request<Aula>(`/lessons/${id}`),
    questoes: (id: string) => request<Questao[]>(`/lessons/${id}/questions`),
    criarQuestao: (data: ImportQuestionsInput) =>
      request<Questao>('/questions', { method: 'POST', body: JSON.stringify(data) }),
  },

  financeiro: {
    assinar: (userId: string, planId: string) =>
      request<Assinatura>('/financial/subscriptions', { method: 'POST', body: JSON.stringify({ userId, planId }) }),
    assinaturas: (userId: string) => request<Assinatura[]>(`/financial/subscriptions/${userId}`),
    planos: () => request<Plano[]>('/financial/plans'),
    adminOverview: () => request<AdminFinanceiro>('/financial/admin/overview'),
  },

  analytics: {
    professor: () => request<ProfessorAnalytics>('/analytics/professor'),
    cursoAlunos: (courseId: string) => request<StudentAnalytics[]>(`/analytics/professor/courses/${courseId}/students`),
    eventos: (userId: string) => request<EventLog[]>(`/analytics/events/${userId}`),
    sumario: () => request<{ type: string; _count: { id: number } }[]>('/analytics/summary'),
  },

  gamification: {
    perfil: (userId: string) => request<PerfilGameficacao>(`/gamification/profile/${userId}`),
    adicionarXp: (userId: string, amount: number) =>
      request<PerfilGameficacao>(`/gamification/profile/${userId}/xp/${amount}`, { method: 'POST' }),
    atualizarStreak: (userId: string) =>
      request<PerfilGameficacao>(`/gamification/profile/${userId}/streak`, { method: 'POST' }),
    leaderboard: (limit = 10) => request<LeaderboardEntry[]>(`/gamification/leaderboard?limit=${limit}`),
  },

  profile: {
    me: () => request<ProfileResponse>('/profile'),
    atualizar: (data: { name?: string; bio?: string; title?: string; university?: string; period?: number; lattes?: string; linkedin?: string; instagram?: string; twitter?: string; imageUrl?: string }) =>
      request<ProfileResponse>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
    publico: (id: string) => request<PublicProfileResponse>(`/profile/public/${id}`),
  },

  admin: {
    usuarios: () => request<UsuarioAdmin[]>('/usuarios'),
    usuario: (id: string) => request<UsuarioAdmin>(`/usuarios/${id}`),
    atualizarUsuario: (id: string, data: { name?: string; role?: string; university?: string; period?: number }) =>
      request<UsuarioAdmin>(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    removerUsuario: (id: string) => request<{ message: string }>(`/usuarios/${id}`, { method: 'DELETE' }),
  },

  questions: {
    listar: (params?: Record<string, string>) => request<{ data: Questao[]; total: number; page: number; totalPages: number }>(`/questions?${new URLSearchParams(params ?? {}).toString()}`),
    obter: (id: string) => request<Questao>(`/questions/${id}`),
    criar: (data: { text: string; topicId: string; difficulty: string; bloomLevel: string; explanation?: string; alternatives: { text: string; isCorrect: boolean }[] }) =>
      request<Questao>('/questions', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id: string, data: Partial<{ text: string; topicId: string; difficulty: string; bloomLevel: string; explanation: string; alternatives: { text: string; isCorrect: boolean }[] }>) =>
      request<Questao>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remover: (id: string) => request<{ message: string }>(`/questions/${id}`, { method: 'DELETE' }),
    arvore: () => request<QuestionTreeItem[]>('/questions/tree'),
    tags: () => request<QuestionTag[]>('/questions/tags'),
    exames: (params?: Record<string, string>) => request<{ data: ExamListItem[]; total: number; page: number; totalPages: number }>(`/questions/exams?${new URLSearchParams(params ?? {}).toString()}`),
    criarExame: (data: { name: string; board?: string; year?: number; timeLimit?: number; difficulty?: string; area?: string; questionIds?: string[] }) =>
      request<ExamDetailResponse>('/questions/exams', { method: 'POST', body: JSON.stringify(data) }),
    boards: () => request<string[]>('/questions/exams/boards'),
    obterExame: (id: string) => request<ExamDetailResponse>(`/questions/exams/${id}`),
    atualizarExame: (id: string, data: Record<string, unknown>) => request<ExamDetailResponse>(`/questions/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    removerExame: (id: string) => request<{ message: string }>(`/questions/exams/${id}`, { method: 'DELETE' }),
    stats: (id: string) => request<QuestionStats>(`/questions/stats/${id}`),
    dominio: (topicId: string) => request<TopicMastery>(`/questions/mastery/${topicId}`),
    simulado: (examId: string, limit = 10) => request<SimuladoResponse>(`/questions/simulado/${examId}?limit=${limit}`),
    iniciarSimulado: (examId: string) => request<SimuladoStartResponse>(`/questions/simulado/${examId}/start`, { method: 'POST' }),
    submeterSimulado: (sessionId: string, answers: { questionId: string; selectedId: string | null; timeSpent: number }[]) =>
      request<SimuladoResultResponse>(`/questions/simulado/${sessionId}/submit`, { method: 'PUT', body: JSON.stringify({ answers }) }),
    resultadoSimulado: (sessionId: string) => request<SimuladoResultResponse>(`/questions/simulado/${sessionId}/result`),
    gerarComIA: (topicId: string, count = 3, difficulty?: string) =>
      request<Questao[]>(`/questions/generate/${topicId}`, { method: 'POST', body: JSON.stringify({ count, difficulty }) }),
  },

  ai: {
    conversas: (userId: string) => request<Conversa[]>(`/ai/conversations/user/${userId}`),
    criarConversa: (userId: string, titulo?: string) =>
      request<Conversa>('/ai/conversations', { method: 'POST', body: JSON.stringify({ userId, title: titulo }) }),
    enviarMensagem: (conversaId: string, role: string, content: string) =>
      request<Mensagem>(`/ai/conversations/${conversaId}/messages`, { method: 'POST', body: JSON.stringify({ role, content }) }),
    obterConversa: (id: string) => request<Conversa>(`/ai/conversations/${id}`),
  },
};
