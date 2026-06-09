const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || error.statusCode);
  }

  return res.json();
}

import type {
  Curso, Modulo, Aula, Questao, PerfilGameficacao, Conversa, Mensagem, Usuario,
  ProfessorAnalytics, AdminFinanceiro, UsuarioAdmin, Matricula,
  Certificado, Plano, Assinatura, NextLessonsResponse, ProgressoCurso,
  NotaResponse, Recomendacao, Enrollment,
} from './types';

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
    criarAula: (moduleId: string, data: { title: string; type: string; order: number; content?: string; videoUrl?: string; free?: boolean }) =>
      request<Aula>(`/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
    atualizarAula: (id: string, data: { title?: string; content?: string; videoUrl?: string }) =>
      request<Aula>(`/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    removerAula: (id: string) => request<{ message: string }>(`/lessons/${id}`, { method: 'DELETE' }),

    comprar: (courseId: string) => request<{ purchase: any; enrolled: boolean }>(`/courses/${courseId}/purchase`, { method: 'POST' }),

    verificarAcesso: (courseId: string) =>
      request<{ hasAccess: boolean; needsPurchase: boolean; price: number; premium: boolean; certificateEnabled: boolean }>(`/courses/${courseId}/access`),
  },

  knowledge: {
    subjects: () => request<{ id: string; name: string; description?: string }[]>('/knowledge/subjects'),
    listarTopicos: () => request<{ id: string; name: string; subjectId: string; subject?: { id: string; name: string } }[]>('/knowledge/topics'),
  },

  learning: {
    modelo: (userId: string) => request<{ id: string; userId: string; topicId: string; proficiency: number; topic?: { id: string; name: string; subject?: { id: string; name: string } } }[]>(`/learning/model/${userId}`),
    diagnosticos: (userId: string) => request<any[]>(`/learning/diagnostics/${userId}`),
    criarDiagnostico: (userId: string) => request<any>(`/learning/diagnostics/${userId}`, { method: 'POST' }),
    matricular: (userId: string, courseId: string) =>
      request<Enrollment>('/learning/enroll', { method: 'POST', body: JSON.stringify({ userId, courseId }) }),
    verificarMatricula: (userId: string, courseId: string) =>
      request<Matricula>(`/learning/enrolled/${userId}/${courseId}`),
    matriculas: (userId: string) => request<Enrollment[]>(`/learning/enrollments/${userId}`),
    enviarTentativa: (data: { userId: string; questionId: string; selectedId: string; correct: boolean }) =>
      request<{ id: string }>('/learning/attempts', { method: 'POST', body: JSON.stringify(data) }),
    erros: (userId: string) => request<any[]>(`/learning/errors/${userId}`),
    limparErros: (userId: string) => request<{ message: string }>(`/learning/errors/${userId}/clear`, { method: 'POST' }),
    proximasAulas: (userId: string) => request<NextLessonsResponse>(`/learning/next-lessons/${userId}`),
    planoSemanal: (userId: string) => request<any>(`/learning/week-plan/${userId}`),
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
    criarQuestao: (data: { text: string; topicId: string; difficulty: string; bloomLevel: string; explanation?: string; alternatives: { text: string; isCorrect: boolean }[] }) =>
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
    cursoAlunos: (courseId: string) => request<any[]>(`/analytics/professor/courses/${courseId}/students`),
  },

  gamification: {
    perfil: (userId: string) => request<PerfilGameficacao>(`/gamification/profile/${userId}`),
    adicionarXp: (userId: string, amount: number) =>
      request<PerfilGameficacao>(`/gamification/profile/${userId}/xp/${amount}`, { method: 'POST' }),
    atualizarStreak: (userId: string) =>
      request<PerfilGameficacao>(`/gamification/profile/${userId}/streak`, { method: 'POST' }),
    leaderboard: (limit = 10) => request<any[]>(`/gamification/leaderboard?limit=${limit}`),
  },

  profile: {
    me: () => request<any>('/profile'),

    atualizar: (data: any) => request<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),

    publico: (id: string) => request<any>(`/profile/public/${id}`),
  },

  admin: {
    usuarios: () => request<UsuarioAdmin[]>('/usuarios'),
    usuario: (id: string) => request<UsuarioAdmin>(`/usuarios/${id}`),
    atualizarUsuario: (id: string, data: { name?: string; role?: string; university?: string; period?: number }) =>
      request<UsuarioAdmin>(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    removerUsuario: (id: string) => request<{ message: string }>(`/usuarios/${id}`, { method: 'DELETE' }),
  },

  questions: {
    listar: (params?: Record<string, string>) => request<any>(`/questions?${new URLSearchParams(params ?? {}).toString()}`),

    obter: (id: string) => request<any>(`/questions/${id}`),

    criar: (data: any) => request<any>('/questions', { method: 'POST', body: JSON.stringify(data) }),

    atualizar: (id: string, data: any) => request<any>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    remover: (id: string) => request<any>(`/questions/${id}`, { method: 'DELETE' }),

    arvore: () => request<any[]>('/questions/tree'),

    tags: () => request<any[]>('/questions/tags'),

    exames: (params?: Record<string, string>) => request<any>(`/questions/exams?${new URLSearchParams(params ?? {}).toString()}`),

    criarExame: (data: any) => request<any>('/questions/exams', { method: 'POST', body: JSON.stringify(data) }),

    stats: (id: string) => request<any>(`/questions/stats/${id}`),

    dominio: (topicId: string) => request<any>(`/questions/mastery/${topicId}`),

    simulado: (examId: string, limit = 10) => request<any>(`/questions/simulado/${examId}?limit=${limit}`),

    gerarComIA: (topicId: string, count = 3, difficulty?: string) =>
      request<any>(`/questions/generate/${topicId}`, { method: 'POST', body: JSON.stringify({ count, difficulty }) }),
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
